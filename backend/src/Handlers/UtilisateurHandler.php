<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Utilisateur;

class UtilisateurHandler
{
    public function getUserDessins(Request $request, Response $response): void
    {
        $userId = (int)$request->getParam('userId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $dessins = Utilisateur::getDessinsByUtilisateurId($userId, $limit, $index);
        $response->success(['dessins' => $dessins])->send();
    }

    public function getUserStats(Request $request, Response $response): void
    {
        $userId = (int)$request->getParam('userId');

        $stats = Utilisateur::getStatsByUtilisateurId($userId);
        $response->success(['stats' => $stats])->send();
    }
}
