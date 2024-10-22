import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { CalendarIntegrationComponent } from './calendar-integration/calendar-integration.component';
import { LoginRegistroComponent } from './login-registro/login-registro.component'; // Faltaba agregar el componente de login

export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent },  // Agregamos la ruta de login
  { path: 'calendar', component: CalendarIntegrationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'patients', component: PatientsListComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirecciona a login
  { path: '**', redirectTo: 'login' } // Redirecciona a login cualquier otra ruta
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
