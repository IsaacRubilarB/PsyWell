export interface Cita {
  idCita: number;
  idPaciente: number;
  idPsicologo: number | null;
  ubicacion: string;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  comentarios: string;
  nombrePaciente?: string; // Opcional
}

export interface ListaCitasResponse {
  status: string;
  data: Cita[];
}
