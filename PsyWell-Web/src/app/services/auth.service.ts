import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { map, Observable } from 'rxjs'; 
import { UsersService } from './userService'; 
import { environment } from 'environments/environments';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router,
    private firestore: AngularFirestore,
    private usersService: UsersService
  ) {}

  getAuth() {
    return this.afAuth;
  }

  // Método de inicio de sesión con correo y contraseña
  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Error al iniciar sesión: ' + error.message);
    }
  }

  // Método para iniciar sesión con Google
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await this.afAuth.signInWithPopup(provider);
      const user = userCredential.user;

      if (user && user.email) {
        const email = user.email;
        const displayName = user.displayName || 'Usuario';
        const uid = user.uid;

        const userExists = await this.checkIfUserExists(email);

        if (!userExists) {
          console.log('Usuario no encontrado. Registrando en PostgreSQL y Firebase...');
          await this.register(email, '', displayName, '', 'otro', 'paciente');
        }

        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('No se pudo obtener información del usuario');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw new Error('Error al iniciar sesión con Google.');
    }
  }

  // Verificar si el usuario ya existe en la base de datos
  async checkIfUserExists(email: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(this.usersService.verificarUsuario(email));
      return response && response.postgresId ? true : false;
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      return false;
    }
  }

  // Método para registrar un usuario (sin sobrescribir credenciales existentes)
  async register(email: string, password: string, nombre: string, fechaNacimiento: string, genero: string, perfil: string) {
    console.log('Registrando usuario...', { email, password, nombre, fechaNacimiento, genero, perfil });

    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (uid) {
        const postgresId = await this.saveUserToPostgres(uid, nombre, email, password, fechaNacimiento, genero, perfil);
        await this.saveUserToFirestore(uid, nombre, email, postgresId);
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('UID de Firebase no válido');
      }
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      throw new Error('Error al registrar usuario: ' + error.message);
    }
  }

  // Guardar usuario en Firestore
  public async saveUserToFirestore(uid: string, nombre: string, email: string, postgresId: string) {
    const userRef = this.firestore.collection('usuarios').doc(uid);
    try {
      await userRef.set({
        nombre: nombre,
        email: email,
        postgresId: postgresId,
        fechaCreacion: new Date(),
      });
      console.log('Usuario guardado correctamente en Firestore');
    } catch (error) {
      console.error('Error al guardar usuario en Firestore:', error);
      throw new Error('Error al guardar usuario en Firestore');
    }
  }

  // Guardar usuario en PostgreSQL
  private async saveUserToPostgres(uid: string, nombre: string, email: string, contrasena: string, fechaNacimiento: string, genero: string, perfil: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.http.post<any>('http://localhost:8081/agregarUsuario', {
        uid,
        nombre,
        email,
        contrasena,
        fechaNacimiento,
        genero,
        perfil,
      }));
      console.log('Response from PostgreSQL:', response);
      if (!response.postgresId) {
        console.warn('postgresId no recibido desde PostgreSQL');
        return null;
      }
      return response.postgresId;
    } catch (error) {
      console.error('Error al guardar usuario en PostgreSQL:', error);
      throw new Error('Error al guardar usuario en PostgreSQL');
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
