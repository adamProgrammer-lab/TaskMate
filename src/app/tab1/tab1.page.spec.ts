/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';

import { Tab1Page } from './tab1.page';
import { TaskService } from '../services/task.service';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab1Page],
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

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
