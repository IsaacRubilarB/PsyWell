import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,  
  imports: [CommonModule, NavbarComponent],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Importar schemas para evitar errores de componentes personalizados
})
export class PatientDetailsComponent implements AfterViewInit {
  patientId: string | null = null;
  patientDetails: any = {};
  bpm: number = 75;
  sleepHours: number = 7;
  stressLevel: number = 40;

  @ViewChild('heartAnimation') heartAnimationDiv!: ElementRef;
  @ViewChild('sleepAnimation') sleepAnimationDiv!: ElementRef;
  @ViewChild('stressAnimation') stressAnimationDiv!: ElementRef;

  @ViewChildren('pillBackground') pillBackgroundDivs!: QueryList<ElementRef>;
  @ViewChildren('calendarBackground') calendarBackgroundDivs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    this.patientDetails = this.getPatientDetails(this.patientId);
    this.cdr.detectChanges();
    this.loadAnimations(); 
    this.simulateBpmChange(); 
    this.simulateSleepHoursChange();
    this.loadStressAnimation(); 
    this.loadPillAnimations(); 
    this.loadCalendarAnimations(); // Cargar la animación en las citas
  }

  loadAnimations() {
    lottie.loadAnimation({
      container: this.heartAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/bpm.json' 
    });

    lottie.loadAnimation({
      container: this.sleepAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/sueno.json' 
    });
  }

  // Simular el cambio de BPM dinámico
  simulateBpmChange() {
    setInterval(() => {
      this.bpm = Math.floor(Math.random() * (90 - 60 + 1) + 60); 
      this.cdr.detectChanges();
    }, 2000);
  }

  // Simular el cambio de las horas de sueño dinámico
  simulateSleepHoursChange() {
    setInterval(() => {
      this.sleepHours = Math.floor(Math.random() * (9 - 5 + 1) + 5); 
      this.cdr.detectChanges();
    }, 3000);
  }

  loadStressAnimation() {
    const stressAnimation = lottie.loadAnimation({
      container: this.stressAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/lottie/stress.json' 
    });

    setInterval(() => {
      this.stressLevel = Math.floor(Math.random() * 100); 
      
      const frame = Math.round((this.stressLevel / 100) * (stressAnimation.totalFrames - 1)); 
      
      stressAnimation.goToAndStop(frame, true); 
      this.cdr.detectChanges(); 
    }, 2000); 
  }

  // Cargar la animación de fondo en las tarjetas de medicamentos
  loadPillAnimations() {
    this.pillBackgroundDivs.forEach((pillBackgroundDiv) => {
      lottie.loadAnimation({
        container: pillBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/pill.json' 
      });
    });
  }

  // Cargar la animación de fondo en las tarjetas de citas
  loadCalendarAnimations() {
    this.calendarBackgroundDivs.forEach((calendarBackgroundDiv) => {
      lottie.loadAnimation({
        container: calendarBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/calendar.json' 
      });
    });
  }

  getPatientDetails(id: string | null) {
    const patients = [
      { id: '1', name: 'Cristina Zapata', age: 25, diagnosis: 'Depresión', notes: 'Paciente en seguimiento.' },
      { id: '2', name: 'Juan Pérez', age: 30, diagnosis: 'Ansiedad', notes: 'Sesiones semanales de terapia.' },
      { id: '3', name: 'Cristopher Soto', age: 23, diagnosis: 'Depresión Severa', notes: 'Sesiones semanales de terapia, vigilancia continua.' }
    ];
    return patients.find(patient => patient.id === id);
  }

  medications = [
    { name: 'Paroxetina', description: 'Recetado para la ansiedad' },
    { name: 'Sertralina', description: 'Recetado para la depresión' },
  ];

  appointments = [
    { date: '2024-10-01', time: '10:00 AM', description: 'Sesión de terapia' },
    { date: '2024-10-15', time: '2:00 PM', description: 'Revisión psiquiátrica' },
  ];

  goBack() {
    this.router.navigate(['/patients']);
  }

  generateReport() {
    this.router.navigate(['/reports']);
  }
}
