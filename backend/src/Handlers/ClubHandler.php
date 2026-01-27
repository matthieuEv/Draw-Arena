<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Club;
use DrawArena\Models\Concours;

class ClubHandler
{
    public function getAllClub(Request $request, Response $response): void
    {
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $clubs = Club::getAll($limit, $index);
        $clubsArray = array_map(fn($club) => $club->toArray(), $clubs);

        $response->success(['clubs' => $clubsArray])->send();
    }

    public function getClubById(Request $request, Response $response): void
    {
        $clubId = (int)$request->getParam('clubId');

        $club = Club::getById($clubId);
        if (!$club) {
            $response->error('Club not found', 404)->send();
        }

        $response->success(['club' => $club->toArray()])->send();
    }

    public function getClubUsers(Request $request, Response $response): void
    {
        $clubId = (int)$request->getParam('clubId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $club = Club::getById($clubId);
        if (!$club) {
            $response->error('Club not found', 404)->send();
        }

        $users = Club::getUsersByClubId($clubId, $limit, $index);

        $response->success([
            'users' => array_map(fn($user) => $user->extendedToArray(), $users)
        ])->send();
    }

    public function getClubUserById(Request $request, Response $response): void
    {
        $clubId = (int)$request->getParam('clubId');
        $userId = (int)$request->getParam('userId');

        $club = Club::getById($clubId);
        if (!$club) {
            $response->error('Club not found', 404)->send();
        }

        $users = Club::getUserByClubIdAndUserId($clubId, $userId);

        $response->success([
            'users' => array_map(fn($user) => $user->extendedToArray(), $users)
        ])->send();
    }

    public function getClubConcours(Request $request, Response $response): void
    {
        $clubId = (int)$request->getParam('clubId');
        $limit = (int)($request->getQuery('limit', 100));
        $index = (int)($request->getQuery('index', 0));

        $club = Club::getById($clubId);
        if (!$club) {
            $response->error('Club not found', 404)->send();
        }

        $concours = Club::getConcourssByClubId($clubId, $limit, $index);

        $response->success([
            'concours' => array_map(fn($c) => $c->toArray(), $concours)
        ])->send();
    }
}
