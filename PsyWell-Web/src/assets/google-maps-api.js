// Cargar dinámicamente la API de Google Maps
(function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAFJUcrBDDLPM2SscMvi1x_jUv6Wlqnukg';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  })();
  