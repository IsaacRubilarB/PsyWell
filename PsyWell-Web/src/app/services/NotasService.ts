import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotasService {
  private notasImportantesSubject = new BehaviorSubject<any[]>([]);
  notasImportantes$: Observable<any[]> = this.notasImportantesSubject.asObservable();

  constructor(private firestore: AngularFirestore) {}

  // Obtener las notas importantes y limitar a 3
  obtenerNotasImportantes(psicologoId: string): void {
    this.firestore
      .collection('notas', (ref) =>
        ref.where('psicologoId', '==', psicologoId).where('esImportante', '==', true)
      )
      .valueChanges({ idField: 'id' })
      .subscribe((notas) => {
        const importantes = notas
          .map((nota: any) => ({
            ...nota,
            palabraClave: nota.palabraClave || 'Sin Palabra Clave', // Validar palabraClave
            fechaCreacion: nota.fechaCreacion?.toDate
              ? nota.fechaCreacion.toDate()
              : new Date(),
            isOpen: false, // Agrega el estado inicial para las notas
          }))
          .slice(0, 3); // Limitar a un máximo de 3 notas
        this.notasImportantesSubject.next(importantes);
      });
  }
}
