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
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Task } from '../models/task.model';
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
  stats = {
    total: 0,
    completed: 0,
    pending: 0,
  };

  /** Lista de tareas de prioridad alta destacadas en el Home. */
  priorityTasks: Task[] = [];

  /** Registra iconos y deja lista la pantalla principal para usar datos compartidos. */
  constructor() {
    addIcons({ add });
  }

  /** Recarga los datos del Home cada vez que el usuario entra en la pestana. */
  ionViewWillEnter(): void {
    this.loadDashboard();
  }

  /** Devuelve el porcentaje de tareas completadas para la vista de estadisticas. */
  get completionRate(): number {
    if (this.stats.total === 0) {
      return 0;
    }

    return Math.round((this.stats.completed / this.stats.total) * 100);
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

    this.loadDashboard();
    await this.presentToast(`Tarea creada: ${data.title}`);
  }

  /** Navega a la vista detalle de la tarea elegida. */
  goToDetail(id: number): void {
    void this.router.navigate(['/task-detail', id]);
  }

  /** Recoge del servicio el resumen y las tareas prioritarias del Home. */
  private loadDashboard(): void {
    this.stats = this.taskService.getStats();
    this.priorityTasks = this.taskService.getTasksByPriority('alta');
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
}
