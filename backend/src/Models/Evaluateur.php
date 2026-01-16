<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Evaluateur
{
    private int $numUtilisateur;
    private string $specialite;

    public static function create(int $numUtilisateur, string $specialite): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Evaluateur (numUtilisateur, specialite) VALUES (?, ?)'
        );

        return $stmt->execute([$numUtilisateur, $specialite]);
    }

    public static function findById(int $numUtilisateur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Evaluateur WHERE numUtilisateur = ? LIMIT 1');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT e.*, u.nom, u.prenom, u.login FROM Evaluateur e
             JOIN Utilisateur u ON e.numUtilisateur = u.numUtilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(int $numUtilisateur, string $specialite): bool
    {
        $stmt = Database::prepare(
            'UPDATE Evaluateur SET specialite = ? WHERE numUtilisateur = ?'
        );

        return $stmt->execute([$specialite, $numUtilisateur]);
    }

    public static function delete(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('DELETE FROM Evaluateur WHERE numUtilisateur = ?');
        return $stmt->execute([$numUtilisateur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numUtilisateur' => (int)$data['numUtilisateur'],
            'specialite' => $data['specialite'],
        ];
    }
}
