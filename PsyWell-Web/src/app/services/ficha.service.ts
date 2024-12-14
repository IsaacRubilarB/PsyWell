import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

    export interface FichaInput {
        idFichaPaciente?: number; // Identificador único de la ficha (opcional para nuevas fichas)
        idPaciente?: number;
        idPsicologo?: number;
        nombres: string;
        fechaNacimiento: string | null;
        genero: string;
        correo: string;
        telefono: string;
        telefonoEmercia: string;
        direccion: string;
        estadoCivil?: string;
        notasSesionAnterior: string;
        medicamentos: string;
        diagnostico: string;
        notas?: string; // Nuevo campo agregado
      }
      
  

@Injectable({
  providedIn: 'root',
})
export class FichaService {
  private apiUrl = 'http://localhost:8083'; // URL del backend

  constructor(private http: HttpClient) {}

  registrarFicha(ficha: FichaInput): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/registrarFicha`, ficha, { headers });
  }
  

  // Listar todas las fichas (para propósitos administrativos)
  listarFichas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listarFichas`);
  }

  obtenerFichaPorIdPaciente(idPaciente: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerFichaPorIdPaciente/${idPaciente}`);
  }
  
  

  // Actualizar una ficha existente
  actualizarFicha(idFichaPaciente: number, ficha: FichaInput): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}/actualizarFicha/${idFichaPaciente}`, ficha, { headers });
  }

  // Obtener datos del paciente por ID
  obtenerDatosPaciente(idPaciente: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/ListarUsuariosById/${idPaciente}`);
  }
}
