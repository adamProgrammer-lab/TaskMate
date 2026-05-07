import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'task-detail/:id',
    loadComponent: () =>
      import('./pages/task-detail/task-detail.page').then((m) => m.TaskDetailPage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
