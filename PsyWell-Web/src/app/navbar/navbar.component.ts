import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule] // Importamos RouterModule para que funcionen los routerLink
})

export class NavbarComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const menu = document.querySelector('.navbar-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (menu && hamburger) {
      menu.classList.toggle('open', this.isMenuOpen);
      hamburger.classList.toggle('open', this.isMenuOpen);
    }
  }
}
