<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Concours
{
    private int $numConcours;
    private string $theme;
    private string $dateDebut;
    private string $dateFin;
    private ConcoursEtat $etat;
    private ?int $numPresident;
    private ?int $numClub;

    private function __construct() {}

    /**
     * @return Concours[]
     */
    public static function getAll(): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours ORDER BY date_debut DESC');
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Concours[]
     */
    public static function getAllByYear(int $year): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE YEAR(date_debut) = ? ORDER BY date_debut DESC');
        $stmt->execute([$year]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getById(int $numConcours): ?Concours
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE num_concours = ? LIMIT 1');
        $stmt->execute([$numConcours]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    /**
     * @return Concours[]
     */
    public static function getByClub(int $numClub): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE num_club = ? ORDER BY date_debut DESC');
        $stmt->execute([$numClub]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Concours[]
     */
    public static function getByEtat(ConcoursEtat $etat): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE etat = ? ORDER BY date_debut DESC');
        $stmt->execute([$etat->value]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getUserByConcoursId(int $concoursId, int $userId): array
    {
        $stmt = Database::prepare(
            "SELECT
                u.*,
                'president' as role
                FROM Concours c
                JOIN President p ON c.num_president = p.num_president
                JOIN Utilisateur u ON p.num_president = u.num_utilisateur
                WHERE c.num_concours = ? AND u.num_utilisateur = ?
             UNION
             SELECT
                u.*,
                'competiteur' as role
                FROM Concours c
                JOIN Concours_Competiteur cc ON c.num_concours = cc.num_concours
                JOIN Competiteur comp ON cc.num_competiteur = comp.num_competiteur
                JOIN Utilisateur u ON comp.num_competiteur = u.num_utilisateur
                WHERE c.num_concours = ? AND u.num_utilisateur = ?
             UNION
             SELECT
                u.*,
                'evaluateur' as role
                FROM Concours c
                JOIN Concours_Evaluateur ce ON c.num_concours = ce.num_concours
                JOIN Evaluateur ev ON ce.num_evaluateur = ev.num_evaluateur
                JOIN Utilisateur u ON ev.num_evaluateur = u.num_utilisateur
                WHERE c.num_concours = ? AND u.num_utilisateur = ?
             ORDER BY role DESC
             LIMIT 1 OFFSET 0"
        );
        $stmt->bindValue(1, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(2, $userId, PDO::PARAM_INT);
        $stmt->bindValue(3, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(4, $userId, PDO::PARAM_INT);
        $stmt->bindValue(5, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(6, $userId, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => Utilisateur::extendedHydrateFromArray($row), $result);
    }

    public static function getUsersByConcoursId(int $concoursId, int $limit, int $index): array
    {
        // Limit + 1 to check if there are more results
        $limit++;
        $stmt = Database::prepare(
            "SELECT
                u.*,
                'president' as role
                FROM Concours c
                JOIN President p ON c.num_president = p.num_president
                JOIN Utilisateur u ON p.num_president = u.num_utilisateur
                WHERE c.num_concours = ?
             UNION
             SELECT
                u.*,
                'competiteur' as role
                FROM Concours c
                JOIN Concours_Competiteur cc ON c.num_concours = cc.num_concours
                JOIN Competiteur comp ON cc.num_competiteur = comp.num_competiteur
                JOIN Utilisateur u ON comp.num_competiteur = u.num_utilisateur
                WHERE c.num_concours = ?
             UNION
             SELECT
                u.*,
                'evaluateur' as role
                FROM Concours c
                JOIN Concours_Evaluateur ce ON c.num_concours = ce.num_concours
                JOIN Evaluateur ev ON ce.num_evaluateur = ev.num_evaluateur
                JOIN Utilisateur u ON ev.num_evaluateur = u.num_utilisateur
                WHERE c.num_concours = ?
             ORDER BY role DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->bindValue(1, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(2, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(3, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(4, $limit, PDO::PARAM_INT);
        $stmt->bindValue(5, $index, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => Utilisateur::extendedHydrateFromArray($row), $results);
    }

    public static function getBestInConcours(int $limit, int $index): array
    {
        $stmt = Database::prepare('SELECT c.num_concours, c.theme, cl.nom_club,
                                   COUNT(DISTINCT d.num_dessin) AS nb_dessins_evalues
                                   FROM Concours c
                                   JOIN Dessin d ON d.num_concours = c.num_concours
                                   JOIN Evaluation e ON e.num_dessin = d.num_dessin
                                   JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
                                   JOIN Club cl ON cl.num_club = u.num_club
                                   GROUP BY c.num_concours, c.theme, cl.nom_club
                                   ORDER BY c.num_concours, nb_dessins_evalues DESC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $index, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getDessinsByConcoursId(int $concoursId, int $limit, int $index): array
    {
        // Limit + 1 to check if there are more results
        $limit++;
        $stmt = Database::prepare(
            'SELECT
                d.num_dessin,
                d.commentaire as dessin_commentaire,
                d.classement,
                d.date_remise,
                d.le_dessin,
                u.nom,
                u.prenom,
                u.age,
                u.adresse,
                u.login,
                AVG(e.note) as note,
                MAX(e.date_evaluation) as date_evaluation,
                GROUP_CONCAT(e.commentaire SEPARATOR \' | \') as evaluation_commentaires,
                COUNT(e.num_dessin) as nb_evaluations
            FROM Dessin d
            JOIN Concours_Competiteur cc ON cc.num_competiteur = d.num_competiteur
            JOIN Utilisateur u ON u.num_utilisateur = cc.num_competiteur
            LEFT JOIN Evaluation e ON e.num_dessin = d.num_dessin
            WHERE cc.num_concours = ?
            GROUP BY d.num_dessin
            ORDER BY d.date_remise DESC
            LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $concoursId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $index, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function hydrateFromArray(array $data): Concours
    {
        $concours = new self();
        $concours->numConcours = (int)$data['num_concours'];
        $concours->theme = $data['theme'];
        $concours->dateDebut = $data['date_debut'] ?? '';
        $concours->dateFin = $data['date_fin'] ?? '';
        $concours->etat = ConcoursEtat::from($data['etat']);
        $concours->numClub = $data['num_club'] ? (int)$data['num_club'] : null;
        $concours->numPresident = $data['num_president'] ? (int)$data['num_president'] : null;
        return $concours;
    }

    public function toArray(): array
    {
        return [
            'numConcours' => $this->numConcours,
            'theme' => $this->theme,
            'dateDebut' => $this->dateDebut,
            'dateFin' => $this->dateFin,
            'etat' => $this->etat->value,
            'numClub' => $this->numClub,
            'numPresident' => $this->numPresident,
        ];
    }

    public function getNumConcours(): int
    {
        return $this->numConcours;
    }

    public function getTheme(): string
    {
        return $this->theme;
    }

    public function getDateDebut(): string
    {
        return $this->dateDebut;
    }

    public function getDateFin(): string
    {
        return $this->dateFin;
    }

    public function getEtat(): ConcoursEtat
    {
        return $this->etat;
    }

    public function getNumClub(): ?int
    {
        return $this->numClub;
    }

    public function getNumPresident(): ?int
    {
        return $this->numPresident;
    }
}
