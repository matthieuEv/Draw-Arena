<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Directeur
{
    private int $numDirecteur;
    private string $dateDebut;

    public static function create(int $numDirecteur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Directeur (numDirecteur, dateDebut) VALUES (?, ?)'
        );

        return $stmt->execute([$numDirecteur, $dateDebut]);
    }

    public static function findById(int $numDirecteur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Directeur WHERE numDirecteur = ? LIMIT 1');
        $stmt->execute([$numDirecteur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT d.*, u.nom, u.prenom, u.login FROM Directeur d
             JOIN Utilisateur u ON d.numDirecteur = u.numDirecteur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(int $numDirecteur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'UPDATE Directeur SET dateDebut = ? WHERE numDirecteur = ?'
        );

        return $stmt->execute([$dateDebut, $numDirecteur]);
    }

    public static function delete(int $numDirecteur): bool
    {
        $stmt = Database::prepare('DELETE FROM Directeur WHERE numDirecteur = ?');
        return $stmt->execute([$numDirecteur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numDirecteur' => (int)$data['numDirecteur'],
            'dateDebut' => $data['dateDebut'],
        ];
    }
}
