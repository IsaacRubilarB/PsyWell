import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleFitService } from '../services/google-fit.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-google-fit',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './google-fit.component.html',
  styleUrls: ['./google-fit.component.scss'],
})
export class GoogleFitComponent implements OnInit {
  stepsData: any;
  isLogin: boolean = false;
  errorMessage: string | null = null;

  constructor(private googleFitService: GoogleFitService) {}

  ngOnInit(): void {
    console.log('GoogleFitComponent loaded');
    this.checkSignInStatus();
  }

  // Verifica si el usuario está autenticado
  checkSignInStatus(): void {
    this.isLogin = this.googleFitService.isUserAuthenticated();
    if (this.isLogin) {
      // Si está autenticado, obtiene los datos de pasos
      this.getSteps();
    } else {
      console.log('User not signed in');
    }
  }

  // Maneja el inicio de sesión con Google Fit
  signIn(): void {
    this.googleFitService.signIn().then(() => {
      console.log('Google Fit sign-in successful');
      this.isLogin = true;
      this.getSteps();
    }).catch((error) => {
      console.error('Sign-in error:', error);
      this.errorMessage = 'Error signing in to Google Fit.';
    });
  }

  // Maneja el cierre de sesión con Google Fit
  signOut(): void {
    this.googleFitService.signOut().then(() => {
      console.log('Google Fit sign-out successful');
      this.isLogin = false;
      this.stepsData = null; // Limpiar los datos de pasos al cerrar sesión
    }).catch((error) => {
      console.error('Sign-out error:', error);
      this.errorMessage = 'Error signing out from Google Fit.';
    });
  }

  // Obtiene los datos de pasos del usuario
  getSteps(): void {
    this.googleFitService.getStepsData().subscribe({
      next: (data) => {
        this.stepsData = data;
        this.errorMessage = null; // Limpia cualquier mensaje de error si se obtienen datos
      },
      error: (error) => {
        console.error('Error fetching steps data:', error);
        this.errorMessage = 'Failed to fetch steps data.';
      }
    });
  }
}
