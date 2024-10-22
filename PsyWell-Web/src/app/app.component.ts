import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>', // Esto renderiza las rutas definidas
  imports: [RouterOutlet] // Asegúrate de importar el RouterOutlet para las rutas
})
export class AppComponent {}
