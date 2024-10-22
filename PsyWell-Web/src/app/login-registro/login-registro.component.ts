import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';  // Importamos el Router para hacer la redirección

@Component({
  selector: 'app-login-registro',
  standalone: true,  
  imports: [CommonModule, FormsModule], 
  templateUrl: './login-registro.component.html',
  styleUrls: ['./login-registro.component.scss']
})
export class LoginRegistroComponent {
  isLogin = true;  // Variable para alternar entre login y registro

  constructor(private router: Router) {}  // Inyectamos el Router en el constructor

  flip() {
    this.isLogin = !this.isLogin;  // Cambia entre login y registro
  }

  // Método temporal para simular el ingreso y redirigir al dashboard
  onLogin() {
    this.router.navigate(['/dashboard']);  // Redirige al dashboard
  }
}
