/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular/standalone';

import { Tab2Page } from './tab2.page';
import { TaskService } from '../services/task.service';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab2Page],
      providers: [
        provideRouter([]),
        TaskService,
        {
          provide: ModalController,
          useValue: { create: jasmine.createSpy('create') },
        },
        {
          provide: ToastController,
          useValue: { create: jasmine.createSpy('create') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
