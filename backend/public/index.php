<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use DrawArena\Core\Router;
use DrawArena\Middleware\CorsMiddleware;
use DrawArena\Middleware\AuthMiddleware;
use DrawArena\Handlers\AuthHandler;
use DrawArena\Handlers\ClubHandler;
use DrawArena\Handlers\ConcoursHandler;
use DrawArena\Handlers\CompetiteurHandler;
use DrawArena\Handlers\EvaluationHandler;
use DrawArena\Handlers\UtilisateurHandler;
use DrawArena\Handlers\DocsHandler;
use DrawArena\Handlers\OpenApiHandler;
use DrawArena\Models\Club;
use DrawArena\Models\Utilisateur;
use DrawArena\Models\Evaluation;

$router = new Router();

// Global middlewares (applies to ALL routes)
$router->use(new CorsMiddleware());

// DOCUMENTATION ROUTES
$router->get('/api/docs', [DocsHandler::class, 'getDocs']);
$router->get('/api/openapi', [OpenApiHandler::class, 'getSpec']);

// PUBLIC ROUTES (no authentication required)
$router->get('/api/health', function ($request, $response) {
    $response->success(['ok' => true])->send();
});
$router->post('/api/auth/register', [AuthHandler::class, 'register']);
$router->post('/api/auth/login', [AuthHandler::class, 'login']);

// PROTECTED ROUTES (require JWT authentication)
// Utilisateur routes
$router->get('/api/utilisateur/count', function ($request, $response) {
    $response->success(['count' => Utilisateur::count()])->send();
}, [new AuthMiddleware()]);
$router->get('/api/utilisateur/{userId}/dessins', [UtilisateurHandler::class, 'getUserDessins'], [new AuthMiddleware()]);
$router->get('/api/utilisateur/{userId}/stats', [UtilisateurHandler::class, 'getUserStats'], [new AuthMiddleware()]);

// Club routes
$router->get('/api/club', [ClubHandler::class, 'getAllClub'], [new AuthMiddleware()]);
$router->get('/api/club/count', function ($request, $response) {
    $response->success(['count' => Club::count()])->send();
}, [new AuthMiddleware()]);
$router->get('/api/club/{clubId}', [ClubHandler::class, 'getClubById'], [new AuthMiddleware()]);
$router->get('/api/club/{clubId}/users', [ClubHandler::class, 'getClubUsers'], [new AuthMiddleware()]);
$router->get('/api/club/{clubId}/user/{userId}', [ClubHandler::class, 'getClubUserById'], [new AuthMiddleware()]);
$router->get('/api/club/{clubId}/concours', [ClubHandler::class, 'getClubConcours'], [new AuthMiddleware()]);

// concours routes
$router->get('/api/concours', [ConcoursHandler::class, 'getAllConcours'], [new AuthMiddleware()]);
// Obligation 6
$router->get('/api/concours/best', [ConcoursHandler::class, 'getBest'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}', [ConcoursHandler::class, 'getConcoursById'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}/top', [ConcoursHandler::class, 'getConcoursTop'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}/users', [ConcoursHandler::class, 'getConcoursCompetiteurs'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}/user/{userId}', [ConcoursHandler::class, 'getConcoursCompetiteur'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}/dessins', [ConcoursHandler::class, 'getConcoursDessins'], [new AuthMiddleware()]);

// Competiteur routes
$router->get('/api/competiteur', [CompetiteurHandler::class, 'getAllCompetiteur'], [new AuthMiddleware()]);
// Obligation 4
$router->get('/api/competiteur/warriors', [CompetiteurHandler::class, 'getWarriors'], [new AuthMiddleware()]);

// Evaluation routes
// Cas sans year filter - Obligation 3
// Cas avec year filter - Obligation 2
$router->get('/api/evaluation', [EvaluationHandler::class, 'getAllEvaluation'], [new AuthMiddleware()]);
$router->get('/api/evaluation/count', function ($request, $response) {
   $response->success(['count' => Evaluation::count()])->send();
}, [new AuthMiddleware()]);
// Obligation 5
$router->get('/api/evaluation/best/region', [EvaluationHandler::class, 'getBestRegion'], [new AuthMiddleware()]);
// Obligation 5.1 (For the fun beacause it's easy to do)
$router->get('/api/evaluation/best/competiteur', [EvaluationHandler::class, 'getBestCompetiteur'], [new AuthMiddleware()]);

// Dispatch the request to matching route
$router->dispatch();
