/// <reference types="jasmine" />

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let httpMock: HttpTestingController;
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request tasks from the backend base URL', () => {
    service.getTasks().subscribe();

    const request = httpMock.expectOne('http://localhost:3000/tasks');
    expect(request.request.method).toBe('GET');

    request.flush({ success: true, data: [] });
  });

  it('should create tasks through the backend POST endpoint', () => {
    service
      .createTask({
        title: 'Nueva tarea',
        description: 'Guardar en MySQL',
        priority: 'media',
        completed: false,
        category: 'estudio',
      })
      .subscribe();

    const request = httpMock.expectOne('http://localhost:3000/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.title).toBe('Nueva tarea');

    request.flush({
      success: true,
      data: {
        id: 10,
        title: 'Nueva tarea',
        description: 'Guardar en MySQL',
        priority: 'media',
        completed: false,
        category: 'estudio',
        createdAt: '2026-05-11T10:00:00.000Z',
      },
    });
  });
});
