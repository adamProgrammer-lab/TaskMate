/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

import { Tab3Page } from './tab3.page';
import { TaskService } from '../services/task.service';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab3Page],
      providers: [
        {
          provide: TaskService,
          useValue: {
            clearAll: () => of(void 0),
          },
        },
        {
          provide: AlertController,
          useValue: { create: jasmine.createSpy('create') },
        },
        {
          provide: ToastController,
          useValue: { create: jasmine.createSpy('create') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
