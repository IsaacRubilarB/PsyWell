import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Importa el componente raíz
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Asegúrate de que tienes tus rutas definidas correctamente
import { provideHttpClient } from '@angular/common/http'; // Si necesitas realizar peticiones HTTP
import { provideAnimations } from '@angular/platform-browser/animations'; // Si usas animaciones

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Proveedores de rutas
    provideHttpClient(), // Proveedor de HTTP
    provideAnimations() // Proveedor de animaciones si las usas
    // Otros proveedores si los necesitas
  ]
}).catch(err => console.error(err));
