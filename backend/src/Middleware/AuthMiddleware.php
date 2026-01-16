<?php
declare(strict_types=1);

namespace DrawArena\Middleware;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Utils\JwtManager;

class AuthMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $token = $request->getBearerToken();

        if (!$token) {
            $response->error('Missing authorization token', 401)->send();
        }

        $jwtManager = new JwtManager();
        $decoded = $jwtManager->verifyToken($token);

        if (!$decoded) {
            $response->error('Invalid or expired token', 401)->send();
        }

        // Store user data in request for later use
        $_REQUEST['authenticated_user'] = $decoded;
    }
}
