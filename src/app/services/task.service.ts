import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Aprender Ionic',
      description: 'Completar el Sprint 2',
      priority: 'alta',
      completed: false,
      createdAt: new Date(),
      category: 'Estudio',
    },
    {
      id: 2,
      title: 'Hacer ejercicio',
      description: '30 minutos de cardio',
      priority: 'media',
      completed: true,
      createdAt: new Date(),
      category: 'Salud',
    },
    {
      id: 3,
      title: 'Leer libro',
      description: 'Clean Code - capitulo 3',
      priority: 'baja',
      completed: false,
      createdAt: new Date(),
      category: 'Lectura',
    },
  ];

  private nextId = 4;

  /** Genera una copia superficial de una tarea para evitar mutaciones externas. */
  private cloneTask(task: Task): Task {
    return { ...task };
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
    return this.cloneTask(task);
  }

  /** Cambia el estado completado de la tarea indicada. */
  toggleComplete(id: number): void {
    const task = this.tasks.find((item) => item.id === id);

    if (task) {
      task.completed = !task.completed;
    }
  }

  /** Elimina la tarea indicada del listado. */
  deleteTask(id: number): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
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
