import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroEmocionalDTO } from '../models/registro-emocional-dto';
import { environment } from 'environments/environments';


@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private apiListarRegistro = 'http://localhost:8082/listarRegistro'; 
  private apiListarRegistroByUser = 'http://localhost:8082/listarRegistroPorUsuario/';


  constructor(private http: HttpClient) {}

   listarRegistro ():Observable<any> {
     return this.http.get(this.apiListarRegistro);
  }

  listarRegistroByUser (id: any):Observable<any> {
    return this.http.get(this.apiListarRegistroByUser+id);
 }
}
