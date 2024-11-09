import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module'; // Rutas ya configuradas
import { CommonModule } from '@angular/common'; // Módulo común si es necesario
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,  // Importando rutas que ya tienen los componentes standalone configurados
    CommonModule,  // Solo si es necesario
  ],
  bootstrap: []  // Componente principal que inicia la aplicación
})
export class AppModule {}
