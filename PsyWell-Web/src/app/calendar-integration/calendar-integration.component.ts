import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleCalendarService } from '../services/google-calendar.service'; // Ajusta la ruta según tu estructura de proyecto

@Component({
  selector: 'app-calendar-integration',
  standalone: true,
  templateUrl: './calendar-integration.component.html',
  styleUrls: ['./calendar-integration.component.scss'],
  providers: [GoogleCalendarService],
  imports: [NgIf, NgFor, FormsModule, DatePipe],
})
export class CalendarIntegrationComponent implements OnInit {
  eventSummary: string = '';
  eventDescription: string = '';
  eventLocation: string = '';
  eventStart: string = '';
  eventEnd: string = '';
  eventAttendees: string = '';
  statusMessage: string = '';
  listaEventos: any[] = [];
  listaCalendarios: any[] = [];
  selectedCalendarId: string = 'primary'; // Definimos el ID del calendario seleccionado
  isLogin: boolean = false;

  constructor(private googleCalendarService: GoogleCalendarService) {}

  ngOnInit(): void {
    this.googleCalendarService
      .initClient()
      .then(() => {
        this.statusMessage = 'Cliente de Google Calendar inicializado correctamente.';
      })
      .catch((error: any) => {
        this.statusMessage = `Error al inicializar Google Calendar: ${error}`;
      });
  }

  signIn(): void {
    this.statusMessage = 'Iniciando sesión en Google...';

    // Verificar que `tokenClient` esté inicializado antes de solicitar el acceso
    if (!this.googleCalendarService.isUserAuthenticated()) {
      this.googleCalendarService.signIn().subscribe(
        () => {
          this.isLogin = true;
          this.statusMessage = 'Sesión iniciada correctamente.';
          this.getCalendars(); // Cargar calendarios después de iniciar sesión
        },
        (error: any) => {
          this.statusMessage = `Error al iniciar sesión: ${error}`;
        }
      );
    } else {
      this.statusMessage = 'Ya estás autenticado.';
    }
  }

  signOut(): void {
    this.googleCalendarService.signOut();
    this.isLogin = false;
    this.statusMessage = 'Sesión cerrada correctamente.';
    this.listaEventos = [];
    this.listaCalendarios = [];
  }

  getCalendars(): void {
    this.googleCalendarService.getCalendars().subscribe(
      (calendars: any) => {
        this.listaCalendarios = calendars;
        this.selectedCalendarId = calendars.length > 0 ? calendars[0].id : 'primary';
        if (this.selectedCalendarId) {
          this.getEvents();
        }
      },
      (error: any) => {
        this.statusMessage = `Error al obtener calendarios: ${error}`;
      }
    );
  }

  getEvents(): void {
    if (!this.isLogin || !this.selectedCalendarId) {
      this.statusMessage = 'Debes iniciar sesión y seleccionar un calendario primero.';
      return;
    }

    this.googleCalendarService.getEvents(this.selectedCalendarId).subscribe(
      (events: any) => {
        this.listaEventos = events;
        this.statusMessage = `Eventos obtenidos del calendario: ${this.selectedCalendarId}`;
      },
      (error: any) => {
        this.statusMessage = `Error al obtener eventos: ${error}`;
      }
    );
  }

  createEvent(): void {
    if (!this.isLogin || !this.selectedCalendarId) {
      this.statusMessage = 'Debes iniciar sesión y seleccionar un calendario primero.';
      return;
    }

    const event = {
      summary: this.eventSummary,
      description: this.eventDescription,
      location: this.eventLocation,
      start: {
        dateTime: new Date(this.eventStart).toISOString(),
      },
      end: {
        dateTime: new Date(this.eventEnd).toISOString(),
      },
      attendees: this.eventAttendees
        ? this.eventAttendees.split(',').map((email: string) => ({ email: email.trim() }))
        : [],
    };

    this.googleCalendarService.createEvent(this.selectedCalendarId, event).subscribe(
      () => {
        this.statusMessage = 'Evento creado con éxito';
        this.getEvents(); // Recargamos la lista de eventos
        this.clearForm(); // Limpiamos el formulario
      },
      (error: any) => {
        this.statusMessage = `Error al crear el evento: ${error}`;
      }
    );
  }

  clearForm(): void {
    this.eventSummary = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventStart = '';
    this.eventEnd = '';
    this.eventAttendees = '';
  }
}
