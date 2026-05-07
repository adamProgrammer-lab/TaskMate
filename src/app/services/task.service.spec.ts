/// <reference types="jasmine" />

import { TaskService } from './task.service';

describe('TaskService', () => {
  const storageKey = 'taskmate_tasks';
  const nextIdKey = 'taskmate_nextId';

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(nextIdKey);
  });

  it('should persist tasks after adding a new one', () => {
    const service = new TaskService();

    const createdTask = service.addTask({
      title: 'Preparar entrega',
      description: 'Revisar capturas',
      priority: 'alta',
      completed: false,
      category: 'estudio',
    });

    const savedTasks = JSON.parse(localStorage.getItem(storageKey) || '[]') as Array<{ id: number }>;

    expect(savedTasks.some((task) => task.id === createdTask.id)).toBeTrue();
    expect(localStorage.getItem(nextIdKey)).toBe(String(createdTask.id + 1));
  });

  it('should restore dates as Date instances when loading from storage', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 9,
          title: 'Recuperada',
          description: 'Desde localStorage',
          priority: 'media',
          completed: false,
          createdAt: '2026-05-07T10:00:00.000Z',
          category: 'personal',
        },
      ]),
    );
    localStorage.setItem(nextIdKey, '10');

    const service = new TaskService();
    const restoredTask = service.getTaskById(9);

    expect(restoredTask).toBeDefined();
    expect(restoredTask?.createdAt instanceof Date).toBeTrue();
    expect(restoredTask?.createdAt.toISOString()).toBe('2026-05-07T10:00:00.000Z');
  });
});
