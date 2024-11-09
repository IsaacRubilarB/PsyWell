import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleCalendarService } from '../services/google-calendar.service';

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
  listaCalendarios: any[] = [];
  listaEventos: any[] = [];
  selectedCalendarId: string = 'primary';
  isLogin: boolean = false;
  isClientInitialized: boolean = false;
  fitData: any = {};
  isFitDataLoaded: boolean = false;

  constructor(
    private googleCalendarService: GoogleCalendarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.googleCalendarService
      .initClient()
      .then(() => {
        this.statusMessage = 'Cliente de Google Calendar inicializado correctamente.';
        this.isClientInitialized = true;
        this.cdr.detectChanges(); // Forzar actualización de vista
      })
      .catch((error: any) => {
        this.statusMessage = `Error al inicializar Google Calendar: ${error}`;
        this.cdr.detectChanges();
      });
  }

  signIn(): void {
    if (!this.isClientInitialized) {
      this.statusMessage = 'Inicializando cliente, por favor espera...';
      return;
    }

    this.statusMessage = 'Iniciando sesión en Google...';
    console.log("Verificando autenticación");

    if (!this.googleCalendarService.isUserAuthenticated()) {
      console.log("No autenticado, intentando iniciar sesión...");
      this.googleCalendarService.signIn().subscribe(
        () => {
          console.log("Sesión iniciada correctamente");
          this.isLogin = true;
          this.statusMessage = 'Sesión iniciada correctamente.';
          this.cdr.detectChanges(); // Forzar actualización de vista
          this.getCalendars();
          this.getFitData(); // Llamamos a getFitData una vez autenticado
        },
        (error: any) => {
          console.error("Error al iniciar sesión", error);
          this.statusMessage = `Error al iniciar sesión: ${error}`;
          this.cdr.detectChanges();
        }
      );
    } else {
      console.log("Ya autenticado");
      this.isLogin = true;
      this.statusMessage = 'Ya estás autenticado.';
      this.cdr.detectChanges();
      this.getCalendars();
      this.getFitData(); // Llamamos a getFitData si ya está autenticado
    }
  }

  getFitData() {
    // Verifica que el cliente esté inicializado y autenticado
    if (!this.isClientInitialized || !this.isLogin) {
      console.warn('Cliente no inicializado o usuario no autenticado.');
      return;
    }

    this.googleCalendarService.getFitData().subscribe(
      (data: any) => {
        // Procesa los datos de Google Fit
        const totalSteps = this.processFitData(data);
        this.fitData = { steps: totalSteps };
        this.isFitDataLoaded = true;
        this.statusMessage = 'Datos de Google Fit obtenidos correctamente.';
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error al obtener datos de Google Fit:', error);
        this.statusMessage = `Error al obtener datos de Google Fit: ${error}`;
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Procesa los datos de Google Fit para extraer el total de pasos
   */
  private processFitData(data: any): number {
    let totalSteps = 0;
    if (data && data.bucket) {
      data.bucket.forEach((bucket: any) => {
        bucket.dataset.forEach((dataset: any) => {
          dataset.point.forEach((point: any) => {
            if (point.value && point.value.length > 0) {
              totalSteps += point.value[0].intVal || 0;
            }
          });
        });
      });
    }
    return totalSteps;
  }

  signOut(): void {
    this.googleCalendarService.signOut();
    this.isLogin = false;
    this.statusMessage = 'Sesión cerrada correctamente.';
    this.listaEventos = [];
    this.listaCalendarios = [];
    this.fitData = {};
    this.isFitDataLoaded = false;
    this.cdr.detectChanges();
  }

  getCalendars(): void {
    if (!this.isLogin) {
      this.statusMessage = 'Debes iniciar sesión primero.';
      return;
    }

    this.googleCalendarService.getCalendars().subscribe(
      (calendars: any) => {
        this.listaCalendarios = calendars;
        this.selectedCalendarId = calendars.length > 0 ? calendars[0].id : 'primary';
        if (this.selectedCalendarId) {
          this.getEvents();
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.statusMessage = `Error al obtener calendarios: ${error}`;
        this.cdr.detectChanges();
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
        this.listaEventos = events.items || [];
        this.statusMessage = `Eventos obtenidos del calendario: ${this.selectedCalendarId}`;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.statusMessage = `Error al obtener eventos: ${error}`;
        this.cdr.detectChanges();
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
        this.getEvents();
        this.clearForm();
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.statusMessage = `Error al crear el evento: ${error}`;
        this.cdr.detectChanges();
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
