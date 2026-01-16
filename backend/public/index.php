<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/bootstrap.php';

use DrawArena\Core\Router;
use DrawArena\Middleware\CorsMiddleware;
use DrawArena\Middleware\AuthMiddleware;
use DrawArena\Handlers\AuthHandler;
use DrawArena\Handlers\UserHandler;

$router = new Router();

// Global middlewares
$router->use(new CorsMiddleware());

// Public routes (authentication)
$router->post('/api/auth/register', [AuthHandler::class, 'register']);
$router->post('/api/auth/login', [AuthHandler::class, 'login']);

// Protected routes (require JWT auth)
$router->use(new AuthMiddleware());

// $router->get('/api/user', [UserHandler::class, 'getProfile']);

// Dispatch request
$router->dispatch();
