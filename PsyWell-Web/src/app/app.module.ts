import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar FormsModule
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// Firebase imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // IMPORTADO PARA AUTENTICACIÓN
import { environment } from 'environments/environments';
import { NavbarComponent } from './navbar/navbar.component';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NotasComponent } from './notas/notas.component';
import { GoogleMapsComponent } from './google-maps/google-maps.component'; // Asegúrate de usar la ruta correcta
import { SafeUrlPipe } from './pipes/safe-url.pipe'; // Importa el pipe aquí
import { BibliotecaComponent } from './biblioteca/biblioteca.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule, // Asegúrate de incluirlo aquí
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    NavbarComponent,
    NotasComponent,
    GoogleMapsComponent,
    SafeUrlPipe, // Añadido aquí, como los demás componentes
    BibliotecaComponent,

    // Firebase initialization
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule, // AÑADIDO PARA AUTENTICACIÓN

    // Angular Material Modules
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  providers: [],
  bootstrap: [AppModule], // Cambiado a AppComponent (componente raíz)
})
export class AppModule {}
