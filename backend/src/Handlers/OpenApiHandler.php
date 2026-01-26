<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;

class OpenApiHandler
{
    public function getSpec(Request $request, Response $response): void
    {
        $json = file_get_contents(__DIR__ . '/../../public/openapi.json');
        $response->send($json, 200, ['Content-Type' => 'application/json']);
    }
}
