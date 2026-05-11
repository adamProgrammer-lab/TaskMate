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
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, refresh, trash } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
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
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class TaskDetailPage implements OnInit {
  private readonly alertController = inject(AlertController);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly toastController = inject(ToastController);

  task: Task | undefined;
  isLoading = false;
  errorMessage = '';

  /** Registra los iconos usados en las acciones de detalle de tarea. */
  constructor() {
    addIcons({ checkmark, refresh, trash });
  }

  /** Carga la tarea pedida por parametro de ruta. */
  ngOnInit(): void {
    void this.loadTask();
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
  async toggleComplete(): Promise<void> {
    if (!this.task) {
      return;
    }

    try {
      this.task = await firstValueFrom(this.taskService.toggleComplete(this.task));
    } catch (error) {
      await this.presentToast(
        this.buildErrorMessage(
          error,
          'No se pudo actualizar la tarea. Comprueba que la API este disponible.',
        ),
      );
    }
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
          handler: async () => {
            try {
              await firstValueFrom(this.taskService.deleteTask(this.task!.id));
              void this.router.navigate(['/tabs/tab2']);
            } catch (error) {
              await this.presentToast(
                this.buildErrorMessage(
                  error,
                  'No se pudo eliminar la tarea. Comprueba la conexion con la API.',
                ),
              );
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /** Reintenta la carga del detalle tras un fallo del backend. */
  retryLoad(): void {
    void this.loadTask();
  }

  /** Lee el id de la ruta y busca la tarea correspondiente. */
  private async loadTask(): Promise<void> {
    const id = Number.parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.task = await firstValueFrom(this.taskService.getTaskById(id));
    } catch (error) {
      this.task = undefined;
      this.errorMessage = this.buildErrorMessage(
        error,
        'No se pudo cargar el detalle de la tarea. Revisa la conexion con la API.',
      );
    } finally {
      this.isLoading = false;
    }
  }

  /** Muestra un aviso breve cuando una accion contra la API falla. */
  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color: 'danger',
      position: 'bottom',
    });

    await toast.present();
  }

  /** Normaliza los mensajes de error mostrados cuando falla una peticion HTTP. */
  private buildErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const maybeStatus = 'status' in error ? Number(error.status) : undefined;
      const maybeBody = 'error' in error ? error.error : undefined;

      if (maybeStatus === 0) {
        return 'No se pudo conectar con la API. Arranca el backend en http://localhost:3000.';
      }

      if (typeof maybeBody === 'object' && maybeBody !== null && 'message' in maybeBody) {
        return String(maybeBody.message);
      }
    }

    return fallback;
  }
}
