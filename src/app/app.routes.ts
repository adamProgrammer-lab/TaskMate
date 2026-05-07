import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'task-detail/:id',
    loadComponent: () =>
      import('./pages/task-detail/task-detail.page').then((m) => m.TaskDetailPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
