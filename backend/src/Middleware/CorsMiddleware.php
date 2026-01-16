<?php
declare(strict_types=1);

namespace DrawArena\Middleware;

use DrawArena\Core\Request;
use DrawArena\Core\Response;

class CorsMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $allowedOrigins = array_filter(
            array_map('trim', explode(',', getenv('ALLOWED_ORIGINS') ?: '')),
            fn($o) => $o !== ''
        );

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $isAllowed = in_array($origin, $allowedOrigins, true);

        if ($isAllowed) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Max-Age: 86400');
        }

        if ($request->getMethod() === 'OPTIONS') {
            if (!$isAllowed) {
                $response->error('CORS origin not allowed', 403)->send();
            }
            http_response_code(204);
            exit;
        }
    }
}
