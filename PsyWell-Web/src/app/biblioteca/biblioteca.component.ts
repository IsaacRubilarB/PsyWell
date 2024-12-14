import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

interface Archivo {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  portada: string; // Propiedad para la imagen de portada
}

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.scss'],
})
export class BibliotecaComponent implements OnInit {
  // Propiedades generales
  libros: Archivo[] = [];
  materialPsicologos: Archivo[] = [];

  filtroLibros: string = '';
  filtroMaterial: string = '';

  imagenesLibros = [
    'assets/biblioteca/PortadaBiblioteca1.png',
    'assets/biblioteca/PortadaBiblioteca2.png',
    'assets/biblioteca/PortadaBiblioteca3.png',
    'assets/biblioteca/PortadaBiblioteca4.png',
    'assets/biblioteca/PortadaBiblioteca5.png',
    'assets/biblioteca/PortadaBiblioteca6.png',
  ];

  imagenesMaterial = [
    'assets/biblioteca/PortadaBiblioteca1.png',
    'assets/biblioteca/PortadaBiblioteca2.png',
    'assets/biblioteca/PortadaBiblioteca3.png',
    'assets/biblioteca/PortadaBiblioteca4.png',
    'assets/biblioteca/PortadaBiblioteca5.png',
    'assets/biblioteca/PortadaBiblioteca6.png',
  ];

  // IDs de las carpetas
  apiKey = 'AIzaSyAFJUcrBDDLPM2SscMvi1x_jUv6Wlqnukg';
  folderIds = {
    libros: '1-FAVlVTJuBd7D5v0ndac9vfmKqN6mBfC',
    materialPsicologos: '1xGtAKxxzZbGKXDvvUIBHt4mQiT8e68KZ',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Cargar archivos al iniciar
    this.cargarArchivos('libros', this.folderIds.libros);
    this.cargarArchivos('material', this.folderIds.materialPsicologos);
  }

  /**
   * Carga los archivos de una carpeta específica y asigna portadas aleatorias.
   */
  cargarArchivos(tipo: string, folderId: string) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${this.apiKey}&fields=files(id,name,webViewLink,webContentLink)`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.files) {
          if (tipo === 'libros') {
            this.libros = response.files.map((libro: any) => ({
              ...libro,
              portada: this.obtenerImagenAleatoria(this.imagenesLibros),
            }));
          } else if (tipo === 'material') {
            this.materialPsicologos = response.files.map((material: any) => ({
              ...material,
              portada: this.obtenerImagenAleatoria(this.imagenesMaterial),
            }));
          }
        }
      },
      error: (error) => {
        console.error(`Error al cargar archivos de la carpeta ${tipo}:`, error);
      },
    });
  }

  /**
   * Selecciona una imagen aleatoria de una lista proporcionada.
   */
  obtenerImagenAleatoria(imagenes: string[]): string {
    const indice = Math.floor(Math.random() * imagenes.length);
    return imagenes[indice];
  }

  /**
   * Filtra los libros según el texto ingresado.
   */
  filtrarLibros(): Archivo[] {
    return this.libros.filter((libro) =>
      libro.name.toLowerCase().includes(this.filtroLibros.toLowerCase())
    );
  }

  /**
   * Filtra el material complementario según el texto ingresado.
   */
  filtrarMaterial(): Archivo[] {
    return this.materialPsicologos.filter((material) =>
      material.name.toLowerCase().includes(this.filtroMaterial.toLowerCase())
    );
  }

  /**
   * Descarga un archivo desde un enlace.
   */
  descargarArchivo(link: string) {
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.download = '';
    a.click();
    a.remove();
  }
}
