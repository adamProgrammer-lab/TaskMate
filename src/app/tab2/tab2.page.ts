import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, clipboardOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
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
    IonButton,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  private readonly modalController = inject(ModalController);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly toastController = inject(ToastController);

  /** Copia local del listado completo recuperado desde el servicio. */
  tasks: Task[] = [];
  /** Resultado visible tras aplicar filtros y busqueda. */
  filteredTasks: Task[] = [];
  /** Filtro principal para separar tareas pendientes, hechas o todas. */
  selectedStatus: 'all' | 'pending' | 'done' = 'all';
  /** Filtro secundario para prioridad. */
  selectedPriority: 'all' | Task['priority'] = 'all';
  /** Texto libre escrito en la barra de busqueda. */
  searchQuery = '';
  /** Activa un spinner mientras se consulta la API. */
  isLoading = false;
  /** Muestra un mensaje claro si el backend falla al cargar la lista. */
  errorMessage = '';

  /** Registra los iconos de la lista y del boton flotante de tareas. */
  constructor() {
    addIcons({ add, clipboardOutline });
  }

  /** Recarga las tareas cada vez que el usuario vuelve a la pestana. */
  ionViewWillEnter(): void {
    void this.loadTasks();
  }

  /** Guarda la busqueda activa y aplica el filtrado combinado. */
  filterTasks(event: CustomEvent): void {
    this.searchQuery = String(event.detail?.value || '').toLowerCase().trim();
    this.applyFilter();
  }

  /** Aplica de forma conjunta estado, prioridad y texto de busqueda. */
  applyFilter(): void {
    let nextTasks = [...this.tasks];

    if (this.selectedStatus === 'pending') {
      nextTasks = nextTasks.filter((task) => !task.completed);
    } else if (this.selectedStatus === 'done') {
      nextTasks = nextTasks.filter((task) => task.completed);
    }

    if (this.selectedPriority !== 'all') {
      nextTasks = nextTasks.filter((task) => task.priority === this.selectedPriority);
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

  /** Restablece todos los filtros visuales del listado. */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedPriority = 'all';
    this.applyFilter();
  }

  /** Cambia el estado de una tarea y actualiza la lista visible. */
  async onToggle(task: Task, completed: boolean): Promise<void> {
    try {
      await firstValueFrom(this.taskService.updateTask(task.id, { completed }));
      await this.loadTasks();
    } catch (error) {
      task.completed = !completed;
      await this.presentToast(
        this.buildErrorMessage(
          error,
          'No se pudo actualizar la tarea. Comprueba que la API este disponible.',
        ),
        'danger',
      );
    }
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

    await this.loadTasks();
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

  /** Refresca manualmente la lista y cierra la animacion del refresher. */
  async doRefresh(event: CustomEvent): Promise<void> {
    await this.loadTasks();
    void (event.target as HTMLIonRefresherElement).complete();
  }

  /** Reintenta la carga principal del listado cuando hay un fallo de API. */
  retryLoad(): void {
    void this.loadTasks();
  }

  /** Relee las tareas desde el servicio y mantiene el filtro actual. */
  private async loadTasks(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.tasks = await firstValueFrom(this.taskService.getTasks());
      this.applyFilter();
    } catch (error) {
      this.tasks = [];
      this.filteredTasks = [];
      this.errorMessage = this.buildErrorMessage(
        error,
        'No se pudo cargar la lista de tareas. Revisa la conexion con la API.',
      );
    } finally {
      this.isLoading = false;
    }
  }

  /** Muestra una confirmacion breve tras crear una tarea nueva o un error de accion. */
  private async presentToast(
    message: string,
    color: 'danger' | 'success' = 'success',
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color,
      position: 'bottom',
    });

    await toast.present();
  }

  /** Normaliza los mensajes de error mostrados cuando falla la comunicacion HTTP. */
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
