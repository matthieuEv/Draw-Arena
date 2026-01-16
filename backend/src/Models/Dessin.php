<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Dessin
{
    private int $numDessin;
    private ?string $commentaire;
    private ?int $classement;
    private date $dateRemise;
    private string $leDessin;
    private int $numConcours;
    private int $numCompetiteur;

    public static function create(
        int $numConcours,
        int $numCompetiteur,
        date $dateRemise,
        string $leDessin,
        ?string $commentaire = null,
        ?int $classement = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Dessin (commentaire, classement, dateRemise, leDessin, numConcours, numCompetiteur)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$commentaire, $classement, $dateRemise, $leDessin, $numConcours, $numCompetiteur]);
    }

    public static function findById(int $numDessin): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Dessin WHERE numDessin = ? LIMIT 1');
        $stmt->execute([$numDessin]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getByConcours(int $numConcours): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin WHERE numConcours = ? ORDER BY classement ASC'
        );
        $stmt->execute([$numConcours]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getByCompetiteur(int $numCompetiteur): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin WHERE numCompetiteur = ? ORDER BY dateRemise DESC'
        );
        $stmt->execute([$numCompetiteur]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin ORDER BY dateRemise DESC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(
        int $numDessin,
        ?string $commentaire = null,
        ?int $classement = null,
        date $dateRemise,
        string $leDessin
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Dessin SET commentaire = ?, classement = ?, dateRemise = ?, leDessin = ? WHERE numDessin = ?'
        );

        return $stmt->execute([$commentaire, $classement, $dateRemise, $leDessin, $numDessin]);
    }

    public static function delete(int $numDessin): bool
    {
        $stmt = Database::prepare('DELETE FROM Dessin WHERE numDessin = ?');
        return $stmt->execute([$numDessin]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numDessin' => (int)$data['numDessin'],
            'commentaire' => $data['commentaire'] ?? null,
            'classement' => $data['classement'] ? (int)$data['classement'] : null,
            'dateRemise' => $data['dateRemise'] ?? null,
            'leDessin' => $data['leDessin'] ?? null,
            'numConcours' => (int)$data['numConcours'],
            'numCompetiteur' => (int)$data['numCompetiteur'],
        ];
    }
}
