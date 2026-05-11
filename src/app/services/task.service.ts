import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Task, TaskPayload, TaskPriority, TaskStats } from '../models/task.model';
import { ApiService, ApiTask, TaskQueryOptions } from './api.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiService = inject(ApiService);

  /** Convierte una tarea de la API al modelo de dominio del frontend. */
  private mapTask(task: ApiTask): Task {
    return {
      ...task,
      completed: Boolean(task.completed),
      createdAt: new Date(task.createdAt),
      description: task.description || undefined,
      category: task.category || undefined,
    };
  }

  /** Obtiene todas las tareas visibles desde la API. */
  getTasks(options?: TaskQueryOptions): Observable<Task[]> {
    return this.apiService
      .getTasks(options)
      .pipe(map((response) => response.data.map((task) => this.mapTask(task))));
  }

  /** Obtiene una tarea concreta por id desde la API. */
  getTaskById(id: number): Observable<Task> {
    return this.apiService
      .getTaskById(id)
      .pipe(map((response) => this.mapTask(response.data)));
  }

  /** Crea una nueva tarea persistida en la base de datos. */
  addTask(data: TaskPayload): Observable<Task> {
    return this.apiService
      .createTask(data)
      .pipe(map((response) => this.mapTask(response.data)));
  }

  /** Actualiza una tarea existente con los cambios enviados desde la UI. */
  updateTask(id: number, data: Partial<TaskPayload>): Observable<Task> {
    return this.apiService
      .updateTask(id, data)
      .pipe(map((response) => this.mapTask(response.data)));
  }

  /** Cambia el estado completado de una tarea usando la API REST. */
  toggleComplete(task: Task): Observable<Task> {
    return this.updateTask(task.id, {
      completed: !task.completed,
    });
  }

  /** Elimina la tarea indicada del backend. */
  deleteTask(id: number): Observable<void> {
    return this.apiService.deleteTask(id).pipe(map(() => void 0));
  }

  /** Elimina todas las tareas guardadas en la base de datos. */
  clearAll(): Observable<void> {
    return this.apiService.clearTasks().pipe(map(() => void 0));
  }

  /** Recupera solo las tareas de una prioridad concreta. */
  getTasksByPriority(priority: TaskPriority): Observable<Task[]> {
    return this.getTasks({ priority });
  }

  /** Recupera el resumen agregado del tablero principal. */
  getStats(): Observable<TaskStats> {
    return this.apiService.getTaskStats().pipe(map((response) => response.data));
  }
}
