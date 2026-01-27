<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Directeur
{
    private int $numDirecteur;
    private string $dateDebut;

    private function __construct() {}

    public static function create(int $numDirecteur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Directeur (num_directeur, date_debut) VALUES (?, ?)'
        );

        return $stmt->execute([$numDirecteur, $dateDebut]);
    }

    public static function getById(int $numDirecteur): ?Directeur
    {
        $stmt = Database::prepare('SELECT * FROM Directeur WHERE num_directeur = ? LIMIT 1');
        $stmt->execute([$numDirecteur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsForUser(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM Directeur WHERE num_directeur = ?');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    /**
     * @return Directeur[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT d.* FROM Directeur d
             JOIN Utilisateur u ON d.num_directeur = u.num_utilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Directeur
    {
        $directeur = new self();
        $directeur->numDirecteur = (int)$data['num_directeur'];
        $directeur->dateDebut = $data['date_debut'];
        return $directeur;
    }

    public function toArray(): array
    {
        return [
            'numDirecteur' => $this->numDirecteur,
            'dateDebut' => $this->dateDebut,
        ];
    }

    public function getNumDirecteur(): int
    {
        return $this->numDirecteur;
    }

    public function getDateDebut(): string
    {
        return $this->dateDebut;
    }
}
