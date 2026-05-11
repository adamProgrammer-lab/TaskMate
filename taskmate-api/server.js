require('dotenv').config();

const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedPriorities = new Set(['alta', 'media', 'baja']);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : true,
  }),
);
app.use(express.json());

function sendSuccess(res, statusCode, data, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extra,
  });
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeOptionalText(value, maxLength, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, `El campo ${fieldName} debe ser texto.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw createHttpError(400, `El campo ${fieldName} supera el maximo permitido.`);
  }

  return trimmed || null;
}

function validateTaskPayload(payload, { partial = false } = {}) {
  const sanitized = {};

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'title')) {
    if (typeof payload.title !== 'string') {
      throw createHttpError(400, 'El titulo es obligatorio.');
    }

    const title = payload.title.trim();

    if (title.length < 3 || title.length > 200) {
      throw createHttpError(400, 'El titulo debe tener entre 3 y 200 caracteres.');
    }

    sanitized.title = title;
  }

  const description = sanitizeOptionalText(payload.description, 500, 'descripcion');
  if (description !== undefined) {
    sanitized.description = description;
  } else if (!partial) {
    sanitized.description = null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'priority')) {
    const priority = payload.priority ?? 'media';

    if (!allowedPriorities.has(priority)) {
      throw createHttpError(400, 'La prioridad indicada no es valida.');
    }

    sanitized.priority = priority;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'completed')) {
    const completed = payload.completed ?? false;

    if (typeof completed !== 'boolean') {
      throw createHttpError(400, 'El campo completed debe ser booleano.');
    }

    sanitized.completed = completed;
  }

  const category = sanitizeOptionalText(payload.category, 100, 'categoria');
  if (category !== undefined) {
    sanitized.category = category;
  } else if (!partial) {
    sanitized.category = null;
  }

  if (partial && Object.keys(sanitized).length === 0) {
    throw createHttpError(400, 'No se recibieron campos para actualizar.');
  }

  return sanitized;
}

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: Boolean(row.completed),
    priority: row.priority,
    category: row.category,
    createdAt: row.createdAt,
  };
}

async function findTaskById(id) {
  const [rows] = await pool.query(
    `SELECT id, title, description, completed, priority, category, created_at AS createdAt
     FROM tasks
     WHERE id = ?`,
    [id],
  );

  return rows[0] ? mapTask(rows[0]) : null;
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'TaskMate API en funcionamiento.',
    endpoints: ['/health', '/health/db', '/tasks'],
  });
});

app.get('/health/db', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/tasks/stats', async (_req, res, next) => {
  try {
    const [summaryRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS pending
       FROM tasks`,
    );

    const [priorityRows] = await pool.query(
      `SELECT priority, COUNT(*) AS total
       FROM tasks
       GROUP BY priority`,
    );

    const byPriority = {
      alta: 0,
      media: 0,
      baja: 0,
    };

    priorityRows.forEach((row) => {
      byPriority[row.priority] = row.total;
    });

    return sendSuccess(res, 200, {
      total: Number(summaryRows[0].total || 0),
      completed: Number(summaryRows[0].completed || 0),
      pending: Number(summaryRows[0].pending || 0),
      byPriority,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/tasks', async (req, res, next) => {
  try {
    const whereClauses = [];
    const values = [];

    if (req.query.status === 'pending') {
      whereClauses.push('completed = 0');
    } else if (req.query.status === 'done') {
      whereClauses.push('completed = 1');
    }

    if (req.query.priority) {
      if (!allowedPriorities.has(req.query.priority)) {
        throw createHttpError(400, 'El filtro de prioridad no es valido.');
      }

      whereClauses.push('priority = ?');
      values.push(req.query.priority);
    }

    if (req.query.search) {
      whereClauses.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
      values.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let paginationSql = '';
    let page = null;
    let limit = null;
    let totalPages = null;
    let total = null;

    if (req.query.page !== undefined || req.query.limit !== undefined) {
      page = Number.parseInt(String(req.query.page || '1'), 10);
      limit = Number.parseInt(String(req.query.limit || '10'), 10);

      if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
        throw createHttpError(400, 'Los parametros page y limit deben ser numeros positivos.');
      }

      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM tasks
         ${whereSql}`,
        values,
      );

      total = Number(countRows[0].total || 0);
      totalPages = total === 0 ? 0 : Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      paginationSql = 'LIMIT ? OFFSET ?';
      values.push(limit, offset);
    }

    const [rows] = await pool.query(
      `SELECT id, title, description, completed, priority, category, created_at AS createdAt
       FROM tasks
       ${whereSql}
       ORDER BY created_at DESC
       ${paginationSql}`.trim(),
      values,
    );

    return sendSuccess(
      res,
      200,
      rows.map((row) => mapTask(row)),
      total !== null ? { page, total, totalPages } : {},
    );
  } catch (error) {
    next(error);
  }
});

app.get('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id < 1) {
      throw createHttpError(400, 'El identificador de la tarea no es valido.');
    }

    const task = await findTaskById(id);

    if (!task) {
      throw createHttpError(404, 'La tarea solicitada no existe.');
    }

    return sendSuccess(res, 200, task);
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', async (req, res, next) => {
  try {
    const data = validateTaskPayload(req.body);

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, completed, priority, category)
       VALUES (?, ?, ?, ?, ?)`,
      [data.title, data.description, data.completed, data.priority, data.category],
    );

    const task = await findTaskById(result.insertId);
    return sendSuccess(res, 201, task);
  } catch (error) {
    next(error);
  }
});

app.put('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id < 1) {
      throw createHttpError(400, 'El identificador de la tarea no es valido.');
    }

    const currentTask = await findTaskById(id);

    if (!currentTask) {
      throw createHttpError(404, 'La tarea solicitada no existe.');
    }

    const data = validateTaskPayload(req.body, { partial: true });
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    await pool.query(
      `UPDATE tasks
       SET ${fields.join(', ')}
       WHERE id = ?`,
      values,
    );

    const updatedTask = await findTaskById(id);
    return sendSuccess(res, 200, updatedTask);
  } catch (error) {
    next(error);
  }
});

app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id < 1) {
      throw createHttpError(400, 'El identificador de la tarea no es valido.');
    }

    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw createHttpError(404, 'La tarea solicitada no existe.');
    }

    return sendSuccess(res, 200, { id });
  } catch (error) {
    next(error);
  }
});

app.delete('/tasks', async (_req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks');
    return sendSuccess(res, 200, { deleted: result.affectedRows });
  } catch (error) {
    next(error);
  }
});

app.use((_req, _res, next) => {
  next(createHttpError(404, 'Ruta no encontrada.'));
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;

  res.status(status).json({
    success: false,
    message: error.message || 'Error interno del servidor.',
  });
});

app.listen(port, () => {
  console.log(`TaskMate API escuchando en http://127.0.0.1:${port}`);
});
