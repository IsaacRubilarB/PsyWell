import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarIntegrationComponent } from './calendar-integration.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    CalendarIntegrationComponent // Declaramos e importamos el componente standalone
  ],
  exports: [CalendarIntegrationComponent]
})
export class CalendarIntegrationModule {}
