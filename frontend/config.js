// Utiliser l'API locale en développement, ou Azure en production
window.API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:8000/index.php/api"
  : "https://draw-arena-backend-app.azurewebsites.net/index.php/api";
