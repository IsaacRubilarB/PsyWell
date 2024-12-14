import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from 'app/services/userService';
import { FichaService, FichaInput } from '../services/ficha.service'; // Ruta ajustada
import Swal from 'sweetalert2'; // Asegúrate de tener instalado sweetalert2

@Component({
  selector: 'app-ficha-paciente',
  templateUrl: './ficha-paciente.component.html',
  styleUrls: ['./ficha-paciente.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class FichaPacienteComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>(); // Asegúrate de declarar este evento

  @Input() patientId!: number; // ID del paciente
  @Input() psychologistId!: number | null; 

  paciente: FichaInput = {
    nombres: '',
    fechaNacimiento: null,
    genero: '',
    correo: '',
    telefono: '',
    telefonoEmercia: '',
    direccion: '',
    estadoCivil: '',
    notasSesionAnterior: '',
    medicamentos: '',
    diagnostico: '',
    notas: '', // Inicialización del nuevo campo
  };
  
  

  formattedFechaNacimiento: string | null = null;
  progressPercentage = 0;
  showSuccessMessage = false;
  isConfirmingClose = false;
  showRequiredError = false;

  telefonoValido: boolean = true; // Controla la validez del teléfono
  telefonoBlurred: boolean = false; // Controla si el campo perdió el foco

  constructor(
    private fichaService: FichaService,
    private usersService: UsersService,
    
  ) {}

  ngOnInit() {
    if (this.patientId) {
      this.cargarFichaPaciente(this.patientId);
    }
  }
  

  obtenerIDs(): void {
    const emailPsicologo = localStorage.getItem('emailPsicologo'); // Correo del psicólogo logueado

    if (!emailPsicologo || !this.patientId) {
      console.error('Faltan datos: correo del psicólogo o ID del paciente.');
      return;
    }

    this.usersService.obtenerUsuarioPorCorreo(emailPsicologo).subscribe(
      (response) => {
        const idPsicologo = parseInt(response.id_usuario, 10); // Asegura que sea un número
        this.registrarFicha(idPsicologo, this.patientId);
      },
      (error) => {
        console.error('Error al obtener el ID del psicólogo:', error);
      }
    );
  }

  registrarFicha(idPsicologo: number, idPaciente: number): void {
    this.fichaService.obtenerFichaPorIdPaciente(idPaciente).subscribe(
      (response) => {
        if (response && response.data) {
          // Si ya existe una ficha, actualízala
          const fichaExistente: FichaInput = {
            ...this.paciente,
            idFichaPaciente: response.data.idFichaPaciente,
            idPsicologo,
            idPaciente,
          };
  
          this.fichaService.actualizarFicha(response.data.idFichaPaciente, fichaExistente).subscribe(
            () => {
              this.showSuccessMessage = true;
              setTimeout(() => {
                this.showSuccessMessage = false;
                this.performCloseModal();
              }, 2000);
            },
            (error) => {
              console.error('Error al actualizar la ficha:', error);
              alert('Error al actualizar la ficha. Por favor, intente nuevamente.');
            }
          );
        } else {
          // Si no existe, crea una nueva ficha
          const nuevaFicha: FichaInput = {
            ...this.paciente,
            idPsicologo,
            idPaciente,
          };
  
          this.fichaService.registrarFicha(nuevaFicha).subscribe(
            () => {
              this.showSuccessMessage = true;
              setTimeout(() => {
                this.showSuccessMessage = false;
                this.performCloseModal();
              }, 2000);
            },
            (error) => {
              console.error('Error al registrar la ficha:', error);
              alert('Error al registrar la ficha. Por favor, intente nuevamente.');
            }
          );
        }
      },
      (error) => {
        console.error('Error al verificar la existencia de la ficha:', error);
        alert('Error al procesar la ficha. Por favor, intente nuevamente.');
      }
    );
  }
  
  

  cargarDatosPaciente(id: number): void {
    this.fichaService.obtenerFichaPorIdPaciente(id).subscribe(
      (response) => {
        if (response && response.data) {
          this.paciente = {
            ...this.paciente,
            idFichaPaciente: response.data.idFichaPaciente || undefined,
            nombres: response.data.nombres || '',
            fechaNacimiento: response.data.fechaNacimiento || null,
            genero: response.data.genero || '',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            telefonoEmercia: response.data.telefonoEmercia || '',
            direccion: response.data.direccion || '',
            estadoCivil: response.data.estadoCivil || '',
            medicamentos: response.data.medicamentos || '',
            diagnostico: response.data.diagnostico || '',
            notas: response.data.notas || '', // Campo notas sincronizado
          };
          this.formattedFechaNacimiento = this.formatearFechaNacimiento(this.paciente.fechaNacimiento);
          this.updateProgress();
        }
      },
      (error) => {
        console.error('Error al cargar la ficha del paciente:', error);
      }
    );
  }
  
  
  

  validarTelefono(telefono: string): boolean {
    const regex = /^[0-9+()\- ]{9,15}$/;
    return regex.test(telefono);
  }

  validarTelefonoEnBlur(): void {
    this.telefonoBlurred = true;
    this.telefonoValido = this.validarTelefono(this.paciente.telefono);
  }

  formatearFechaNacimiento(fecha: string | null): string | null {
    if (!fecha) return null;

    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Fecha inválida';

      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const año = date.getFullYear();

      return `${dia}/${mes}/${año}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  updateProgress() {
    const fieldsFilled = Object.values(this.paciente).filter((value) => value).length;
    const totalFields = Object.keys(this.paciente).length;
    this.progressPercentage = Math.round((fieldsFilled / totalFields) * 100);
  }

  isFormComplete(): boolean {
    return (
      !!this.paciente.nombres &&
      !!this.paciente.fechaNacimiento &&
      !!this.paciente.genero &&
      !!this.paciente.correo &&
      !!this.paciente.telefono &&
      !!this.paciente.telefonoEmercia &&
      !!this.paciente.direccion &&
      !!this.paciente.diagnostico // Verifica si este campo debe ser opcional o requerido
    );
  }
  
  

  cargarFichaPaciente(idPaciente: number): void {
    this.fichaService.obtenerFichaPorIdPaciente(idPaciente).subscribe(
      (response) => {
        if (response && response.data) {
          this.paciente = {
            ...this.paciente,
            nombres: response.data.nombres || '',
            fechaNacimiento: response.data.fechaNacimiento || null,
            genero: response.data.genero || '',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            telefonoEmercia: response.data.telefonoEmercia || '',
            direccion: response.data.direccion || '',
            estadoCivil: response.data.estadoCivil || '',
            notasSesionAnterior: response.data.notasSesionAnterior || '',
            medicamentos: response.data.medicamentos || '',
            diagnostico: response.data.diagnostico || '',
            notas: response.data.notas || '', // Campo corregido
          };
          this.formattedFechaNacimiento = this.formatearFechaNacimiento(this.paciente.fechaNacimiento);
          this.updateProgress();
        }
      },
      (error) => {
        console.error('Error al cargar la ficha del paciente:', error);
      }
    );
  }
  
  
  onSubmit(): void {
    if (!this.psychologistId || !this.patientId) {
      console.error('No se puede registrar o actualizar la ficha. Faltan IDs obligatorios.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede registrar o actualizar la ficha sin los IDs del psicólogo y del paciente.',
      });
      return;
    }
  
    const fichaPayload: FichaInput = {
      ...this.paciente,
      idPsicologo: this.psychologistId,
      idPaciente: this.patientId,
    };
  
    if (this.paciente.idFichaPaciente) {
      // Actualizar ficha existente
      this.fichaService.actualizarFicha(this.paciente.idFichaPaciente, fichaPayload).subscribe(
        (response) => {
          console.log('Ficha actualizada con éxito:', response);
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La ficha ha sido actualizada exitosamente.',
          }).then(() => {
            this.isConfirmingClose = false; // Deshabilitar la lógica de confirmación
            this.closeModal(); // Cerrar el modal después de guardar
          });
        },
        (error) => {
          console.error('Error al actualizar la ficha:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar la ficha. Por favor, intente nuevamente.',
          });
        }
      );
    } else {
      // Registrar nueva ficha
      this.fichaService.registrarFicha(fichaPayload).subscribe(
        (response) => {
          console.log('Ficha registrada con éxito:', response);
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La ficha ha sido registrada exitosamente.',
          }).then(() => {
            this.isConfirmingClose = false; // Deshabilitar la lógica de confirmación
            this.closeModal(); // Cerrar el modal después de guardar
          });
        },
        (error) => {
          console.error('Error al registrar la ficha:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al registrar la ficha. Por favor, intente nuevamente.',
          });
        }
      );
    }
  }
  
  
  

  closeModal() {
    if (this.isConfirmingClose) {
      this.isConfirmingClose = false;
      this.performCloseModal();
    } else {
      this.performCloseModal();
    }
  }
  
  expandTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reinicia la altura
    textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta al contenido
  }
  
  confirmClose() {
    this.isConfirmingClose = false;
    this.performCloseModal();
  }

  cancelClose() {
    this.isConfirmingClose = false;
  }

  private performCloseModal() {
    this.closeModalEvent.emit();
  }

  hasUnsavedData(): boolean {
    return Object.values(this.paciente).some((value) => value !== '' && value !== null);
  }
}
