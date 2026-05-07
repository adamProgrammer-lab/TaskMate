import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  /** Clave usada para guardar el array de tareas en localStorage. */
  private readonly STORAGE_KEY = 'taskmate_tasks';
  /** Clave usada para recordar el siguiente identificador disponible. */
  private readonly NEXT_ID_KEY = 'taskmate_nextId';

  /** Fuente de verdad en memoria para toda la aplicacion. */
  private tasks: Task[] = [];
  /** Contador incremental para asignar ids unicos a nuevas tareas. */
  private nextId = 1;

  /** Carga las tareas guardadas o prepara los datos demo del primer arranque. */
  constructor() {
    this.loadFromStorage();
  }

  /** Crea el listado inicial que se muestra la primera vez que se abre la app. */
  private createInitialTasks(): Task[] {
    return [
      {
        id: 1,
        title: 'Aprender Ionic',
        description: 'Completar el Sprint 3',
        priority: 'alta',
        completed: false,
        createdAt: new Date(),
        category: 'estudio',
      },
      {
        id: 2,
        title: 'Hacer ejercicio',
        description: '30 minutos de cardio',
        priority: 'media',
        completed: true,
        createdAt: new Date(),
        category: 'personal',
      },
      {
        id: 3,
        title: 'Leer libro',
        description: 'Clean Code - capitulo 3',
        priority: 'baja',
        completed: false,
        createdAt: new Date(),
        category: 'personal',
      },
    ];
  }

  /** Guarda el estado actual del servicio en localStorage para mantenerlo tras recargar. */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    localStorage.setItem(this.NEXT_ID_KEY, String(this.nextId));
  }

  /** Recupera tareas y contador desde localStorage y rehidrata las fechas. */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.tasks = this.createInitialTasks();
      this.nextId = this.calculateNextId();
      return;
    }

    const savedTasks = localStorage.getItem(this.STORAGE_KEY);
    const savedNextId = localStorage.getItem(this.NEXT_ID_KEY);

    if (!savedTasks) {
      this.tasks = this.createInitialTasks();
      this.nextId = this.calculateNextId();
      this.saveToStorage();
      return;
    }

    try {
      const parsedTasks = JSON.parse(savedTasks) as Array<Omit<Task, 'createdAt'> & { createdAt: string }>;

      this.tasks = parsedTasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }));

      this.nextId = savedNextId ? Number.parseInt(savedNextId, 10) : this.calculateNextId();

      if (Number.isNaN(this.nextId) || this.nextId < 1) {
        this.nextId = this.calculateNextId();
      }
    } catch {
      this.tasks = this.createInitialTasks();
      this.nextId = this.calculateNextId();
      this.saveToStorage();
    }
  }

  /** Calcula el siguiente id libre a partir de las tareas cargadas actualmente. */
  private calculateNextId(): number {
    return this.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
  }

  /** Genera una copia superficial de una tarea para evitar mutaciones externas. */
  private cloneTask(task: Task): Task {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
    };
  }

  /** Devuelve una copia de todas las tareas almacenadas. */
  getTasks(): Task[] {
    return this.tasks.map((task) => this.cloneTask(task));
  }

  /** Busca una tarea concreta por su identificador. */
  getTaskById(id: number): Task | undefined {
    const task = this.tasks.find((item) => item.id === id);
    return task ? this.cloneTask(task) : undefined;
  }

  /** Crea una nueva tarea y la anade al listado global. */
  addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = {
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
    };

    this.tasks.push(task);
    this.saveToStorage();
    return this.cloneTask(task);
  }

  /** Cambia el estado completado de la tarea indicada. */
  toggleComplete(id: number): void {
    const task = this.tasks.find((item) => item.id === id);

    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
    }
  }

  /** Elimina la tarea indicada del listado. */
  deleteTask(id: number): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveToStorage();
  }

  /** Limpia todas las tareas y reinicia el contador local. */
  clearAll(): void {
    this.tasks = [];
    this.nextId = 1;
    this.saveToStorage();
  }

  /** Devuelve las tareas filtradas por prioridad. */
  getTasksByPriority(priority: Task['priority']): Task[] {
    return this.tasks
      .filter((task) => task.priority === priority)
      .map((task) => this.cloneTask(task));
  }

  /** Calcula un resumen rapido del estado actual de las tareas. */
  getStats(): { completed: number; pending: number; total: number } {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter((task) => task.completed).length,
      pending: this.tasks.filter((task) => !task.completed).length,
    };
  }
}
