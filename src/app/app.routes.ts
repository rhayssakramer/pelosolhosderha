import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/blog/blog').then(m => m.BlogComponent)
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./components/post-detail/post-detail').then(m => m.PostDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/posts-list/posts-list').then(m => m.PostsListComponent)
      },
      {
        path: 'editor',
        loadComponent: () => import('./components/dashboard/post-editor/post-editor').then(m => m.PostEditorComponent)
      },
      {
        path: 'editor/:id',
        loadComponent: () => import('./components/dashboard/post-editor/post-editor').then(m => m.PostEditorComponent)
      },
      {
        path: 'tags',
        loadComponent: () => import('./components/dashboard/tag-manager/tag-manager').then(m => m.TagManagerComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/dashboard/blog-settings/blog-settings').then(m => m.BlogSettingsComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./components/dashboard/stats/stats').then(m => m.DashboardStatsComponent)
      },
      {
        path: 'instagram',
        loadComponent: () => import('./components/dashboard/instagram-manager/instagram-manager').then(m => m.InstagramManagerComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
