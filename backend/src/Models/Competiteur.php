<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Competiteur
{
    private int $numCompetiteur;
    private string $datePremiereParticipation;

    private function __construct() {}

    public static function create(int $numCompetiteur, string $datePremiereParticipation): bool
    {
        $stmt = Database::prepare(
            'INSERT INTO Competiteur (num_competiteur, date_premiere_participation) VALUES (?, ?)'
        );

        return $stmt->execute([$numCompetiteur, $datePremiereParticipation]);
    }

    public static function findById(int $numCompetiteur): ?Competiteur
    {
        $stmt = Database::prepare('SELECT * FROM Competiteur WHERE num_competiteur = ? LIMIT 1');
        $stmt->execute([$numCompetiteur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsForUser(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM Competiteur WHERE num_competiteur = ?');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    /**
     * @return Competiteur[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT c.* FROM Competiteur c
             JOIN Utilisateur u ON c.num_competiteur = u.num_utilisateur
             ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Competiteur
    {
        $competiteur = new self();
        $competiteur->numCompetiteur = (int)$data['num_competiteur'];
        $competiteur->datePremiereParticipation = $data['date_premiere_participation'] ?? '';
        return $competiteur;
    }

    public function toArray(): array
    {
        return [
            'numCompetiteur' => $this->numCompetiteur,
            'datePremiereParticipation' => $this->datePremiereParticipation,
        ];
    }

    public function getNumCompetiteur(): int
    {
        return $this->numCompetiteur;
    }

    public function getDatePremiereParticipation(): string
    {
        return $this->datePremiereParticipation;
    }
}
