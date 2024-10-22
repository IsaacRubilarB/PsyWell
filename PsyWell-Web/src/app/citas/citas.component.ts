import { CommonModule } from '@angular/common';
import { CalendarIntegrationComponent } from '../calendar-integration/calendar-integration.component'; 
import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component'; // Importar el componente Navbar
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, CalendarIntegrationComponent, NavbarComponent], // Importar el NavbarComponent
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadir esto para que Angular reconozca 'app-navbar'
})
export class CitasComponent {
  citas = [
    { 
      nombre: 'María González', 
      fecha: '08/10/2024', 
      hora: '10:00', 
      estado: 'finalizada', 
      resumen: 'La paciente ha mantenido una mejoría en sus niveles de estrés. Los últimos registros emocionales muestran estabilidad, aunque con episodios esporádicos de tristeza.',
      imagen: 'assets/perfiles/Maria.png' 
    },
    { 
      nombre: 'Ana Torres', 
      fecha: '07/10/2024', 
      hora: '11:00', 
      estado: 'finalizada', 
      resumen: 'Sus registros fisiológicos indican un sueño reparador y una frecuencia cardíaca estable, lo que coincide con una disminución en sus niveles de ansiedad.',
      imagen: 'assets/perfiles/Ana.png' 
    },
    { 
      nombre: 'Laura Castillo', 
      fecha: '05/10/2024', 
      hora: '12:00', 
      estado: 'finalizada', 
      resumen: 'Ha mejorado en la reducción de episodios de estrés severo, pero los niveles emocionales muestran un ligero aumento de irritabilidad en situaciones sociales.',
      imagen: 'assets/perfiles/Laura.png' 
    },
    { 
      nombre: 'Sofía Martínez', 
      fecha: '09/10/2024', 
      hora: '16:00', 
      estado: 'finalizada', 
      resumen: 'Los datos indican un buen manejo del estrés en el trabajo, con registros emocionales que reflejan sentimientos positivos en un 75% de las entradas diarias.',
      imagen: 'assets/perfiles/Sofia.png' 
    },
    { 
      nombre: 'Juan Pérez', 
      fecha: '10/10/2024', 
      hora: '14:00', 
      estado: 'pendiente', 
      resumen: 'Ha experimentado un aumento en los niveles de ansiedad en los últimos días, con un aumento en la frecuencia cardíaca por encima de lo habitual.',
      imagen: 'assets/perfiles/Juan.png' 
    },
    { 
      nombre: 'Carlos Sánchez', 
      fecha: '12/10/2024', 
      hora: '09:30', 
      estado: 'pendiente', 
      resumen: 'Continúa presentando dificultades para dormir y niveles altos de cortisol. Emocionalmente ha reportado una mezcla de frustración y agotamiento.',
      imagen: 'assets/perfiles/Carlos.png' 
    },
    { 
      nombre: 'Jorge Ramírez', 
      fecha: '13/10/2024', 
      hora: '15:00', 
      estado: 'pendiente', 
      resumen: 'Su variabilidad emocional ha aumentado considerablemente. Los registros fisiológicos indican un patrón de sueño irregular y aumento de la frecuencia cardíaca.',
      imagen: 'assets/perfiles/Jorge.png' 
    },
    { 
      nombre: 'Manuel Fernández', 
      fecha: '11/10/2024', 
      hora: '13:00', 
      estado: 'pendiente', 
      resumen: 'El paciente ha registrado episodios de estrés significativo, con altos niveles de cortisol. Su frecuencia cardíaca también ha mostrado picos elevados durante la semana.',
      imagen: 'assets/perfiles/Manuel.png' 
    }
  ];
}
