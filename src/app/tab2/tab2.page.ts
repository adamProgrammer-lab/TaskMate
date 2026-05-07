import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

type TaskItem = {
  color: 'primary' | 'warning' | 'success';
  due: string;
  status: string;
  title: string;
};

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    NgFor,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  /** Datos de ejemplo que alimentan la lista principal de tareas. */
  taskItems: TaskItem[] = [
    {
      title: 'Terminar interfaz del Home',
      due: 'Hoy · 18:00',
      status: 'En curso',
      color: 'warning',
    },
    {
      title: 'Preparar demo del sprint',
      due: 'Manana · 09:00',
      status: 'Pendiente',
      color: 'primary',
    },
    {
      title: 'Actualizar perfil del usuario',
      due: 'Completada esta semana',
      status: 'Hecha',
      color: 'success',
    },
  ];
}
