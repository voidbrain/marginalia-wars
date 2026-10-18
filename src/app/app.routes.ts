import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select/select').then((m) => m.SelectPage),
  },
  {
    path: 'fight',
    loadComponent: () => import('./pages/arena/arena').then((m) => m.ArenaPage),
  },
  {
    path: 'result',
    loadComponent: () => import('./pages/result/result').then((m) => m.ResultPage),
  },
  { path: '**', redirectTo: '' },
];
