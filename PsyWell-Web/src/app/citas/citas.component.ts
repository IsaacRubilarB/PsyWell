import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CitasService } from '../services/citasService';
import { NotificacionesService } from '../services/NotificacionesService';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleMapsComponent } from 'app/google-maps/google-maps.component';

export interface Cita {
  idCita: number;
  idPaciente: number;
  idPsicologo: number | null;
  ubicacion: string;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  comentarios: string;
  nombrePaciente?: string;
  fotoPaciente?: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss'],
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, GoogleMapsComponent],
})
export class CitasComponent implements OnInit, OnDestroy {
  citas: Cita[] = [];
  filteredCitas: Cita[] = [];
  pacientes: any[] = [];
  mostrarModal = false;
  mostrarMapaModal = false;
  citaForm: FormGroup;
  errorMessage: string | null = null;
  userId: number | null = null;
  modoEdicion = false;
  citaEnEdicion: Cita | null = null;

  constructor(
    private citasService: CitasService,
    private fb: FormBuilder,
    private usersService: UsersService,
    private afAuth: AngularFireAuth,
    private notificacionesService: NotificacionesService // Servicio de notificaciones
  ) {
    this.citaForm = this.fb.group({
      idPaciente: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      ubicacion: ['', Validators.required],
      comentarios: [''],
      estado: ['Pendiente', Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerUsuarios();
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.cargarPsicologo(user.email || '');
      }
    });
  }

  ngOnDestroy() {
    // No se requieren intervalos adicionales en este componente
  }

  cargarPsicologo(email: string) {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        const user = response.data.find((user: any) => user.email === email);
        if (user) {
          this.userId = user.idUsuario;
          this.obtenerCitas();
        } else {
          console.error('No se encontró el usuario con ese correo electrónico');
        }
      },
      (error) => {
        console.error('Error al listar los usuarios:', error);
      }
    );
  }

  abrirModal() {
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.citaForm.reset({
      estado: 'Pendiente',
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.citaForm.reset({
      estado: 'Pendiente',
    });
    this.modoEdicion = false;
    this.citaEnEdicion = null;
  }

  abrirMapaModal() {
    this.mostrarMapaModal = true;
  }

  cerrarMapaModal() {
    this.mostrarMapaModal = false;
  }

  obtenerUsuarios() {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        if (response && response.data) {
          this.pacientes = response.data.filter(
            (user: { perfil: string }) => user.perfil === 'paciente'
          );
        } else {
          console.error('No se encontraron usuarios');
        }
      },
      (error) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }

  obtenerCitas() {
    this.citasService.listarCitas().subscribe({
      next: (response) => {
        if (response && response.status === 'success' && Array.isArray(response.data)) {
          this.citas = response.data
            .filter((cita: any) => cita.idPsicologo === this.userId)
            .map((cita: any) => ({
              ...cita,
              nombrePaciente: this.getNombreUsuario(cita.idPaciente),
              fotoPaciente: this.getFotoPaciente(cita.idPaciente),
            }));
          this.filteredCitas = [...this.citas];

          // Marcar citas nuevas como vistas
          const nuevasCitas = this.citas
            .map((c) => c.idCita)
            .filter((idCita) => !this.notificacionesService['citasVistas'].has(idCita));
          if (nuevasCitas.length > 0) {
            this.notificacionesService.marcarCitasComoVistas(nuevasCitas);
          }
        } else {
          console.error('La respuesta no es válida:', response);
        }
      },
      error: (error) => {
        console.error('Error al listar citas', error);
        this.errorMessage = 'No se pudo cargar las citas. Intenta de nuevo más tarde.';
      },
    });
  }

  guardarUbicacionSeleccionada() {
    if (this.citaForm.value.ubicacion) {
      // Cerramos el modal solo al guardar.
      this.cerrarMapaModal();
      console.log('Ubicación guardada:', this.citaForm.value.ubicacion);
    } else {
      console.warn('No se seleccionó ninguna ubicación.');
    }
  }

  
  guardarCita() {
    if (this.citaForm.valid && this.userId) {
      const nuevaCita: Cita = {
        ...this.citaForm.value,
        idPsicologo: this.userId,
        idCita: this.citaEnEdicion ? this.citaEnEdicion.idCita : 0,
        nombrePaciente: '',
      };

      if (this.modoEdicion && this.citaEnEdicion) {
        this.citasService.actualizarCita(nuevaCita).subscribe({
          next: () => {
            this.cerrarModal();
            this.obtenerCitas();
          },
          error: (error: any) => {
            console.error('Error al actualizar la cita', error);
          },
        });
      } else {
        this.citasService.registrarCita(nuevaCita).subscribe({
          next: () => {
            this.cerrarModal();
            this.obtenerCitas();
          },
          error: (error: any) => {
            console.error('Error al registrar la cita', error);
          },
        });
      }
    }
  }

  editarCita(cita: Cita) {
    this.modoEdicion = true;
    this.citaEnEdicion = cita;
    this.mostrarModal = true;
    this.citaForm.patchValue({
      idPaciente: cita.idPaciente,
      fecha: cita.fecha,
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      ubicacion: cita.ubicacion,
      comentarios: cita.comentarios,
      estado: cita.estado,
    });
  }

  eliminarCita(idCita: number) {
    this.citasService.eliminarCita(idCita).subscribe({
      next: () => {
        this.obtenerCitas();
      },
      error: (error: any) => {
        console.error('Error al eliminar la cita', error);
      },
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredCitas = this.citas.filter(
      (cita) =>
        (cita.nombrePaciente?.toLowerCase().includes(query) || '') ||
        cita.fecha.toLowerCase().includes(query)
    );
  }

  ubicacionSeleccionada(direccion: string) {
    // Solo actualizamos el campo de ubicación, no cerramos el modal aquí.
    this.citaForm.patchValue({
      ubicacion: direccion,
    });
    console.log('Ubicación seleccionada:', direccion);
  }


  getFotoPaciente(idPaciente: number): string {
    const paciente = this.pacientes.find((p) => p.idUsuario === idPaciente);
    if (paciente && paciente.email) {
      const sanitizedEmail = paciente.email.replace(/@/g, '_').replace(/\./g, '_');
      return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/fotoPerfil%2F${encodeURIComponent(
        sanitizedEmail
      )}?alt=media`;
    }
    return './assets/profiles/default.png';
  }

  getNombreUsuario(id: number): string {
    const usuario = this.pacientes.find((p) => p.idUsuario === id);
    return usuario ? usuario.nombre : 'Desconocido';
  }
}
