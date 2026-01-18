<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Administrateur
{
    private int $numAdministrateur;
    private string $dateDebut;

    private function __construct() {}

    public static function create(int $numAdministrateur, string $dateDebut): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Administrateur (num_administrateur, date_debut) VALUES (?, ?)'
        );

        return $stmt->execute([$numAdministrateur, $dateDebut]);
    }

    public static function findById(int $numAdministrateur): ?Administrateur
    {
        $stmt = Database::prepare('SELECT * FROM Administrateur WHERE num_administrateur = ? LIMIT 1');
        $stmt->execute([$numAdministrateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsForUser(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM Administrateur WHERE num_administrateur = ?');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    /**
     * @return Administrateur[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT a.* FROM Administrateur a
             JOIN Utilisateur u ON a.num_administrateur = u.num_utilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Administrateur
    {
        $admin = new self();
        $admin->numAdministrateur = (int)$data['num_administrateur'];
        $admin->dateDebut = $data['date_debut'];
        return $admin;
    }

    public function toArray(): array
    {
        return [
            'numAdministrateur' => $this->numAdministrateur,
            'dateDebut' => $this->dateDebut,
        ];
    }

    public function getNumAdministrateur(): int
    {
        return $this->numAdministrateur;
    }

    public function getDateDebut(): string
    {
        return $this->dateDebut;
    }
}
