import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonProgressBar,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { Task, TaskStats } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    NgIf,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonProgressBar,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page {
  private readonly modalController = inject(ModalController);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly toastController = inject(ToastController);

  /** Controla que bloque del Home se muestra en el segment. */
  activeSection: 'tasks' | 'stats' = 'tasks';

  /** Resumen general usado por la tarjeta principal y la vista de estadisticas. */
  stats: TaskStats = {
    total: 0,
    completed: 0,
    pending: 0,
  };

  /** Lista de tareas de prioridad alta destacadas en el Home. */
  priorityTasks: Task[] = [];
  /** Activa un spinner mientras se consulta la API. */
  isLoading = false;
  /** Mensaje visible cuando el backend no responde o devuelve error. */
  errorMessage = '';

  /** Registra iconos y deja lista la pantalla principal para usar datos compartidos. */
  constructor() {
    addIcons({ add });
  }

  /** Recarga los datos del Home cada vez que el usuario entra en la pestana. */
  ionViewWillEnter(): void {
    void this.loadDashboard();
  }

  /** Devuelve el porcentaje de tareas completadas para la vista de estadisticas. */
  get completionRate(): number {
    if (this.stats.total === 0) {
      return 0;
    }

    return Math.round((this.stats.completed / this.stats.total) * 100);
  }

  /** Devuelve el valor normalizado para la barra de progreso diaria. */
  get completionProgress(): number {
    if (this.stats.total === 0) {
      return 0;
    }

    return this.stats.completed / this.stats.total;
  }

  /** Cambia el contenido visible segun la opcion elegida en el segment. */
  onSegmentChange(event: CustomEvent): void {
    this.activeSection = event.detail.value === 'stats' ? 'stats' : 'tasks';
  }

  /** Abre el modal de alta y refresca el dashboard tras crear una tarea. */
  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddTaskModalComponent,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<Task>();

    if (role !== 'confirm' || !data) {
      return;
    }

    await this.loadDashboard();
    await this.presentToast(`Tarea creada: ${data.title}`);
  }

  /** Navega a la vista detalle de la tarea elegida. */
  goToDetail(id: number): void {
    void this.router.navigate(['/task-detail', id]);
  }

  /** Lleva al usuario a la pestana con el listado completo de tareas. */
  goToTasks(): void {
    void this.router.navigate(['/tabs/tab2']);
  }

  /** Permite reintentar la carga del tablero tras un fallo de red o API. */
  retryLoad(): void {
    void this.loadDashboard();
  }

  /** Recoge del servicio el resumen y las tareas prioritarias del Home. */
  private async loadDashboard(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const [stats, priorityTasks] = await Promise.all([
        firstValueFrom(this.taskService.getStats()),
        firstValueFrom(this.taskService.getTasksByPriority('alta')),
      ]);

      this.stats = stats;
      this.priorityTasks = priorityTasks.filter((task) => !task.completed).slice(0, 3);
    } catch (error) {
      this.stats = {
        total: 0,
        completed: 0,
        pending: 0,
      };
      this.priorityTasks = [];
      this.errorMessage = this.buildErrorMessage(
        error,
        'No se pudo cargar el panel principal. Revisa la conexion con la API.',
      );
    } finally {
      this.isLoading = false;
    }
  }

  /** Muestra una confirmacion breve tras crear una nueva tarea. */
  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color: 'success',
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
