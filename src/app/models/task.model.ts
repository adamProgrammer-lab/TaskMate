export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  createdAt: Date;
  category?: string;
}
