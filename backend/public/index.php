<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/bootstrap.php';

use DrawArena\Core\Router;
use DrawArena\Middleware\CorsMiddleware;
use DrawArena\Middleware\AuthMiddleware;
use DrawArena\Handlers\AuthHandler;
use DrawArena\Handlers\ClubHandler;
use DrawArena\Handlers\ConcoursHandler;
use DrawArena\Handlers\CompetiteurHandler;
use DrawArena\Handlers\EvaluationHandler;

$router = new Router();

// Global middlewares (applies to ALL routes)
$router->use(new CorsMiddleware());

// PUBLIC ROUTES (no authentication required)
$router->get('/api/health', function ($request, $response) {
    $response->success(['ok' => true])->send();
});
$router->post('/api/auth/register', [AuthHandler::class, 'register']);
$router->post('/api/auth/login', [AuthHandler::class, 'login']);

// PROTECTED ROUTES (require JWT authentication)
// Club routes
$router->get('/api/club', [ClubHandler::class, 'getAllClub'], [new AuthMiddleware()]);
$router->get('/api/club/{clubId}', [ClubHandler::class, 'getClubById'], [new AuthMiddleware()]);
$router->get('/api/club/{clubId}/users', [ClubHandler::class, 'getClubUsers'], [new AuthMiddleware()]);

// concours routes
$router->get('/api/concours', [ConcoursHandler::class, 'getAllConcours'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}', [ConcoursHandler::class, 'getConcoursById'], [new AuthMiddleware()]);
$router->get('/api/concours/{concoursId}/users', [ConcoursHandler::class, 'getConcoursCompetiteur'], [new AuthMiddleware()]);
// $router->get('/api/concours/{concoursId}/dessins', [ConcoursHandler::class, 'getConcoursDessins'], [new AuthMiddleware()]);

// Competiteur routes
$router->get('/api/competiteur', [CompetiteurHandler::class, 'getAllCompetiteur'], [new AuthMiddleware()]);
// Obligation 4
$router->get('/api/competiteur/warriors', [CompetiteurHandler::class, 'getWarriors'], [new AuthMiddleware()]);

// Evaluation routes
// Cas sans year filter - Obligation 3
// Cas avec year filter - Obligation 2
$router->get('/api/evaluation', [EvaluationHandler::class, 'getAllEvaluation'], [new AuthMiddleware()]);
// Obligation 5
$router->get('/api/evaluation/best/region', [EvaluationHandler::class, 'getBestRegion'], [new AuthMiddleware()]);
// Obligation 5.1 (For the fun beacause it's easy to do)
$router->get('/api/evaluation/best/competiteur', [EvaluationHandler::class, 'getBestCompetiteur'], [new AuthMiddleware()]);

// Dispatch the request to matching route
$router->dispatch();
