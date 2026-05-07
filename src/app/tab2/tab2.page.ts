import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, clipboardOutline } from 'ionicons/icons';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    FormsModule,
    NgIf,
    IonBadge,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  private readonly modalController = inject(ModalController);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly toastController = inject(ToastController);

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter: 'all' | 'pending' | 'done' = 'all';
  searchQuery = '';

  /** Registra los iconos de la lista y del boton flotante de tareas. */
  constructor() {
    addIcons({ add, clipboardOutline });
  }

  /** Recarga las tareas cada vez que el usuario vuelve a la pestana. */
  ionViewWillEnter(): void {
    this.loadTasks();
  }

  /** Guarda la busqueda activa y aplica el filtrado combinado. */
  filterTasks(event: CustomEvent): void {
    this.searchQuery = String(event.detail?.value || '').toLowerCase().trim();
    this.applyFilter();
  }

  /** Aplica el filtro del segment junto con la busqueda escrita. */
  applyFilter(): void {
    let nextTasks = [...this.tasks];

    if (this.selectedFilter === 'pending') {
      nextTasks = nextTasks.filter((task) => !task.completed);
    } else if (this.selectedFilter === 'done') {
      nextTasks = nextTasks.filter((task) => task.completed);
    }

    if (this.searchQuery) {
      nextTasks = nextTasks.filter((task) => {
        const title = task.title.toLowerCase();
        const description = task.description?.toLowerCase() || '';
        const category = task.category?.toLowerCase() || '';

        return (
          title.includes(this.searchQuery) ||
          description.includes(this.searchQuery) ||
          category.includes(this.searchQuery)
        );
      });
    }

    this.filteredTasks = nextTasks;
  }

  /** Cambia el estado de una tarea y actualiza la lista visible. */
  onToggle(task: Task): void {
    this.taskService.toggleComplete(task.id);
    this.loadTasks();
  }

  /** Abre la pantalla detalle de la tarea elegida. */
  goToDetail(id: number): void {
    void this.router.navigate(['/task-detail', id]);
  }

  /** Abre el modal de alta y muestra un toast de confirmacion al guardar. */
  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddTaskModalComponent,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<Task>();

    if (role !== 'confirm' || !data) {
      return;
    }

    this.loadTasks();
    await this.presentToast(`Tarea creada: ${data.title}`);
  }

  /** Devuelve el color del badge segun la prioridad de cada tarea. */
  getPriorityColor(task: Task): 'danger' | 'success' | 'warning' {
    if (task.priority === 'alta') {
      return 'danger';
    }

    if (task.priority === 'baja') {
      return 'success';
    }

    return 'warning';
  }

  /** Relee las tareas desde el servicio y mantiene el filtro actual. */
  private loadTasks(): void {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
  }

  /** Muestra una confirmacion breve tras crear una tarea nueva. */
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
