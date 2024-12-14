import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from 'app/services/userService';
import { CitasService } from 'app/services/citasService';

interface User {
  idUsuario: number;
  nombre: string;
  fechaNacimiento: string;
  perfil: string;
  correo?: string; 
  email?: string;  
  diagnosis?: string;
  emotionalStatus?: string;
  photo?: string;
  lastSession?: string;
  nextAppointment?: string;
  riskLevel?: string;
  progress?: number;
}

interface Patient {
  id: string;
  name: string;
  age: number | string;
  diagnosis: string;
  emotionalStatus: string;
  photo: string;
  lastSession: string;
  nextAppointment: string;
  riskLevel: string;
  progress: number;
  email: string;
}

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null; // Paciente seleccionado
  isModalOpen: boolean = false; // Estado del modal

  constructor(
    private usersService: UsersService,
    private citasService: CitasService // Asegúrate de inyectar el servicio correctamente
  ) {}


  ngOnInit(): void {
    this.cargarPacientes();
  }



  async cargarPacientes() {
    try {
      // Obtener todos los usuarios
      const response: any = await this.usersService.listarUsuarios().toPromise();
      if (response && Array.isArray(response.data)) {
        console.log('Usuarios obtenidos:', response.data);
  
        // Mapear pacientes
        this.patients = await Promise.all(
          response.data
            .filter((user: any) => user.perfil === 'paciente')
            .map(async (user: any) => {
              console.log(`Procesando paciente: ${user.nombre} (ID: ${user.idUsuario})`);
              
              // Obtener la próxima cita
              const proximaCita = await this.obtenerProximaCita(user.idUsuario);
              console.log(`Próxima cita para ${user.nombre}:`, proximaCita);
  
              // Construir el objeto paciente
              return {
                id: user.idUsuario.toString(),
                name: user.nombre,
                age: this.calculateAge(user.fechaNacimiento),
                diagnosis: user.diagnosis || 'Sin diagnóstico',
                emotionalStatus: user.emotionalStatus || 'Sin estado',
                photo: this.getFirebaseImageUrl(user.correo || user.email || '', 'profile'),
                lastSession: this.formatDate(user.lastSession),
                nextAppointment: proximaCita ? this.formatDate(proximaCita.fecha) : 'No disponible',
                riskLevel: user.riskLevel || 'Sin riesgo',
                progress: user.progress || 0,
                email: user.correo || user.email || '',
              };
            })
        );
  
        console.log('Pacientes procesados:', this.patients);
        this.filteredPatients = [...this.patients];
      } else {
        console.error('Respuesta no válida al listar usuarios', response);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  }
  
  async obtenerProximaCita(idPaciente: number): Promise<any> {
    try {
      console.log(`Buscando próxima cita para el paciente ID: ${idPaciente}`);
      
      const response = await this.citasService.listarCitas().toPromise();
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        console.log('Citas obtenidas del servicio:', response.data);
  
        // Filtrar citas del paciente
        const citasPaciente = response.data
          .filter((cita: any) => cita.idPaciente === idPaciente && new Date(cita.fecha) >= new Date())
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  
        console.log(`Citas filtradas para el paciente ${idPaciente}:`, citasPaciente);
  
        return citasPaciente.length > 0 ? citasPaciente[0] : null;
      }
      return null;
    } catch (error) {
      console.error(`Error al obtener la próxima cita para el paciente ${idPaciente}:`, error);
      return null;
    }
  }
  
  
  
  
  


  getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }

  calculateAge(fechaNacimiento: string): number | string {
    if (!fechaNacimiento) return 'Edad desconocida';
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 'Edad desconocida' : age;
  }

  
  // Método para formatear fechas
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'No disponible';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString();
  }

  // Método para abrir el modal
  openMessageModal(patient: Patient) {
    this.selectedPatient = patient; // Guardamos el paciente seleccionado
    this.isModalOpen = true; // Abre el modal
  }

  // Método para cerrar el modal
  closeModal() {
    this.selectedPatient = null;
    this.isModalOpen = false; // Cierra el modal
  }

  // Otros métodos de lógica
  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(query)
    );
  }


  filterByDiagnosis(event: any) {
    const diagnosis = event.target.value;
    this.filteredPatients = diagnosis === 'todos'
      ? [...this.patients]
      : this.filteredPatients.filter(patient => patient.diagnosis.toLowerCase() === diagnosis.toLowerCase());
  }

  // Método para programar cita
  scheduleAppointment(patient: Patient) {
    console.log(`Programar cita para ${patient.name}`);
  }
}
