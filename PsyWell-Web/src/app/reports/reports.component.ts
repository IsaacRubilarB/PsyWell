import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [CommonModule, NavbarComponent], // Asegurarse de incluir NavbarComponent
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Manejar elementos personalizados
})
export class ReportsComponent implements AfterViewInit {

  @ViewChildren('informeAnimation') informeAnimationDivs!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    this.loadInformeAnimations();
  }

  loadInformeAnimations() {
    this.informeAnimationDivs.forEach((informeDiv) => {
      lottie.loadAnimation({
        container: informeDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/informe.json'
      });
    });
  }
}
