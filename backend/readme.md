# Backend | Draw-Arena

## Viewing Logs

To view the current App Service logs for the backend from your local machine, use the Azure CLI:

```bash
az webapp log tail --name draw-arena-backend-app --resource-group draw-arena-rg
```

This streams the live logs from the `draw-arena-backend-app` App Service.
API REST PHP pure avec authentification JWT

## Architecture

```
src/
├── Core/           # Router, Request, Response
├── Middleware/     # CORS, Auth
├── Handlers/       # Logique des routes
├── Models/         # Accès aux données
├── Utils/          # JWT, Database, Validator
└── bootstrap.php   # Configuration
public/
└── index.php       # Point d'entrée unique
```

## Routes API

### Authentification (Public)

**POST** `/api/auth/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```
Response:
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLC...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Utilisateur (Protégé)

**GET** `/api/user/profile`
Headers: `Authorization: Bearer {token}`

### Posts (Protégé)

**POST** `/api/posts`
Headers: `Authorization: Bearer {token}`
```json
{
  "title": "Mon premier post",
  "content": "Contenu du post...",
  "image_url": "https://example.com/image.jpg" // Optionnel
}
```

**GET** `/api/posts?limit=10&offset=0`
Headers: `Authorization: Bearer {token}`

## Configuration

Variables d'environnement dans `.env.local`:

```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=3600

# Database
DB_HOST=db
DB_NAME=drawarena
DB_USER=drawarena
DB_PASS=drawarena

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## Développement

Avec Docker:
```bash
docker-compose up
```

L'API sera disponible sur `http://localhost:8000`

## Structure du code

- **Handlers**: Gèrent les requêtes HTTP
- **Models**: Interaction avec la base de données
- **Middleware**: Filtres (CORS, Auth)
- **Utils**: Services réutilisables (JWT, Database)
- **Core**: Classe fondamentales (Router, Request, Response)
