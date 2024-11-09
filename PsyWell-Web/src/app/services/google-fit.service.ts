import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

declare var gapi: any;
declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleFitService {
  private CLIENT_ID = environment.googleClientId;
  private API_KEY = environment.googleApiKey;
  private SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read';
  private tokenClient: any;
  private accessToken: string | null = null;
  private isAuthenticated = false;

  constructor() {}

  getGoogleFitData(): Observable<any> {
    return new Observable((observer) => {
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        const fitness = gapi.client.fit;

        // Obtener el historial de pasos como ejemplo
        fitness.users.dataset.aggregate({
          "aggregateBy": [
            {
              "dataTypeName": "com.google.step_count.delta",
              "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }
          ],
          "bucketByTime": {
            "durationMillis": 86400000 // Un día
          },
          "startTimeMillis": new Date().getTime() - (7 * 24 * 60 * 60 * 1000), // Última semana
          "endTimeMillis": new Date().getTime()
        }).then(
          (response: any) => {
            observer.next(response.result);
            observer.complete();
          },
          (error: any) => {
            observer.error(error);
          }
        );
      } else {
        observer.error('Usuario no autenticado');
      }
    });
  }

  /**
   * Inicializa el cliente de Google Fit y carga `gapi` manualmente
   */
  async initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadGapiScript()
        .then(() => {
          if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
            reject('La librería Google Identity Services no está disponible.');
            return;
          }

          // Configura el cliente de token de Google Identity Services
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (response: any) => {
              if (response.error) {
                reject(`Error en la autenticación: ${response.error}`);
              } else {
                this.accessToken = response.access_token;
                this.isAuthenticated = true;
                console.log('Autenticación exitosa. Token:', this.accessToken);
                resolve();
              }
            },
            prompt: 'consent',
          });

          // Inicializa `gapi.client` para Google Fit
          gapi.load('client', () => {
            gapi.client
              .init({
                apiKey: this.API_KEY,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest'],
              })
              .then(() => {
                console.log('Cliente de Google Fit inicializado correctamente.');
                resolve();
              })
              .catch((error: any) => {
                reject(`Error al inicializar Google Fit API: ${JSON.stringify(error)}`);
              });
          });
        })
        .catch((error) => {
          reject(`Error al cargar gapi: ${error}`);
        });
    });
  }

  /**
   * Carga manualmente el script de `gapi`
   */
  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Error al cargar el script de gapi.');
      document.body.appendChild(script);
    });
  }

  /**
   * Inicia sesión con Google Fit
   */
  signIn(): Observable<void> {
    return new Observable((observer) => {
      if (!this.tokenClient) {
        observer.error('El cliente de token no está inicializado. Llama a initClient() primero.');
        return;
      }

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
   * Cierra sesión en Google Fit
   */
  signOut(): void {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        this.isAuthenticated = false;
        this.accessToken = null;
        console.log('Sesión cerrada correctamente.');
      });
    }
  }

  /**
   * Comprueba si el usuario está autenticado
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Obtiene datos de pasos del usuario
   */
  getStepsData(): Observable<any> {
    return new Observable((observer) => {
      if (!this.isAuthenticated || !this.accessToken) {
        observer.error('Usuario no autenticado. Inicia sesión primero.');
        return;
      }

      gapi.client.request({
        path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        method: 'POST',
        body: {
          aggregateBy: [
            {
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Diariamente
          startTimeMillis: Date.now() - 30 * 86400000, // Últimos 30 días
          endTimeMillis: Date.now(),
        },
      })
        .then((response: any) => {
          observer.next(response.result);
          observer.complete();
        })
        .catch((error: any) => {
          observer.error(`Error al obtener datos de pasos: ${error.details || error.message || error}`);
        });
    });
  }

  // Aquí puedes agregar métodos similares para otros datos de Google Fit, como ritmo cardíaco o actividad física
}
