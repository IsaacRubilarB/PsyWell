import { Injectable } from '@angular/core';
import { environment } from 'environments/environments';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsLoaderService {
  private scriptLoaded = false;
  private loadAttempts = 0;

  loadApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadAttempts++;
      console.log(`Intento de carga de Google Maps API: ${this.loadAttempts}`);

      if (document.getElementById('google-maps-api')) {
        console.log('Google Maps API ya está cargado.');
        resolve();
        return;
      }

      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-api';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps API cargado correctamente.');
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error al cargar Google Maps API:', error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }
}
