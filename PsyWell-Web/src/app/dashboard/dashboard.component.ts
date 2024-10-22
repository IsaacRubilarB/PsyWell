import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  psicologoName: string = 'Cristina Zapata'; // Nombre del psicólogo
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10; // Años de experiencia

  // Inicializar fondoPerfil con un valor por defecto
  fondoPerfil: SafeStyle = ''; 

  // Lista de notificaciones dinámicas
  notificaciones: { mensaje: string; icono: string; dismissed: boolean }[] = [
    { mensaje: 'Nuevo mensaje de Juan Pérez', icono: 'icon-bell', dismissed: false },
    { mensaje: 'Cita con María González en 30 minutos', icono: 'icon-alert', dismissed: false },
  ];

  // Lista de notas rápidas (sticky notes)
  stickyNotes: { titulo: string; contenido: string }[] = [
    { titulo: 'Nota Rápida 1', contenido: 'Recordar preguntar sobre sueño a Manuel Fernández.' },
    { titulo: 'Nota Rápida 2', contenido: 'Preparar informe de progreso para Sofía Martínez.' }
  ];

  // Lista de notas filtradas (para la búsqueda)
  filteredStickyNotes: { titulo: string; contenido: string }[] = [...this.stickyNotes];

  newNoteTitle: string = ''; // Título de la nueva nota
  newNoteContent: string = ''; // Contenido de la nueva nota
  searchQuery: string = ''; // Término de búsqueda para las notas

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Inicialización de la imagen de fondo por defecto después de que el sanitizer ha sido creado
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle('url(assets/portada.png)');
  }

  // Método para cambiar el fondo del perfil según la imagen seleccionada
  onBackgroundUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${reader.result})`);
      };
      reader.readAsDataURL(input.files[0]); // Convertir la imagen en base64
    }
  }

  // Método para desaparecer las notificaciones después de 10 segundos
  initNotificationTimeout() {
    this.notificaciones.forEach((notification, index) => {
      setTimeout(() => {
        this.notificaciones[index].dismissed = true; // Desaparece después de 10 segundos
      }, 10000); // 10 segundos = 10000ms
    });
  }

  // Verificar si todas las notificaciones han sido descartadas
  allNotificationsDismissed(): boolean {
    return this.notificaciones.every(notification => notification.dismissed);
  }

  // Añadir una nueva nota rápida (sticky note)
  addStickyNote() {
    if (this.newNoteTitle && this.newNoteContent) {
      this.stickyNotes.push({ titulo: this.newNoteTitle, contenido: this.newNoteContent });
      this.newNoteTitle = ''; // Limpiar el título después de añadir
      this.newNoteContent = ''; // Limpiar el contenido después de añadir
      this.filteredStickyNotes = [...this.stickyNotes]; // Actualizar las notas filtradas
    }
  }

  // Eliminar una nota rápida (sticky note)
  removeStickyNote(index: number) {
    this.stickyNotes.splice(index, 1);
    this.filteredStickyNotes = [...this.stickyNotes]; // Actualizar las notas filtradas después de eliminar
  }

  // Método para buscar notas rápidas por título
  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredStickyNotes = this.stickyNotes.filter(note => 
      note.titulo.toLowerCase().includes(query)
    );
  }

  // Método para disparar el evento de seleccionar archivo
  triggerFileInput(): void {
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Simular clic en el input de archivo
    }
  }
}
