import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environments';


@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiCitasUrl = 'http://localhost:8084/listarCitas'; // Endpoint para listar citas
  private apiEmocionesUrl = 'http://localhost:8082/listarRegistro'; // Endpoint para listar emociones
  private apiEmocionesByUsuarioUrl = 'http://localhost:8082/listarRegistroPorUsuario/'; // Emociones por usuario
  private apiUsuariosUrl = '/api/ListarUsuarios'; // Endpoint para listar usuarios

  constructor(private http: HttpClient) {}

  // Obtener todas las citas
  getAllCitas(): Observable<any> {
    return this.http.get(`${this.apiCitasUrl}`);
  }

  // Obtener todas las emociones registradas
  getAllEmociones(): Observable<any> {
    return this.http.get(`${this.apiEmocionesUrl}`);
  }
  
  deleteCita(citaId: number): Observable<any> {
    return this.http.delete(`/api/citas/${citaId}`);
  }
  
  // Obtener emociones registradas por usuario
  getEmocionesByUsuario(userId: string): Observable<any> {
    return this.http.get(`${this.apiEmocionesByUsuarioUrl}${userId}`);
  }

  // Obtener todos los usuarios
  getAllUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUsuariosUrl}`);
  }

  // Obtener reportes filtrados por rango de fechas en las citas
  getCitasByDateRange(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiCitasUrl}`, {
      params: { startDate, endDate },
    });
  }

  // Obtener reportes filtrados por paciente (emociones y citas combinadas)
  getReportesByPaciente(pacienteId: string): Observable<any> {
    return this.http.get(`${this.apiEmocionesByUsuarioUrl}${pacienteId}`);
  }

  // Obtener reportes filtrados por emoción
  getReportesByEmocion(emocion: string): Observable<any> {
    return this.http.get(`${this.apiEmocionesUrl}`, {
      params: { emocion },
    });
  }

  // Obtener reportes combinados (emociones y citas)
  getCombinedReports(): Observable<any> {
    return this.http.get(`${this.apiEmocionesUrl}`).pipe(
      // Puedes agregar lógica para combinar datos de emociones y citas aquí si es necesario
    );
  }
}
