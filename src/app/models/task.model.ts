export type TaskPriority = 'alta' | 'media' | 'baja';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: Date;
  category?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  byPriority?: Record<TaskPriority, number>;
}

export type TaskPayload = Omit<Task, 'id' | 'createdAt'>;
