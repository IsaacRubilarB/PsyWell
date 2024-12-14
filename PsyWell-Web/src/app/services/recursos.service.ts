import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface Recurso {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  url?: string;
  portada?: string;
  autor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecursosService {

  constructor(private firestore: AngularFirestore) {}

  // Obtener colección según el tipo de recurso
  private getCollectionByType(tipo: string): AngularFirestoreCollection<Recurso> {
    // Cambiar la colección según el tipo
    if (tipo === 'libros') {
      return this.firestore.collection<Recurso>('libros');
    } else if (tipo === 'audios') {
      return this.firestore.collection<Recurso>('audios');
    } else {
      return this.firestore.collection<Recurso>('recursos-materiales'); 
    }
  }

  // Obtener recursos por tipo de recurso desde la colección específica
  getRecursosPorTipo(tipo: string): Observable<Recurso[]> {
    return this.getCollectionByType(tipo).valueChanges({ idField: 'id' });
  }

  // Eliminar un recurso por ID en la colección específica
  deleteRecursoPorId(id: string, tipo: string): Promise<void> {
    return this.getCollectionByType(tipo).doc(id).delete();
  }

  // Agregar un recurso a la colección específica
  agregarRecurso(recurso: Recurso): Promise<void> {
    const id = this.firestore.createId();
    const collection = this.getCollectionByType(recurso.tipo);
    return collection.doc(id).set({ ...recurso, id });
  }
}
