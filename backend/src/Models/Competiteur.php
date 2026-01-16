<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Competiteur
{
    private int $numCompetiteur;
    private string $datePremiereParticipation;

    public static function create(int $numCompetiteur, string $datePremiereParticipation): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Competiteur (numCompetiteur, datePremiereParticipation) VALUES (?, ?)'
        );

        return $stmt->execute([$numCompetiteur, $datePremiereParticipation]);
    }

    public static function findById(int $numCompetiteur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Competiteur WHERE numCompetiteur = ? LIMIT 1');
        $stmt->execute([$numCompetiteur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT c.*, u.nom, u.prenom, u.login FROM Competiteur c
             JOIN Utilisateur u ON c.numCompetiteur = u.numCompetiteur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(int $numCompetiteur, string $datePremiereParticipation): bool
    {
        $stmt = Database::prepare(
            'UPDATE Competiteur SET datePremiereParticipation = ? WHERE numCompetiteur = ?'
        );

        return $stmt->execute([$datePremiereParticipation, $numCompetiteur]);
    }

    public static function delete(int $numCompetiteur): bool
    {
        $stmt = Database::prepare('DELETE FROM Competiteur WHERE numCompetiteur = ?');
        return $stmt->execute([$numCompetiteur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numCompetiteur' => (int)$data['numCompetiteur'],
            'datePremiereParticipation' => $data['datePremiereParticipation'] ?? null,
        ];
    }
}
