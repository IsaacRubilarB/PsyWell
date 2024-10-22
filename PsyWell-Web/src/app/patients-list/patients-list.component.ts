import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  emotionalStatus: string;
  photo: string; // Añadimos la propiedad de la foto del paciente
}

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent], // Incluye NavbarComponent
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadir CUSTOM_ELEMENTS_SCHEMA para manejar elementos personalizados
})
export class PatientsListComponent {
  // Lista de pacientes con la ruta de la foto añadida
  patients: Patient[] = [
    { id: '1', name: 'Cristina Zapata', age: 25, diagnosis: 'Depresión', emotionalStatus: 'Estable', photo: './assets/perfiles/Ana.png' },
    { id: '2', name: 'Juan Pérez', age: 30, diagnosis: 'Ansiedad', emotionalStatus: 'Moderado', photo: './assets/perfiles/Juan.png' },
    { id: '3', name: 'Cristopher Soto', age: 23, diagnosis: 'Depresion Severa', emotionalStatus: 'Severo', photo: './assets/perfiles/Manuel.png' }
  ];
  

  filteredPatients: Patient[] = [...this.patients]; // Filtramos inicialmente mostrando todos

  // Método de búsqueda de pacientes
  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(query)
    );
  }
}
