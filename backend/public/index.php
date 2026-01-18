<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/bootstrap.php';

use DrawArena\Core\Router;
use DrawArena\Middleware\CorsMiddleware;
use DrawArena\Middleware\AuthMiddleware;
use DrawArena\Handlers\AuthHandler;

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
// $router->get('/api/utilisateur/me', [UtilisateurHandler::class, 'getCurrentUser'], [new AuthMiddleware()]);
// $router->put('/api/utilisateur/me', [UtilisateurHandler::class, 'updateCurrentUser'], [new AuthMiddleware()]);
// $router->get('/api/utilisateurs', [UtilisateurHandler::class, 'listUsers'], [new AuthMiddleware()]);

// Dispatch the request to matching route
$router->dispatch();
