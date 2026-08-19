import { Routes } from '@angular/router';
import { authGuard, guestGuard, staffGuard, superAdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: 'login/:slug',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'forgot',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/forgot.page').then(m => m.ForgotPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/clinic/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'owners', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/owners/owners.page').then(m => m.OwnersPage) },
      { path: 'pets', loadComponent: () => import('./pages/clinic/pets/pets.page').then(m => m.PetsPage) },
      { path: 'pets/:id', loadComponent: () => import('./pages/clinic/pets/pet-profile.page').then(m => m.PetProfilePage) },
      { path: 'calendar', loadComponent: () => import('./pages/clinic/calendar/calendar.page').then(m => m.CalendarPage) },
      { path: 'consultations/new', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/consultations/consultation.page').then(m => m.ConsultationPage) },
      { path: 'messages', loadComponent: () => import('./pages/clinic/messages/messages.page').then(m => m.MessagesPage) },
      { path: 'reports', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/reports/reports.page').then(m => m.ReportsPage) },
      { path: 'settings', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/settings/settings.page').then(m => m.SettingsPage) },
      { path: 'team', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/team/team.page').then(m => m.TeamPage) },
      { path: 'branches', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/branches/branches.page').then(m => m.BranchesPage) },
      { path: 'services', canActivate: [staffGuard], loadComponent: () => import('./pages/clinic/services/services.page').then(m => m.ServicesPage) },
      { path: 'profile', loadComponent: () => import('./pages/clinic/profile/profile.page').then(m => m.ProfilePage) },
      { path: 'admin', canActivate: [superAdminGuard], loadComponent: () => import('./pages/admin/admin-dashboard.page').then(m => m.AdminDashboardPage) },
      { path: 'admin/tenants', canActivate: [superAdminGuard], loadComponent: () => import('./pages/admin/tenants.page').then(m => m.AdminTenantsPage) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
