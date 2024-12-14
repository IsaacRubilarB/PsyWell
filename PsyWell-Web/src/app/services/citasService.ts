import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Cita, ListaCitasResponse } from '../models/cita.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private registroCitaUrl = 'http://localhost:8084/registrarCita';
  private listarCitaUrl = 'http://localhost:8084/listarCitas';
  private actualizarCitaUrl = 'http://localhost:8084/actualizarCita';
  private eliminarCitaUrl = 'http://localhost:8084/eliminarCita';
  private baseUrl = 'http://localhost:8082/listarRegistro';

  private fechaUltimaConsulta: Date = new Date(); // Fecha de la última consulta para notificaciones

  constructor(private http: HttpClient) {}

  registrarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroCitaUrl, citaData, { headers });
  }

  listarCitas(): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(this.listarCitaUrl);
  }

  listarCitasPorPsicologo(idPsicologo: number): Observable<ListaCitasResponse> {
    const url = `${this.listarCitaUrl}?idPsicologo=${idPsicologo}`;
    return this.http.get<ListaCitasResponse>(url);
  }

  actualizarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.actualizarCitaUrl}/${citaData.idCita}`, citaData, { headers });
  }

  eliminarCita(idCita: number): Observable<any> {
    return this.http.delete<any>(`${this.eliminarCitaUrl}/${idCita}`);
  }

  obtenerRegistrosPorPaciente(idUsuario: number): Observable<any> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    const fechaDesde = fechaLimite.toISOString();
    const url = `http://localhost:8082/listarRegistroPorUsuario/${idUsuario}?fechaDesde=${fechaDesde}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => (response?.data ? response.data : [])),
      catchError((error) => {
        console.error('Error al obtener registros:', error);
        return of([]);
      })
    );
  }

  obtenerNuevasCitas(): Observable<Cita[]> {
    return this.listarCitas().pipe(
      map((response: ListaCitasResponse) => {
        const nuevasCitas = response.data.filter((cita) => {
          const citaFechaHora = new Date(`${cita.fecha}T${cita.horaInicio}`);
          return citaFechaHora > this.fechaUltimaConsulta;
        });
        this.fechaUltimaConsulta = new Date(); // Actualiza la fecha/hora de la última consulta
        return nuevasCitas;
      }),
      catchError((error) => {
        console.error('Error al obtener nuevas citas:', error);
        return of([]);
      })
    );
  }
}
