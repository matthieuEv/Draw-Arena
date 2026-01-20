# Backend | Draw-Arena

API REST PHP pure avec authentification JWT

## Architecture

```
backend/
├── src/
│   ├── Core/           # Router, Request, Response
│   ├── Middleware/     # CORS, Auth
│   ├── Handlers/       # Logique des routes (Auth, Utilisateur, etc.)
│   ├── Models/         # Accès aux données (Utilisateur, Competiteur, Concours, etc.)
│   └── Utils/          # JWT, Database, Validator
├── public/
│   └── index.php       # Point d'entrée unique
├── index.php           # Redirection vers public/
├── composer.json       # Dépendances PHP
├── Dockerfile          # Configuration Docker
└── apache.conf         # Configuration Apache

database/
├── init.sql            # Création des tables
└── insertion.sql       # Données de test
```

## Démarrage

```bash
# Démarrer tous les services
docker compose up -d

# Tester l'API
curl http://localhost:8000/api/health
# Réponse: {"status":"ok"}

# Voir les logs
docker compose logs -f backend
```

## Routes API

### Authentification (Public - Pas de token requis)

#### Register - Créer un compte
**POST** `/api/auth/register`

Request:
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "login": "jean@example.fr",
  "password": "password123",
  "typeCompte": "prive",
  "adresse": "10 Rue de Paris",
  "numClub": null
}
```

Response (201 Created):
```json
{
  "message": "User registered successfully"
}
```

#### Login - Se connecter
**POST** `/api/auth/login`

Request:
```json
{
  "login": "jean@example.fr",
  "password": "password123"
}
```

Response (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJudW1VdGlsaXNhdGV1ciI6MSwibm9tIjoiRHVwb250IiwiLi4uIn0.signature",
  "role": "admin",
  "club": 1,
}
```

### Health Check (Public)

**GET** `/api/health`

Response (200 OK):
```json
{
  "status": "ok"
}
```

## JWT Token

### Structure du token

Le token JWT contient les informations de l'utilisateur et est signé avec `JWT_SECRET` :

```
Header: {"typ":"JWT","alg":"HS256"}
Payload: {
  "numUtilisateur": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "login": "jean@example.fr",
  "typeCompte": "prive",
  "iat": 1673456789,    // issued at
  "exp": 1673460389     // expiration (1 heure)
}
Signature: ...
```

### Utiliser le token

Ajouter le token dans l'en-tête `Authorization` :

```bash
curl http://localhost:8000/api/utilisateur/me \
  -H "Authorization: Bearer eyJ0eXAi..."
```

## Configuration

Variables d'environnement (.env.local) :

```env
# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=drawarena
DB_USER=drawarena
DB_PASS=drawarena

# JWT
JWT_SECRET=ta_cle_secrete_ici
JWT_EXPIRY=3600

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Azure Storage (optionnel)
STORAGE_ACCOUNT_NAME=devstoreaccount1
STORAGE_BLOB_ENDPOINT=http://azurite:10000/devstoreaccount1
```

## Modèles

### Utilisateur
- `numUtilisateur` (PK)
- `nom` - Nom complet
- `prenom` - Prénom
- `adresse` - Adresse
- `login` - Identifiant de connexion (unique)
- `motDePasse` - Hash bcrypt
- `typeCompte` - 'prive' ou 'public'
- `numClub` - Référence à un club (nullable)

### Rôles (hérités de Utilisateur)
- **Administrateur** : dateDebut
- **Directeur** : dateDebut

### Concours
- `numConcours` (PK)
- `theme` - Thème du concours
- `dateDebut`, `dateFin` - Dates
- `etat` - 'pas commence', 'en cours', 'attente', 'resultat', 'evalue'
- `numClub` - Club organisateur
- `numPresident` - Président responsable

### Relations
- `Concours_Competiteur` - Compétiteurs inscrits à un concours
- `Concours_Evaluateur` - Évaluateurs d'un concours
- `Club_Directeur` - Directeurs d'un club
- `Club_Concours` - Concours d'un club

## Données de test

À la création du container, les utilisateurs de test suivants sont créés :

| Login | Password | Type | Rôle |
|-------|----------|------|------|
| a@a.fr | password | public | Compétiteur |
| marie@example.fr | password | prive | Compétiteur |
| admin@example.fr | password | public | Admin/Président |

## Technologies

- **PHP 8.2** avec Apache
- **MariaDB 10.8** pour la base de données
- **Firebase JWT** pour l'authentification
- **Docker** pour l'orchestration
- **Composer** pour les dépendances

## Développement

```bash
# Installer les dépendances
composer install

# Voir les logs du backend
docker compose logs -f backend

# Redémarrer le backend
docker compose restart backend

# Nettoyer la BD
docker compose down -v

### Utilisateur (Protégé)

**GET** `/api/user/{id}`
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
