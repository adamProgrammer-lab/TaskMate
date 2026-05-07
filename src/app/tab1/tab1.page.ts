import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    NgIf,
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
  /** Controla que bloque del Home se muestra en el segment. */
  activeSection: 'tasks' | 'stats' = 'tasks';

  /** Registra el icono del boton principal de nueva tarea. */
  constructor() {
    addIcons({ add });
  }

  /** Cambia el contenido visible segun la opcion elegida en el segment. */
  onSegmentChange(event: CustomEvent): void {
    this.activeSection = event.detail.value === 'stats' ? 'stats' : 'tasks';
  }
}
