<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Evaluateur
{
    private int $numEvaluateur;
    private string $specialite;

    private function __construct() {}

    public static function create(int $numEvaluateur, string $specialite): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Evaluateur (num_evaluateur, specialite) VALUES (?, ?)'
        );

        return $stmt->execute([$numEvaluateur, $specialite]);
    }

    public static function findById(int $numEvaluateur): ?Evaluateur
    {
        $stmt = Database::prepare('SELECT * FROM Evaluateur WHERE num_evaluateur = ? LIMIT 1');
        $stmt->execute([$numEvaluateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsForUser(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM Evaluateur WHERE num_evaluateur = ?');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    /**
     * @return Evaluateur[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT e.* FROM Evaluateur e
             JOIN Utilisateur u ON e.num_evaluateur = u.num_utilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Evaluateur
    {
        $evaluateur = new self();
        $evaluateur->numEvaluateur = (int)$data['num_evaluateur'];
        $evaluateur->specialite = $data['specialite'];
        return $evaluateur;
    }

    public function toArray(): array
    {
        return [
            'numEvaluateur' => $this->numEvaluateur,
            'specialite' => $this->specialite,
        ];
    }

    public function getNumEvaluateur(): int
    {
        return $this->numEvaluateur;
    }

    public function getSpecialite(): string
    {
        return $this->specialite;
    }
}
