<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Concours;

class ConcoursHandler
{
    public function getAllConcours(Request $request, Response $response): void
    {
        $annee = (int) $request->getQuery('year', 0);

        if ($annee !== 0) {
            $concours = Concours::getAllByYear($annee);
            $concoursArray = array_map(fn($concours) => $concours->toArray(), $concours);

            $response->success(['concours' => $concoursArray])->send();
            return;
        }

        $concours = Concours::getAll();
        $concoursArray = array_map(fn($concours) => $concours->toArray(), $concours);

        $response->success(['concours' => $concoursArray])->send();
    }

    public function getConcoursById(Request $request, Response $response): void
    {
        $concoursId = (int)$request->getParam('concoursId');

        $concours = Concours::getById($concoursId);
        if (!$concours) {
            $response->error('concours not found', 404)->send();
            return;
        }

        $response->success(['concours' => $concours->toArray()])->send();
    }

    public function getConcoursCompetiteurs(Request $request, Response $response): void
    {
        $concoursId = (int)$request->getParam('concoursId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $concours = Concours::getById($concoursId);
        if (!$concours) {
            $response->error('concours not found', 404)->send();
            return;
        }

        $users = Concours::getUsersByConcoursId($concoursId, $limit, $index);

        $response->success([
            'users' => array_map(fn($user) => $user->extendedToArray(), $users)
        ])->send();
    }

    public function getConcoursCompetiteur(Request $request, Response $response): void
    {
        $concoursId = (int)$request->getParam('concoursId');
        $userId = (int)$request->getParam('userId');

        $concours = Concours::getById($concoursId);
        if (!$concours) {
            $response->error('concours not found', 404)->send();
            return;
        }

        $users = Concours::getUserByConcoursId($concoursId, $userId);

        $response->success([
            'users' => array_map(fn($user) => $user->extendedToArray(), $users)
        ])->send();
    }

    public function getConcoursDessins(Request $request, Response $response): void
    {
        $concoursId = (int)$request->getParam('concoursId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $concours = Concours::getById($concoursId);
        if (!$concours) {
            $response->error('concours not found', 404)->send();
            return;
        }

        $dessins = Concours::getDessinsByConcoursId($concoursId, $limit, $index);

        $response->success([
            'dessins' => array_map(fn($dessin) => $dessin->toArray(), $dessins)
        ])->send();
    }

    public function getBest(Request $request, Response $response): void
    {
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $bestConcours = Concours::getBestInConcours($limit, $index);

        $response->success([
            'concours' => $bestConcours
        ])->send();
    }
}
