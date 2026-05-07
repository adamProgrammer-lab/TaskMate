import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
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
    FormsModule,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class AddTaskModalComponent {
  private readonly modalController = inject(ModalController);
  private readonly taskService = inject(TaskService);

  /** Estado local del formulario de alta de tarea. */
  form: NewTaskPayload = {
    title: '',
    description: '',
    priority: 'media',
    completed: false,
    category: 'General',
  };

  /** Indica si el formulario tiene informacion minima para guardarse. */
  get canSave(): boolean {
    return this.form.title.trim().length > 0;
  }

  /** Cierra el modal sin crear ninguna tarea. */
  close(): void {
    void this.modalController.dismiss(undefined, 'cancel');
  }

  /** Guarda la tarea en el servicio y devuelve el resultado al componente padre. */
  saveTask(): void {
    if (!this.canSave) {
      return;
    }

    const task = this.taskService.addTask({
      ...this.form,
      title: this.form.title.trim(),
      description: this.form.description?.trim() || undefined,
      category: this.form.category?.trim() || undefined,
    });

    void this.modalController.dismiss(task, 'confirm');
  }
}
