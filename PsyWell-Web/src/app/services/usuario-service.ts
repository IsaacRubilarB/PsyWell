/*
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ServPublicoDTO } from '/Users/wzapatam/workspace/repos/vu-frontend-angular/src/app/models/serv-publico-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AdministracionDependenciasService {
  // Definimos las URLs que utilizaremos para hacer las peticiones HTTP
  private apiUrlGetServicios: string = environment.apiUrlVuAdministracion;
  private apiUrlGetDependencia: string = environment.apiUrlVuAdministracion;
  private apiUrlGetNoDependencia: string = environment.apiUrlVuAdministracion;

  // URL para enviar datos a una API local (puerto 8081)
  private urlSendData = 'http://localhost:8081/vu-administracion/agregarDependencia'; 

  // Constructor donde se inyecta HttpClient, que es el módulo de Angular para hacer peticiones HTTP
  constructor(private http: HttpClient) { }
  
  // Método para obtener la lista de servicios públicos, devuelve un Observable que contiene la respuesta HTTP
  getListadoServPublicos(): Observable<any> {
    const url = ${this.apiUrlGetServicios}/listarServicios;
    return this.http.get(url, { observe: 'response' });
  }
  
  // Método para obtener la lista de servicios dependientes de un servicio, filtrado por su ID
  getListadoServDependientes(servId: number): Observable<any> {
    const url = ${this.apiUrlGetDependencia}/listarServiciosGrilla?servId=${servId};
    return this.http.get(url, { observe: 'response' });
  }

  // Método para obtener la lista de servicios que no son dependientes de un servicio específico
  getListadoServNoDependientes(servId: number): Observable<any> {
    const url = ${this.apiUrlGetNoDependencia}/listarServiciosNoDependientes?servId=${servId};
    return this.http.get(url, { observe: 'response' });
  }

  // Método para enviar datos a la URL especificada mediante un POST, devuelve un Observable con la respuesta
  enviarDatos(datos:any): Observable<any> {
    return this.http.post(this.urlSendData, datos);
  }
}
*/
