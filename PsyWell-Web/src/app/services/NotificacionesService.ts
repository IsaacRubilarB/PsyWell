import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { CitasService } from './citasService';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private nuevasCitasCount = new BehaviorSubject<number>(0);
  nuevasCitasCount$ = this.nuevasCitasCount.asObservable();

  private nuevasCitas = new BehaviorSubject<any[]>([]);
  nuevasCitas$ = this.nuevasCitas.asObservable();

  private citasVistas = new Set<number>(); // Almacena las citas vistas por el psicólogo
  private actualizandoCitas = false; // Bandera para evitar múltiples suscripciones

  constructor(private citasService: CitasService) {
    this.cargarCitasIniciales(); // Inicializa citas vistas
    this.iniciarActualizacionCitas(); // Comienza la actualización automática de citas
  }

  /**
   * Incrementa las notificaciones de nuevas citas.
   * @param citas Array de nuevas citas.
   */
  private agregarCitas(citas: any[]) {
    const actuales = this.nuevasCitas.getValue();
    const nuevas = citas.filter((cita) => !actuales.find((a) => a.idCita === cita.idCita)); // Evita duplicados
    const actualizadas = [...actuales, ...nuevas];
    this.nuevasCitas.next(actualizadas);
    this.nuevasCitasCount.next(actualizadas.length);
  }

  /**
   * Resetea las notificaciones de nuevas citas.
   */
  resetearNuevasCitas() {
    this.nuevasCitas.next([]);
    this.nuevasCitasCount.next(0);
  }

  /**
   * Marca las citas específicas como vistas por el psicólogo.
   */
  marcarCitasComoVistas(idsCitas: number[]) {
    idsCitas.forEach((id) => this.citasVistas.add(id));
    const nuevasCitas = this.nuevasCitas.getValue().filter(
      (cita) => !this.citasVistas.has(cita.idCita)
    );
    this.nuevasCitas.next(nuevasCitas);
    this.nuevasCitasCount.next(nuevasCitas.length);
  }

  /**
   * Carga las citas existentes como vistas al iniciar el servicio.
   */
  private cargarCitasIniciales() {
    this.citasService.listarCitas().subscribe({
      next: (response) => {
        if (response?.data) {
          response.data.forEach((cita: any) => this.citasVistas.add(cita.idCita));
        }
      },
      error: (error) => console.error('Error al cargar citas iniciales:', error),
    });
  }

  /**
   * Inicia la actualización automática de nuevas citas.
   */
  private iniciarActualizacionCitas() {
    if (!this.actualizandoCitas) {
      this.actualizandoCitas = true;
      interval(10000) // Ejecuta cada 10 segundos
        .pipe(
          switchMap(() => this.citasService.obtenerNuevasCitas()),
          catchError((error) => {
            console.error('Error al obtener nuevas citas:', error);
            return of([]); // Devuelve un array vacío en caso de error
          })
        )
        .subscribe((nuevasCitas) => {
          const noVistas = nuevasCitas.filter(
            (cita) => !this.citasVistas.has(cita.idCita)
          );
          if (noVistas.length > 0) {
            noVistas.forEach((cita) => this.citasVistas.add(cita.idCita)); // Marca como vistas al agregarlas
            this.agregarCitas(noVistas);
          }
        });
    }
  }
}
