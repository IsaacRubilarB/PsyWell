import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, query, where, collection, getDocs, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private db: Firestore;

  constructor() {
    // Inicializa Firebase utilizando la configuración del entorno
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }


  async getPhysiologicalData(email: string): Promise<any> {
    try {
      console.log('Buscando datos para el correo:', email);
      
      // Asegúrate de codificar el correo si es necesario
      const q = query(
        collection(this.db, 'datos_fisiologicos'),
        where('mail', '==', email) // Busca por el correo exacto
      );
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log('Datos obtenidos desde Firebase:', data);
        return data;
      } else {
        console.warn('No se encontraron datos para el correo:', email);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos fisiológicos desde Firebase:', error);
      throw error;
    }
  }
  
  
  private encodeEmail(email: string): string {
    return email.replace(/@/g, '_').replace(/\./g, '_');
  }
  
}
