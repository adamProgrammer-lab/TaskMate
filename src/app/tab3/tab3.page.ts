import { Component, inject } from '@angular/core';
import {
  AlertController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendar, codeSlash, school, shieldCheckmark, trashBin } from 'ionicons/icons';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonAvatar,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  private readonly alertController = inject(AlertController);
  private readonly taskService = inject(TaskService);
  private readonly toastController = inject(ToastController);

  /** Registra los iconos usados en la tarjeta y lista del perfil. */
  constructor() {
    addIcons({ calendar, codeSlash, school, shieldCheckmark, trashBin });
  }

  /** Pide confirmacion antes de limpiar todas las tareas guardadas localmente. */
  async clearTaskData(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Limpiar datos',
      message: 'Se eliminaran todas las tareas guardadas en este dispositivo.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Limpiar',
          role: 'destructive',
          handler: () => {
            this.taskService.clearAll();
            void this.presentToast();
          },
        },
      ],
    });

    await alert.present();
  }

  /** Muestra una confirmacion breve tras vaciar el almacenamiento local. */
  private async presentToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Datos locales eliminados',
      duration: 1800,
      color: 'danger',
      position: 'bottom',
    });

    await toast.present();
  }
}
