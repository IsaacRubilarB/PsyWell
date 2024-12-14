import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private registroUserUrl = '/api/agregarUsuario';
  private listarUserUrl = '/api/ListarUsuarios';
  private obtenerUsuarioPorIdUrl = '/api/ListarUsuariosById';
  private verificarUsuarioUrl = '/api/verificarOGuardarUsuario'; 
  httpClient: any;



  constructor(private http: HttpClient) {}

  // Método para registrar un nuevo usuario
  registrarUsuario(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroUserUrl, userData, { headers });
  }

  // Método para listar todos los usuarios
  listarUsuarios(): Observable<any> {
    return this.http.get(this.listarUserUrl);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.obtenerUsuarioPorIdUrl}/${id}`);
  }
  

  obtenerFichaPorIdPaciente(patientId: string): Observable<any> {
    const url = `http://localhost:8083/obtenerFichaPorIdPaciente/${patientId}`;
    return this.httpClient.get(url);
}

  obtenerUsuarioPorCorreo(email: string): Observable<any> {
    const url = 'http://localhost:8081/ListarUsuarios'; // Endpoint que devuelve todos los usuarios
    return new Observable((observer) => {
      this.http.get<any>(url).subscribe(
        (response) => {
          const usuarios = response?.data || [];
          const usuario = usuarios.find((user: any) => user.email === email);
  
          if (usuario) {
            observer.next(usuario); // Retorna el usuario encontrado
          } else {
            console.error(`No se encontró un psicólogo asociado al correo: ${email}`);
            observer.error(`No se encontró un usuario con el correo proporcionado.`);
          }
  
          observer.complete();
        },
        (error) => {
          console.error('Error al listar usuarios:', error);
          observer.error('Error al listar usuarios: ' + error.message);
        }
      );
    });
  }
  
  
  
  
  
  

  // Método para verificar si el usuario ya existe
  verificarUsuario(email: string): Observable<any> {
    return this.http.post<any>(this.verificarUsuarioUrl, { email });
  }



  
  
}
