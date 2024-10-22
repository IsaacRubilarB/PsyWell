// src/app/services/patients.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  // Simulación de datos de pacientes
  private patients: Patient[] = [
    {
      id: 1,
      name: 'Cristina Zapata',
      age: 25,
      diagnosis: 'Depresión',
      emotionalStatus: 'Estable',
      physiologicalMonitor: {
        heartRate: 90,
        temperature: 38,
        steps: 6404,
        hydration: 4,
        sleep: 5
      }
    },
    {
      id: 2,
      name: 'Juan Pérez',
      age: 30,
      diagnosis: 'Ansiedad',
      emotionalStatus: 'Alta Ansiedad',
      physiologicalMonitor: {
        heartRate: 80,
        temperature: 36.5,
        steps: 7000,
        hydration: 3,
        sleep: 7
      }
    }
  ];

  constructor() {}

  // Obtener todos los pacientes
  getPatients(): Observable<Patient[]> {
    return of(this.patients);
  }

  // Obtener un paciente por ID
  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.patients.find(p => p.id === id);
    return of(patient);
  }
}
