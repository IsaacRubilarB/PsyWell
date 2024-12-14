import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SafePipe } from './safe.pipe';
import { FormularioRecursosComponent } from '../formulario-recursos/formulario-recursos.component';
import { RecursosService } from 'app/services/recursos.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recursos-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SafePipe, FormularioRecursosComponent],
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecursosMaterialesComponent {
  isModalOpen = false;
  searchQuery = '';
  filteredResources: any[] = [];
  selectedCategory: string = '';
  selectedPacienteId: string = '';
  hoveredItem: any = null;
  resources: { [key: string]: any[] } = {
    videos: [],
    libros: [],
    audios: [],
    foros: []
  };
  pacientes: any[] = [];
  activeAudio: HTMLAudioElement | null = null;
  currentAudioTime: number = 0;
  duration: number = 0;
  activeResourceId: string | null = null;

  @ViewChildren('audioPlayer') audioPlayers!: QueryList<ElementRef<HTMLAudioElement>>;

  sidebarItems = [
    { titulo: 'Videos terapéuticos', icono: 'video_library', tipo: 'videos' },
    { titulo: 'Libros terapéuticos', icono: 'menu_book', tipo: 'libros' },
    { titulo: 'Audios terapéuticos', icono: 'audiotrack', tipo: 'audios' },
  ];

  constructor(
    private router: Router,
    private recursosService: RecursosService,
    private firestore: AngularFirestore
  ) {
    this.firestore.collection('pacientes').valueChanges({ idField: 'id' }).subscribe((pacientes: any[]) => {
      this.pacientes = pacientes;
    });
  }
  setHoveredItem(item: any) {
    this.hoveredItem = item;
  }

  selectCategory(type: string) {
    this.selectedCategory = type;
    this.fetchResources(type);
  }

  selectPaciente(pacienteId: string) {
    this.selectedPacienteId = pacienteId;
    this.filterResources();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  fetchResources(type: string) {
    const collectionName = type === 'libros' ? 'libros' : type === 'audios' ? 'audios' : 'recursos-materiales';

    this.recursosService.getRecursosPorTipo(collectionName).subscribe((resources: any[]) => {
      this.resources[type] = resources.filter(resource => resource.tipo === type);
      
      if (type === 'audios') {
        this.resources[type] = this.resources[type].map(resource => {
          if (!resource.url || typeof resource.url !== 'string' || resource.url.trim() === '') {
            console.warn(`Recurso de audio con ID ${resource.id} no tiene una URL válida.`);
          }
          return resource;
        });
      }

      this.filterResources();
    });
  }

  filterResources() {
    this.filteredResources = this.resources[this.selectedCategory]?.filter(resource => {
      const matchesQuery = resource.titulo ? resource.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) : false;
      const matchesPaciente = this.selectedPacienteId ? resource.pacientesAsignados.includes(this.selectedPacienteId) : true;
      return matchesQuery && matchesPaciente;
    });
  }

  mostrarAlerta(titulo: string, texto: string, icono: 'success' | 'error') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal2-border-radius',
        confirmButton: 'swal2-confirm-button'
      }
    });
  }
  

  deleteResource(id: string, type: string) {
    // Mostrar la alerta de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este recurso? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-border-radius',
        confirmButton: 'swal2-confirm-button',
        cancelButton: 'swal2-cancel-button' 
      }
    }).then((result) => {
      // Si el usuario confirma, proceder con la eliminación
      if (result.isConfirmed) {
        const collectionName = type === 'libros' ? 'libros' : type === 'audios' ? 'audios' : 'recursos-materiales';
  
        this.recursosService.deleteRecursoPorId(id, collectionName).then(() => {
          // Actualizar los recursos y aplicar el filtro
          this.resources[type] = this.resources[type].filter(resource => resource.id !== id);
          this.filterResources();
  
          // Mostrar alerta de éxito
          this.mostrarAlerta('Eliminado', 'El recurso ha sido eliminado correctamente.', 'success');
        }).catch((error) => {
          console.error('Error al eliminar el recurso:', error);
  
          // Mostrar alerta de error
          this.mostrarAlerta('Error', 'Hubo un problema al eliminar el recurso.', 'error');
        });
      }
    });
  }
  
  

  getTitleForCategory(type: string): string {
    return this.sidebarItems.find(item => item.tipo === type)?.titulo || '';
  }

  audioPlayer: HTMLAudioElement | null = null;

viewResource(resource: any) {
  if (resource.tipo === 'libros') {
    // Si es un libro, abrir el PDF en una nueva pestaña
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      console.error('No se pudo abrir el libro completo. URL del PDF no encontrada o no válida.');
    }
  } else if (resource.tipo === 'audios') {
    // Si es un audio, reproducir o pausar el audio en la misma página
    if (resource.url) {
      if (!this.audioPlayer) {
        // Crear el elemento de audio solo si no existe
        this.audioPlayer = new Audio(resource.url);
      } else if (this.audioPlayer.src !== resource.url) {
        // Si ya existe un reproductor, cambiar la fuente al nuevo audio
        this.audioPlayer.src = resource.url;
      }

      // Reproducir o pausar el audio
      if (this.audioPlayer.paused) {
        this.audioPlayer.play();
        console.log('Reproduciendo audio:', resource.titulo);
      } else {
        this.audioPlayer.pause();
        console.log('Audio pausado:', resource.titulo);
      }
    } else {
      console.error('URL no válida para el recurso de audio.');
    }
  } else {
    console.error('Tipo de recurso no soportado para visualización directa.');
  }
}

updateProgressBar() {
  const progressBarElement = document.querySelector(`.progress-bar[data-id="${this.activeResourceId}"]`) as HTMLElement;
  if (progressBarElement && this.duration > 0) {
    const progressPercentage = (this.currentAudioTime / this.duration) * 100;
    progressBarElement.style.setProperty('--progress', `${progressPercentage}%`);
  }
}




toggleAudio(resource: any) {
  if (!resource.url) {
    console.error("URL no válida para el recurso de audio.");
    return;
  }

  // Pausar el audio activo si es diferente al actual
  if (this.activeAudio && this.activeResourceId !== resource.id) {
    this.activeAudio.pause();
    this.currentAudioTime = 0;
    this.duration = 0;
    this.activeAudio = null;
    this.activeResourceId = null;
  }

  // Crear un nuevo elemento de audio si no existe o si es un recurso diferente
  if (!this.activeAudio || this.activeResourceId !== resource.id) {
    this.activeAudio = new Audio(resource.url);
    this.activeResourceId = resource.id;
    
    this.activeAudio.ontimeupdate = () => {
      this.currentAudioTime = this.activeAudio ? this.activeAudio.currentTime : 0;
      this.updateProgressBar();
    };
    this.activeAudio.onloadedmetadata = () => {
      this.duration = this.activeAudio ? this.activeAudio.duration : 0;
    };
  }

  // Alternar entre reproducir y pausar el audio
  if (this.activeAudio.paused) {
    this.activeAudio.play();
  } else {
    this.activeAudio.pause();
  }

  this.activeAudio.onended = () => {
    this.currentAudioTime = 0;
    this.updateProgressBar();
    this.activeAudio = null;
    this.activeResourceId = null;
  };
}

formatTime(time: number): string {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


isPlaying(resource: any): boolean {
  return !!(this.activeAudio && this.activeResourceId === resource.id && !this.activeAudio.paused);
}


}
