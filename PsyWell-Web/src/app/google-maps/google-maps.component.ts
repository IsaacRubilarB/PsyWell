import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-google-maps',
  standalone: true,
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit {
  @Output() locationSelected = new EventEmitter<string>();
  map: any;
  searchBox: any;
  selectedAddress: string = 'Ninguna dirección seleccionada';

  latitude = -33.447487; // Coordenadas iniciales (Santiago de Chile)
  longitude = -70.673676;
  zoom = 14;
  private marker: any;

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const mapOptions = {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: this.zoom,
    };

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    const input = document.getElementById('searchBox') as HTMLInputElement;
    this.searchBox = new google.maps.places.SearchBox(input);

    this.searchBox.addListener('places_changed', () => {
      const places = this.searchBox.getPlaces();
      if (!places || places.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin resultados',
          text: 'No se encontró ningún lugar. Intenta con otra dirección.',
        });
        return;
      }

      const place = places[0];
      if (!place.geometry || !place.geometry.location) {
        console.error('El lugar seleccionado no tiene información geográfica.');
        return;
      }

      this.setMarker({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });

      this.map.setCenter(place.geometry.location);
      this.map.setZoom(this.zoom);
    });

    this.map.addListener('bounds_changed', () => {
      this.searchBox.setBounds(this.map.getBounds());
    });

    this.map.addListener('click', (event: any) => {
      if (event.latLng) {
        const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        this.setMarker(position);
      }
    });
  }

  setMarker(position: { lat: number; lng: number }): void {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new google.maps.Marker({
      position,
      map: this.map,
      animation: google.maps.Animation.DROP,
    });

    this.map.setCenter(position);

    this.getAddressFromCoordinates(position.lat, position.lng);
  }

  getAddressFromCoordinates(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          this.selectedAddress = results[0].formatted_address;
          this.locationSelected.emit(this.selectedAddress);
        } else {
          this.selectedAddress = 'No se pudo obtener la dirección.';
        }
      }
    );
  }

  searchLocation(): void {
    const query = (document.getElementById('searchBox') as HTMLInputElement).value;
    if (!query) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Por favor, ingrese una dirección.',
      });
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results: any, status: any) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        this.setMarker({ lat: location.lat(), lng: location.lng() });
        this.map.setZoom(this.zoom);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ubicación no encontrada',
          text: 'No se encontró la ubicación. Verifique la dirección.',
        });
      }
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.setMarker(location);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener la ubicación actual.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Geolocalización no es soportada por el navegador.',
      });
    }
  }
}
