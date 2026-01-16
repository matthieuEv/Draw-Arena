<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Club
{
    private int $numClub;
    private string $nomClub;
    private ?string $adresse;
    private ?string $numTelephone;
    private int $nombreAdherents;
    private string $ville;
    private string $departement;
    private string $region;

    public static function create(
        string $nomClub,
        ?string $adresse = null,
        ?string $numTelephone = null,
        int $nombreAdherents,
        string $ville,
        string $departement,
        string $region
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Club (nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$nomClub, $adresse, $numTelephone, $nombreAdherents, $ville, $departement, $region]);
    }

    public static function getAll(): array
    {
        $stmt = Database::prepare('SELECT * FROM Club ORDER BY nomClub ASC');
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function findById(int $numClub): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Club WHERE numClub = ? LIMIT 1');
        $stmt->execute([$numClub]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function update(
        int $numClub,
        string $nomClub,
        ?string $adresse = null,
        ?string $numTelephone = null,
        int $nombreAdherents,
        string $ville,
        string $departement,
        string $region
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Club SET nomClub = ?, adresse = ?, numTelephone = ?, nombreAdherents = ?,
             ville = ?, departement = ?, region = ? WHERE numClub = ?'
        );

        return $stmt->execute([$nomClub, $adresse, $numTelephone, $nombreAdherents, $ville, $departement, $region, $numClub]);
    }

    public static function delete(int $numClub): bool
    {
        $stmt = Database::prepare('DELETE FROM Club WHERE numClub = ?');
        return $stmt->execute([$numClub]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numClub' => (int)$data['numClub'],
            'nomClub' => $data['nomClub'],
            'adresse' => $data['adresse'] ?? null,
            'numTelephone' => $data['numTelephone'] ?? null,
            'nombreAdherents' => (int)$data['nombreAdherents'],
            'ville' => $data['ville'],
            'departement' => $data['departement'],
            'region' => $data['region'],
        ];
    }
}
