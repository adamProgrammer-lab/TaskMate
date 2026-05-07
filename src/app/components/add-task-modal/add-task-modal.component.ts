import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

type NewTaskPayload = Omit<Task, 'id' | 'createdAt'>;

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  imports: [
    NgIf,
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class AddTaskModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalController = inject(ModalController);
  private readonly taskService = inject(TaskService);

  /** Formulario reactivo que centraliza valores y validaciones del modal. */
  taskForm!: FormGroup;

  /** Inicializa el formulario reactivo con validaciones de negocio basicas. */
  ngOnInit(): void {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      priority: ['media', Validators.required],
      category: ['personal', Validators.required],
    });
  }

  /** Devuelve el mensaje de error visible para el titulo. */
  get titleError(): string {
    const control = this.taskForm.get('title');

    if (control?.hasError('required')) {
      return 'El titulo es obligatorio';
    }

    if (control?.hasError('minlength')) {
      return 'Minimo 3 caracteres';
    }

    if (control?.hasError('maxlength')) {
      return 'Maximo 100 caracteres';
    }

    return '';
  }

  /** Devuelve el mensaje de error visible para la descripcion. */
  get descriptionError(): string {
    const control = this.taskForm.get('description');

    if (control?.hasError('maxlength')) {
      return 'Maximo 500 caracteres';
    }

    return '';
  }

  /** Comprueba si un campo ya debe mostrarse como invalido en la vista. */
  isControlInvalid(controlName: string): boolean {
    const control = this.taskForm.get(controlName);
    return Boolean(control?.invalid && control?.touched);
  }

  /** Cierra el modal sin crear ninguna tarea. */
  close(): void {
    void this.modalController.dismiss(undefined, 'cancel');
  }

  /** Guarda la tarea validada en el servicio y devuelve el resultado al componente padre. */
  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue() as Omit<NewTaskPayload, 'completed'>;
    const task = this.taskService.addTask({
      ...formValue,
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      category: formValue.category?.trim() || undefined,
      completed: false,
    });

    void this.modalController.dismiss(task, 'confirm');
  }
}
