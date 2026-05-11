/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { Task, TaskStats } from '../models/task.model';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        {
          provide: ApiService,
          useValue: {
            getTasks: () =>
              of({
                success: true,
                data: [
                  {
                    id: 1,
                    title: 'Preparar API',
                    description: 'Conectar Express',
                    completed: 0,
                    priority: 'alta',
                    category: 'trabajo',
                    createdAt: '2026-05-07T18:00:00.000Z',
                  },
                ],
              }),
            getTaskStats: () =>
              of({
                success: true,
                data: {
                  total: 4,
                  completed: 1,
                  pending: 3,
                  byPriority: {
                    alta: 2,
                    media: 1,
                    baja: 1,
                  },
                },
              }),
          },
        },
      ],
    });

    service = TestBed.inject(TaskService);
  });

  it('should map API tasks to frontend tasks with Date instances', () => {
    let tasks: Task[] = [];

    service.getTasks().subscribe((response) => {
      tasks = response;
    });

    expect(tasks.length).toBe(1);
    expect(tasks[0].createdAt instanceof Date).toBeTrue();
    expect(tasks[0].createdAt.toISOString()).toBe('2026-05-07T18:00:00.000Z');
  });

  it('should request stats through ApiService and expose the mapped result', () => {
    let stats: TaskStats | undefined;

    service.getStats().subscribe((response) => {
      stats = response;
    });

    expect(stats?.total).toBe(4);
    expect(stats?.pending).toBe(3);
    expect(stats?.byPriority?.alta).toBe(2);
  });
});
