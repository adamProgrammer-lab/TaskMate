import { DatePipe, NgIf, UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  AlertController,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, refresh, trash } from 'ionicons/icons';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  imports: [
    DatePipe,
    NgIf,
    UpperCasePipe,
    RouterLink,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class TaskDetailPage implements OnInit {
  private readonly alertController = inject(AlertController);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  task: Task | undefined;

  /** Registra los iconos usados en las acciones de detalle de tarea. */
  constructor() {
    addIcons({ checkmark, refresh, trash });
  }

  /** Carga la tarea pedida por parametro de ruta. */
  ngOnInit(): void {
    this.loadTask();
  }

  /** Devuelve el color visual asociado a la prioridad actual. */
  getPriorityColor(task: Task): 'danger' | 'success' | 'warning' {
    if (task.priority === 'alta') {
      return 'danger';
    }

    if (task.priority === 'baja') {
      return 'success';
    }

    return 'warning';
  }

  /** Cambia el estado completado y refresca la informacion mostrada. */
  toggleComplete(): void {
    if (!this.task) {
      return;
    }

    this.taskService.toggleComplete(this.task.id);
    this.task = this.taskService.getTaskById(this.task.id);
  }

  /** Pide confirmacion antes de eliminar la tarea actual. */
  async deleteTask(): Promise<void> {
    if (!this.task) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: 'Estas seguro? Esta accion no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteTask(this.task!.id);
            void this.router.navigate(['/tabs/tab2']);
          },
        },
      ],
    });

    await alert.present();
  }

  /** Lee el id de la ruta y busca la tarea correspondiente. */
  private loadTask(): void {
    const id = Number.parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.task = this.taskService.getTaskById(id);
  }
}
