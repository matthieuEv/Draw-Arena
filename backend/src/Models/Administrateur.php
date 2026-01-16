<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Administrateur
{
    private int $numAdministrateur;
    private string $dateDebut;

    public static function create(int $numAdministrateur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Administrateur (numAdministrateur, dateDebut) VALUES (?, ?)'
        );

        return $stmt->execute([$numAdministrateur, $dateDebut]);
    }

    public static function findById(int $numAdministrateur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Administrateur WHERE numAdministrateur = ? LIMIT 1');
        $stmt->execute([$numAdministrateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT a.*, u.nom, u.prenom, u.login FROM Administrateur a
             JOIN Utilisateur u ON a.numAdministrateur = u.numAdministrateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(int $numAdministrateur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'UPDATE Administrateur SET dateDebut = ? WHERE numAdministrateur = ?'
        );

        return $stmt->execute([$dateDebut, $numAdministrateur]);
    }

    public static function delete(int $numAdministrateur): bool
    {
        $stmt = Database::prepare('DELETE FROM Administrateur WHERE numAdministrateur = ?');
        return $stmt->execute([$numAdministrateur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numAdministrateur' => (int)$data['numAdministrateur'],
            'dateDebut' => $data['dateDebut'],
        ];
    }
}
