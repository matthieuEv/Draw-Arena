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

    /**
     * @return array
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare('SELECT * FROM Competiteur LIMIT ? OFFSET ?');
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById(int $numCompetiteur): ?Competiteur
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

    public static function getWarriors(int $limit = 20, int $offset = 0): array
    {
        $sql = 'SELECT u.num_utilisateur
                FROM Utilisateur u
                JOIN Competiteur comp ON comp.num_competiteur = u.num_utilisateur
                WHERE NOT EXISTS (
                    SELECT *
                    FROM Concours c
                    WHERE NOT EXISTS (
                        SELECT *
                        FROM Concours_Competiteur cc
                        WHERE cc.num_competiteur = comp.num_competiteur
                        AND cc.num_concours = c.num_concours
                    )
                )
                ORDER BY u.age ASC, u.nom, u.prenom
                LIMIT ? OFFSET ?';

        $stmt = Database::prepare($sql);
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
