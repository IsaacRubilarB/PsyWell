import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare var gapi: any; // Declarar la variable global gapi para Google API
declare var google: any; // Declarar la variable global google para Google Identity Services

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  private CLIENT_ID = '546817145485-9gut154rg11ernn0qnd116c7nob1rpna.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyB1hBpjUs98RCOi9ErZZfz0Ra8WEwyAGes';
  private DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  private SCOPES = 'https://www.googleapis.com/auth/calendar.events';
  private tokenClient: any; // Cliente de token de Google Identity Services
  private accessToken: string | null = null;
  private isAuthenticated = false;

  constructor() {}

  /**
   * Método para inicializar el cliente de Google y cargar `gapi` manualmente
   */
  async initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadGapiScript()
        .then(() => {
          // Verificar que `google.accounts` esté disponible
          if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
            reject('La librería Google Identity Services no está disponible. Asegúrate de cargarla correctamente en el index.html.');
            return;
          }

          // Configurar el cliente de token de Google Identity Services
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (response: any) => {
              if (response.error) {
                reject(`Error en la respuesta de autenticación: ${response.error}`);
              } else {
                this.accessToken = response.access_token;
                this.isAuthenticated = true;
                console.log('Autenticación exitosa. Token de acceso:', this.accessToken);
                resolve();
              }
            },
          });

          // Inicializar `gapi.client` después de cargar `gapi`
          gapi.load('client', () => {
            gapi.client
              .init({
                apiKey: this.API_KEY,
                discoveryDocs: this.DISCOVERY_DOCS,
              })
              .then(() => {
                console.log('Google API Client inicializado correctamente.');
                resolve();
              })
              .catch((error: any) => {
                console.error('Error al inicializar Google API Client:', error);
                reject(`Error al inicializar el cliente de la API de Google: ${JSON.stringify(error)}`);
              });
          });
        })
        .catch((error) => {
          console.error('Error al cargar gapi:', error);
          reject('Error al cargar gapi. Verifique la conexión o el script en index.html.');
        });
    });
  }

  /**
   * Método para cargar manualmente el script de `gapi`
   */
  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar si gapi ya está cargado para evitar cargarlo nuevamente
      if (typeof gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('Script gapi cargado correctamente.');
        resolve();
      };
      script.onerror = () => {
        reject('Error al cargar el script de gapi.');
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Método para iniciar sesión en Google
   */
  signIn(): Observable<void> {
    return new Observable((observer) => {
      if (!this.tokenClient) {
        observer.error('El cliente de token no está inicializado. Asegúrate de llamar a initClient() primero.');
        return;
      }

      // Solicitar el token de acceso con el cliente de token
      this.tokenClient.requestAccessToken();
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          this.isAuthenticated = false;
          observer.error(`Error al iniciar sesión: ${response.error}`);
        } else {
          this.accessToken = response.access_token;
          this.isAuthenticated = true;
          observer.next();
          observer.complete();
        }
      };
    });
  }

  /**
   * Método para cerrar sesión
   */
  signOut(): void {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        this.isAuthenticated = false;
        this.accessToken = null;
        console.log('Usuario ha cerrado sesión correctamente.');
      });
    } else {
      console.error('No hay un token de acceso para revocar. El usuario no está autenticado.');
    }
  }

  /**
   * Método para comprobar si el usuario está autenticado
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Método para obtener eventos del calendario
   * @param calendarId ID del calendario
   */
  getEvents(calendarId: string = 'primary'): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events
        .list({
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 10,
          orderBy: 'startTime',
        })
        .then((response: any) => {
          observer.next(response.result.items);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error(`Error al obtener eventos del calendario: ${error.details || error.message || error}`);
        });
    });
  }

  /**
   * Método para obtener la lista de calendarios del usuario
   */
  getCalendars(): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.calendarList
        .list()
        .then((response: any) => {
          observer.next(response.result.items);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error(`Error al obtener la lista de calendarios: ${error.details || error.message || error}`);
        });
    });
  }

  /**
   * Método para crear un nuevo evento en el calendario seleccionado
   * @param calendarId ID del calendario
   * @param event Objeto del evento a crear
   */
  createEvent(calendarId: string, event: any): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events
        .insert({
          calendarId: calendarId,
          resource: event,
        })
        .then((response: any) => {
          observer.next(response.result);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error(`Error al crear el evento: ${error.details || error.message || error}`);
        });
    });
  }

  /**
   * Método para actualizar un evento existente en el calendario
   * @param calendarId ID del calendario
   * @param eventId ID del evento a actualizar
   * @param event Objeto del evento actualizado
   */
  updateEvent(calendarId: string, eventId: string, event: any): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Por favor, inicie sesión primero.');
        return;
      }

      gapi.client.calendar.events
        .update({
          calendarId: calendarId,
          eventId: eventId,
          resource: event,
        })
        .then((response: any) => {
          observer.next(response.result);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error(`Error al actualizar el evento: ${error.details || error.message || error}`);
        });
    });
  }
}
