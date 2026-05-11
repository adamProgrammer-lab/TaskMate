import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskPayload, TaskPriority, TaskStats } from '../models/task.model';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  page?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiTask {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  completed: boolean | number;
  createdAt: string;
  category?: string | null;
}

export interface TaskQueryOptions {
  limit?: number;
  page?: number;
  priority?: TaskPriority;
  search?: string;
  status?: 'all' | 'done' | 'pending';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /** URL base del backend Node.js consumido por Ionic. */
  private readonly apiUrl = environment.apiUrl;

  /** Construye los parametros de consulta para filtros y paginacion. */
  private buildParams(options?: TaskQueryOptions): HttpParams {
    let params = new HttpParams();

    if (!options) {
      return params;
    }

    if (options.search) {
      params = params.set('search', options.search);
    }

    if (options.status && options.status !== 'all') {
      params = params.set('status', options.status);
    }

    if (options.priority) {
      params = params.set('priority', options.priority);
    }

    if (options.page) {
      params = params.set('page', String(options.page));
    }

    if (options.limit) {
      params = params.set('limit', String(options.limit));
    }

    return params;
  }

  /** Pide al backend el listado de tareas con filtros opcionales. */
  getTasks(options?: TaskQueryOptions): Observable<ApiResponse<ApiTask[]>> {
    return this.http.get<ApiResponse<ApiTask[]>>(`${this.apiUrl}/tasks`, {
      params: this.buildParams(options),
    });
  }

  /** Recupera una tarea concreta por identificador. */
  getTaskById(id: number): Observable<ApiResponse<ApiTask>> {
    return this.http.get<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks/${id}`);
  }

  /** Crea una nueva tarea persistida en la base de datos. */
  createTask(task: TaskPayload): Observable<ApiResponse<ApiTask>> {
    return this.http.post<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks`, task);
  }

  /** Actualiza una tarea ya existente en el backend. */
  updateTask(id: number, task: Partial<TaskPayload>): Observable<ApiResponse<ApiTask>> {
    return this.http.put<ApiResponse<ApiTask>>(`${this.apiUrl}/tasks/${id}`, task);
  }

  /** Elimina la tarea indicada en la API REST. */
  deleteTask(id: number): Observable<ApiResponse<{ id: number }>> {
    return this.http.delete<ApiResponse<{ id: number }>>(`${this.apiUrl}/tasks/${id}`);
  }

  /** Borra todas las tareas almacenadas en el backend. */
  clearTasks(): Observable<ApiResponse<{ deleted: number }>> {
    return this.http.delete<ApiResponse<{ deleted: number }>>(`${this.apiUrl}/tasks`);
  }

  /** Recupera las estadisticas agregadas del backend. */
  getTaskStats(): Observable<ApiResponse<TaskStats>> {
    return this.http.get<ApiResponse<TaskStats>>(`${this.apiUrl}/tasks/stats`);
  }
}
