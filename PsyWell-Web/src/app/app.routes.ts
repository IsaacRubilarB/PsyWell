import { Routes } from '@angular/router';
import { LoginRegistroComponent } from './login-registro/login-registro.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { ReportsComponent } from './reports/reports.component';
import { CalendarIntegrationComponent } from './calendar-integration/calendar-integration.component'; 
import { RecursosMaterialesComponent } from './recursos-materiales/recursos-materiales.component';

import { DashboardComponent } from './dashboard/dashboard.component';
export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  
  { path: 'patients', component: PatientsListComponent },
  { path: 'patients/:id', component: PatientDetailsComponent },
  { path: 'reports', component: ReportsComponent },  
  { path: 'dashboard', component: DashboardComponent }, 
  { path: 'citas', loadComponent: () => import('./citas/citas.component').then(m => m.CitasComponent) },
  { path: 'recursos-materiales', loadComponent: () => import('./recursos-materiales/recursos-materiales.component').then(m => m.RecursosMaterialesComponent) },
  { path: 'calendar-integration', component: CalendarIntegrationComponent },
];
