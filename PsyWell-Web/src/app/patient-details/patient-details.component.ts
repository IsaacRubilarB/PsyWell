import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/userService';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FichaPacienteComponent } from '../ficha-paciente/ficha-paciente.component';
import { PatientDataService } from 'app/services/patient-data.service';
import { ReportsComponent } from 'app/reports/reports.component';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { FichaService } from 'app/services/ficha.service'; 
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, FichaPacienteComponent, ReportsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PatientDetailsComponent implements AfterViewInit, OnInit {
  animateFlip: boolean = false;
  selectedPatientId: number | null = null;
  patientId: number = 0; 
  psychologistId: number | null = null; 
 
  patientDetails: any = {};
  bpm: number = 0; 
  saturationLevel: number = 0; 
  steps: number = 0; 
  sleep: number = 0; 
  
isFichaPacienteModalOpen = false;
  
bpmWeekly: number[] = []; 
saturationLevelWeekly: number[] = []; 
stepsWeekly: number[] = []; 
sleepWeekly: number[] = []; 
totalWeeklySteps: number = 0;

  showWeekly: boolean = false; 
  
  medications: any[] = [];
  appointments: any[] = [];
  psychologistName: string = 'Desconocido'; 

  isRealTime: boolean = true;

  @ViewChild('heartAnimation') heartAnimationDiv!: ElementRef;
  @ViewChild('saturationAnimation') saturationAnimationDiv!: ElementRef;
  @ViewChild('stepsAnimation') stepsAnimationDiv!: ElementRef;
  @ViewChild('sleepAnimation') sleepAnimationDiv!: ElementRef;

  @ViewChildren('pillBackground') pillBackgroundDivs!: QueryList<ElementRef>;
  @ViewChildren('calendarBackground') calendarBackgroundDivs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private patientDataService: PatientDataService,
    private afAuth: AngularFireAuth, 
    private fichaService: FichaService 

  ) {}



  async ngOnInit(): Promise<void> {
    try {
      this.psychologistId = await this.obtenerPsychologistId();
      
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (idFromRoute) {
        this.patientId = parseInt(idFromRoute, 10);
      }
  
      await this.obtenerDetallesPaciente(this.patientId.toString());
  
      if (this.patientDetails.email) {
        await this.loadPhysiologicalData(this.patientDetails.email);
      }
  
      this.cdr.detectChanges();
    } catch (error) {
      console.error('[PatientDetailsComponent] Error en ngOnInit:', error);
    }
  }
  

  private chartInstance: Chart | null = null;

  createMainWeeklyDataChart(): void {
    const canvas = document.getElementById('weeklyDataChartMain') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('No se encontró el elemento canvas para el gráfico principal.');
      return;
    }
  
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas.');
      return;
    }
  
    if (this.chartInstance) {
      this.chartInstance.destroy(); // Destruye el gráfico previo si existe
    }
  
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [
          {
            label: 'Frecuencia Cardíaca (BPM)',
            data: this.bpmWeekly,
            borderColor: '#ff1744',
            backgroundColor: 'rgba(255, 23, 68, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: '#ff1744',
            pointBorderColor: '#fff',
            pointRadius: 5,
          },
          {
            label: 'Saturación de Oxígeno (%)',
            data: this.saturationLevelWeekly,
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: '#42a5f5',
            pointBorderColor: '#fff',
            pointRadius: 5,
          },
          {
            label: 'Horas de Sueño',
            data: this.sleepWeekly,
            borderColor: '#66bb6a',
            backgroundColor: 'rgba(102, 187, 106, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: '#66bb6a',
            pointBorderColor: '#fff',
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#000000',
            bodyColor: '#000000',
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              size: 12,
            },
            anchor: 'end', // Posición en relación al punto (end = arriba)
            align: 'top', // Alineación de la etiqueta (top = encima del punto)
            formatter: function (value: number) {
              return value > 0 ? value : ''; // Mostrar solo si el valor es mayor a 0
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
        },
      },
      plugins: [ChartDataLabels], // Activa el plugin de etiquetas de datos
    });
    
  }
  
  
  


fetchLoggedPsychologistName(): void {
  this.afAuth.authState.subscribe((user) => {
    if (user?.email) {
      this.usersService.obtenerUsuarioPorCorreo(user.email).subscribe(
        (usuario) => {
          if (usuario) {
            this.psychologistName = usuario.nombre || 'Desconocido';
            console.log('ID del psicólogo logueado:', usuario.idUsuario);
          } else {
            console.warn('No se encontró un psicólogo asociado al correo:', user.email);
          }
        },
        (error) => {
          console.error('Error al obtener el psicólogo logueado:', error);
        }
      );
    } else {
      console.warn('No hay un usuario autenticado.');
    }
  });
}



async obtenerPsychologistId(): Promise<number | null> {
  console.log('[PatientDetailsComponent] Iniciando obtención del Psychologist ID');
  return new Promise<number | null>((resolve, reject) => {
    this.afAuth.authState.subscribe(
      (user) => {
        console.log('[PatientDetailsComponent] Usuario autenticado:', user?.email);
        if (user?.email) {
          this.usersService.obtenerUsuarioPorCorreo(user.email).subscribe(
            (usuario) => {
              if (usuario?.idUsuario) {
                console.log('[PatientDetailsComponent] Psychologist ID encontrado:', usuario.idUsuario);
                resolve(usuario.idUsuario);
              } else {
                console.warn('[PatientDetailsComponent] No se encontró un Psychologist ID para el correo:', user.email);
                resolve(null);
              }
            },
            (error) => {
              console.error('[PatientDetailsComponent] Error al obtener Psychologist ID:', error);
              reject(error);
            }
          );
        } else {
          console.warn('[PatientDetailsComponent] No hay un usuario autenticado.');
          resolve(null);
        }
      },
      (error) => {
        console.error('[PatientDetailsComponent] Error al obtener estado de autenticación:', error);
        reject(error);
      }
    );
  });
}




async obtenerDetallesPaciente(id: string): Promise<void> {
  try {
    const response: any = await this.usersService.obtenerUsuarioPorId(id).toPromise();
    const data = response?.data || {};
    
    // Establecer detalles básicos del paciente
    this.patientDetails = {
      id: id,
      name: data.nombre || 'Nombre desconocido',
      age: data.fechaNacimiento ? this.calculateAge(data.fechaNacimiento) : null,
      notes: data.notes || 'Sin notas',
      email: data.email || '',
      photo: this.getFirebaseImageUrl(data.email || '', 'profile'),
      diagnosis: 'Cargando...', // Inicializa el diagnóstico mientras se obtiene la ficha
    };

    console.log('Detalles básicos del paciente obtenidos:', this.patientDetails);

    // Llamar al servicio para obtener la ficha del paciente
    this.fichaService.obtenerFichaPorIdPaciente(Number(id)).subscribe(
      (fichaResponse) => {
        if (fichaResponse?.data?.diagnostico) {
          this.patientDetails.diagnosis = fichaResponse.data.diagnostico;
        } else {
          this.patientDetails.diagnosis = 'Sin diagnóstico'; // Valor predeterminado
        }
        console.log('Diagnóstico obtenido de la ficha:', this.patientDetails.diagnosis);
      },
      (error) => {
        console.error('Error al obtener la ficha del paciente:', error);
        this.patientDetails.diagnosis = 'Error al cargar diagnóstico';
      }
    );
  } catch (error) {
    console.error('Error al obtener detalles del paciente:', error);
    this.patientDetails.diagnosis = 'Error al cargar diagnóstico';
  }
}




  
  getPatientDetails(): any {
    return this.patientDetails;
  }
  

  private getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }

  calculateAge(fechaNacimiento: string | null): number | string {
    if (!fechaNacimiento) return 'Edad desconocida';
  
    // Intenta crear la fecha directamente
    const birthDate = new Date(fechaNacimiento);
  
    // Si la fecha no es válida, intenta dividir manualmente
    if (isNaN(birthDate.getTime())) {
      const dateParts = fechaNacimiento.split(/[-/]/); // Acepta "-" o "/"
      if (dateParts.length !== 3) return 'Edad desconocida';
  
      const [day, month, year] = dateParts.map(part => parseInt(part, 10));
      if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Edad desconocida';
  
      // Reconstruye la fecha
      const manualDate = new Date(year, month - 1, day);
      if (isNaN(manualDate.getTime())) return 'Edad desconocida';
      birthDate.setTime(manualDate.getTime());
    }
  
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Ajusta la edad si el cumpleaños no ha ocurrido este año
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  
    return isNaN(age) || age < 0 ? 'Edad desconocida' : age;
  }
  

  async loadPhysiologicalData(email: string): Promise<void> {
    try {
        console.log('Cargando datos fisiológicos para:', email);
  
        const physiologicalData = await this.patientDataService.getPhysiologicalData(email);
  
        if (physiologicalData) {
            console.log('Datos fisiológicos obtenidos:', physiologicalData);
  
            // Validar y asignar los datos en vivo
            this.bpm = parseInt(physiologicalData.bpm, 10) || 0;
            this.saturationLevel = parseInt(physiologicalData.oxygen, 10) || 0;
            this.steps = parseInt(physiologicalData.steps, 10) || 0;
            this.sleep = parseInt(physiologicalData.sleep, 10) || 0;
  
            // Inicializar arrays para los datos semanales
            const weeklyBpm: number[] = Array(7).fill(0);
            const weeklySaturation: number[] = Array(7).fill(0);
            const weeklySleep: number[] = Array(7).fill(0);
            const weeklySteps: number[] = Array(7).fill(0); // NUEVO: Agregar los pasos semanales
  
            // Verificar si hay datos semanales
            if (physiologicalData.fecha) {
                const date = new Date(physiologicalData.fecha);
                const dayOfWeek = (date.getDay() + 6) % 7; // Ajustar para que Lunes = 0, Domingo = 6
  
                // Asignar los datos al día correspondiente
                weeklyBpm[dayOfWeek] = parseInt(physiologicalData.bpmSemanal, 10) || 0;
                weeklySaturation[dayOfWeek] = parseInt(physiologicalData.oxygenSemanal, 10) || 0;
                weeklySleep[dayOfWeek] = parseInt(physiologicalData.sleepSemanal, 10) || 0;
                weeklySteps[dayOfWeek] = parseInt(physiologicalData.stepsSemanal, 10) || 0; // NUEVO: Asignar pasos
            }
  
            // Asignar los datos procesados a las variables semanales
            this.bpmWeekly = weeklyBpm;
            this.saturationLevelWeekly = weeklySaturation;
            this.sleepWeekly = weeklySleep;
            this.stepsWeekly = weeklySteps; // NUEVO: Asignar pasos a la variable
  
            // Calcular el total de pasos semanales
            this.calculateTotalWeeklySteps();
  
            // Crear el gráfico si hay datos disponibles
            if (
                this.bpmWeekly.length > 0 ||
                this.saturationLevelWeekly.length > 0 ||
                this.sleepWeekly.length > 0 ||
                this.stepsWeekly.length > 0 // NUEVO: Incluir pasos en la validación
            ) {
                this.createMainWeeklyDataChart(); // Gráfico principal
            }
        } else {
            console.warn('No se encontraron datos fisiológicos para el correo proporcionado.');
        }
    } catch (error) {
        console.error('Error al cargar datos fisiológicos:', error);
    }
}

  
  calculateTotalWeeklySteps(): void {
    this.totalWeeklySteps = this.stepsWeekly.reduce((total, steps) => total + steps, 0);
  }

  
  


 
  

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.loadAnimations();
    this.loadPillAnimations();
    this.loadCalendarAnimations();
  }

  loadAnimations() {
    lottie.loadAnimation({
      container: this.heartAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/bpm.json',
    });

    lottie.loadAnimation({
      container: this.saturationAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/saturation.json',
    });

    lottie.loadAnimation({
      container: this.stepsAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/steps.json',
    });

    lottie.loadAnimation({
      container: this.sleepAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/sleep.json',
    });
  }

  loadPillAnimations() {
    this.pillBackgroundDivs.forEach((pillBackgroundDiv) => {
      lottie.loadAnimation({
        container: pillBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/pill.json',
      });
    });
  }

  loadCalendarAnimations() {
    this.calendarBackgroundDivs.forEach((calendarBackgroundDiv) => {
      lottie.loadAnimation({
        container: calendarBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/calendar.json',
      });
    });
  }

  goBack() {
    this.router.navigate(['/patients']);
  }




  openFichaPacienteModal(patientId?: string | number): void {
    // Verificar y asignar el ID del paciente
    if (patientId) {
      this.patientId = +patientId; // Convertir a número
    }
  
    if (!this.patientId || this.patientId <= 0) {
      console.warn('El ID del paciente es inválido o no está definido.');
      return;
    }
  
    // Verificar si el ID del psicólogo está definido
    if (!this.psychologistId || this.psychologistId <= 0) {
      console.warn('El ID del psicólogo es inválido o no está definido.');
      return;
    }
  
    // Abrir el modal
    this.isFichaPacienteModalOpen = true;
  }
  
  closeFichaPacienteModal(): void {
    this.isFichaPacienteModalOpen = false;
  
    // Actualizar datos del paciente para ReportsComponent
    if (this.patientId) {
      console.log('Actualizando ReportsComponent con ID del paciente:', this.patientId);
      this.patientDetails.id = this.patientId;
      this.patientDetails.name = this.patientDetails.name || 'Nombre desconocido';
    }
  }
  





  async toggleDataView(): Promise<void> {
    this.showWeekly = !this.showWeekly; // Alternar entre semanal y en vivo
    this.animateFlip = true;
  
    setTimeout(() => {
      this.animateFlip = false;
    }, 600);
  
    if (this.patientDetails.email) {
      await this.loadPhysiologicalData(this.patientDetails.email);
    }
  }
  
  
}
