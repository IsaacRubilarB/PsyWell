import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';

interface Paciente {
  id: string;
  nombre: string;
  imagen: string;
}

interface Recurso {
  titulo: string;
  descripcion: string;
  tipo: string;
  autor?: string;
  categoria?: string;
  fecha_subida: Date;
  visibilidad: boolean;
  pacienteAsignado: string | null;
  url: string | null;
  portada?: string | null;
}

@Component({
  selector: 'app-formulario-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-recursos.component.html',
  styleUrls: ['./formulario-recursos.component.scss']
})
export class FormularioRecursosComponent implements OnInit {
  titulo = '';
  descripcion = '';
  tipoRecurso = '';
  autor = '';
  videoUrl = '';
  recursoUrl = '';
  archivo: File | null = null;
  portadaUrl: string | null = null;
  pacienteSeleccionado: Paciente | null = null;
  categoria = '';
  pacientes: Paciente[] = []; // Lista de pacientes cargados

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.firestore
      .collection('pacientes')
      .valueChanges({ idField: 'id' })
      .subscribe(
        (data: any[]) => {
          this.pacientes = data.map((paciente) => ({
            id: paciente.id,
            nombre: paciente.nombre || 'Sin nombre',
            imagen: paciente.imagen || 'assets/profiles/default.png' // Imagen por defecto
          }));
          console.log('Pacientes cargados:', this.pacientes);
        },
        (error) => {
          console.error('Error al cargar pacientes:', error);
          this.mostrarAlerta('Error', 'No se pudieron cargar los pacientes.', 'error');
        }
      );
  }

  onTipoRecursoChange(): void {
    if (this.tipoRecurso !== 'videos') {
      this.videoUrl = '';
    }
    if (this.tipoRecurso !== 'libros') {
      this.autor = '';
      this.categoria = '';
    }
  }

  onFileSelected(event: any): void {
    this.archivo = event.target.files[0];
    if (this.tipoRecurso === 'libros' && this.archivo) {
      this.generatePdfPreview(this.archivo);
    } else if (this.tipoRecurso === 'audios' && this.archivo) {
      this.uploadFile(this.archivo, `audios/${this.archivo.name}`, 'audio');
    }
  }

  async generatePdfPreview(file: File): Promise<void> {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        // Subir la portada al storage
        await this.uploadFile(this.dataUrlToBlob(dataUrl), `portadas/${file.name}_portada.png`, 'portada');

        // Subir el archivo PDF completo al storage
        await this.uploadFile(file, `libros/${file.name}`, 'pdf');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error al generar la vista previa del PDF:', error);
      this.mostrarAlerta('Error', 'No se pudo generar la vista previa del libro.', 'error');
    }
  }

  async uploadFile(file: File | Blob, path: string, type: 'pdf' | 'audio' | 'portada'): Promise<void> {
    try {
      const task = this.storage.upload(path, file);
      const snapshot = await task.snapshotChanges().toPromise();
      const fileRef = this.storage.ref(path);
      const downloadUrl = await fileRef.getDownloadURL().toPromise();

      if (type === 'pdf' || type === 'audio') {
        this.recursoUrl = downloadUrl;
      } else if (type === 'portada') {
        this.portadaUrl = downloadUrl;
      }
      console.log(`${type} URL:`, downloadUrl);
    } catch (error) {
      console.error(`Error al subir ${type}:`, error);
    }
  }

  dataUrlToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async submitForm(): Promise<void> {
    if (this.tipoRecurso === 'libros' && this.archivo) {
      await this.generatePdfPreview(this.archivo);
    } else if (this.tipoRecurso === 'audios' && this.archivo) {
      await this.uploadFile(this.archivo, `audios/${this.archivo.name}`, 'audio');
    }
    this.guardarRecurso();
  }

  guardarRecurso(): void {
    if (this.tipoRecurso === 'videos' && this.videoUrl) {
      this.recursoUrl = this.transformYoutubeUrl(this.videoUrl);
    }
  
    const nuevoRecurso: Recurso = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      tipo: this.tipoRecurso,
      autor: this.autor || '',
      categoria: this.categoria || 'Sin Categoría',
      fecha_subida: new Date(),
      visibilidad: true,
      pacienteAsignado: this.pacienteSeleccionado ? this.pacienteSeleccionado.id : null,
      url: this.recursoUrl,
      portada: this.tipoRecurso === 'libros' ? this.portadaUrl : null
    };
  
    const collectionName =
      this.tipoRecurso === 'libros'
        ? 'libros'
        : this.tipoRecurso === 'audios'
        ? 'audios'
        : 'recursos-materiales';
  
    this.firestore
      .collection(collectionName)
      .add(nuevoRecurso)
      .then(() => {
        this.mostrarAlerta('Éxito', 'Recurso subido exitosamente', 'success');
        this.resetForm();
      })
      .catch((error) => {
        console.error('Error al guardar recurso en Firestore:', error);
        this.mostrarAlerta('Error', 'No se pudo guardar el recurso.', 'error');
      });
  }
  
  // Transformar URL de YouTube al formato embed
  transformYoutubeUrl(url: string): string {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  
  

  resetForm(): void {
    this.titulo = '';
    this.descripcion = '';
    this.tipoRecurso = '';
    this.autor = '';
    this.categoria = '';
    this.videoUrl = '';
    this.recursoUrl = '';
    this.archivo = null;
    this.portadaUrl = null;
    this.pacienteSeleccionado = null;
  }

  mostrarAlerta(titulo: string, texto: string, icono: 'success' | 'error'): void {
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
}
