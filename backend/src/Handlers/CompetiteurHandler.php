<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Competiteur;
use DrawArena\Models\Utilisateur;

class CompetiteurHandler
{
    public function getAllCompetiteur(Request $request, Response $response): void
    {
        $limit = (int) $request->getQuery('limit', 100);
        $index = (int) $request->getQuery('index', 0);

        $competiteurs = Competiteur::getAll($limit, $index);
        $response->success(['competiteurs' => $competiteurs])->send();
    }

    public function getWarriors(Request $request, Response $response): void
    {
        $limit = (int) $request->getQuery('limit', 100);
        $index = (int) $request->getQuery('index', 0);

        $competiteurs_num = Competiteur::getWarriors($limit, $index);
        $users = [];
        foreach ($competiteurs_num as $competiteur_num) {
            $user = Utilisateur::getById((int)$competiteur_num['num_utilisateur']);
            if ($user) {
                $users[] = $user->toArray();
            }
        }
        $response->success(['competiteurs' => $users])->send();
    }
}
