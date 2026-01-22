<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class President
{
    private int $numPresident;
    private ?float $prime;

    private function __construct() {}

    public static function create(int $numPresident, ?float $prime = null): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO President (num_president, prime) VALUES (?, ?)'
        );

        return $stmt->execute([$numPresident, $prime]);
    }

    public static function getById(int $numPresident): ?President
    {
        $stmt = Database::prepare('SELECT * FROM President WHERE num_president = ? LIMIT 1');
        $stmt->execute([$numPresident]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsForUser(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM President WHERE num_president = ?');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    /**
     * @return President[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT p.* FROM President p
             JOIN Utilisateur u ON p.num_president = u.num_utilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): President
    {
        $president = new self();
        $president->numPresident = (int)$data['num_president'];
        $president->prime = $data['prime'] ? (float)$data['prime'] : null;
        return $president;
    }

    public function toArray(): array
    {
        return [
            'numPresident' => $this->numPresident,
            'prime' => $this->prime,
        ];
    }

    public function getNumPresident(): int
    {
        return $this->numPresident;
    }

    public function getPrime(): ?float
    {
        return $this->prime;
    }
}
