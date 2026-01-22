<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Concour;

class ConcourHandler
{
    public function getAllConcour(Request $request, Response $response): void
    {
        $concours = Concour::getAll();
        $concoursArray = array_map(fn($concour) => $concour->toArray(), $concours);

        $response->success(['concours' => $concoursArray])->send();
    }

    public function findConcourById(Request $request, Response $response): void
    {
        $concourId = (int)$request->getParam('concourId');

        $concour = Concour::findById($concourId);
        if (!$concour) {
            $response->error('Concour not found', 404)->send();
        }

        $response->success(['concour' => $concour->toArray()])->send();
    }

    public function getConcourCompetiteur(Request $request, Response $response): void
    {
        $concourId = (int)$request->getParam('concourId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        // Print debug
        error_log("Fetching users for concourId: $concourId, limit: $limit, index: $index");
        $concour = Concour::findById($concourId);
        if (!$concour) {
            $response->error('Concour not found', 404)->send();
        }

        // Example: fetch users with pagination
        $users = Concour::getUsersByconcourId($concourId, $limit, $index);

        $response->success([
            'users' => array_map(fn($user) => $user->toArray(), $users)
        ])->send();
    }
}
