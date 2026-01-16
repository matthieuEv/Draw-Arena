<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class President
{
    private int $numUtilisateur;
    private ?float $prime;

    public static function create(int $numUtilisateur, ?float $prime = null): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO President (numUtilisateur, prime) VALUES (?, ?)'
        );

        return $stmt->execute([$numUtilisateur, $prime]);
    }

    public static function findById(int $numUtilisateur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM President WHERE numUtilisateur = ? LIMIT 1');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT p.*, u.nom, u.prenom, u.login FROM President p
             JOIN Utilisateur u ON p.numUtilisateur = u.numUtilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(int $numUtilisateur, ?float $prime = null): bool
    {
        $stmt = Database::prepare(
            'UPDATE President SET prime = ? WHERE numUtilisateur = ?'
        );

        return $stmt->execute([$prime, $numUtilisateur]);
    }

    public static function delete(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('DELETE FROM President WHERE numUtilisateur = ?');
        return $stmt->execute([$numUtilisateur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numUtilisateur' => (int)$data['numUtilisateur'],
            'prime' => $data['prime'] ? (float)$data['prime'] : null,
        ];
    }
}
