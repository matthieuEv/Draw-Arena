// Configuration de l'API en fonction de l'environnement
// Cette valeur sera remplacée automatiquement lors du déploiement CI/CD
// Format: window.API_BASE = "BACKEND_API_URL_PLACEHOLDER"
window.API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:8000/api"
  : "BACKEND_API_URL_PLACEHOLDER";
