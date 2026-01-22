<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Evaluation
{
    private int $numDessin;
    private int $numEvaluateur;
    private ?string $dateEvaluation;
    private ?float $note;
    private ?string $commentaire;

    private function __construct() {}

    public static function getById(int $numDessin, int $numEvaluateur): ?Evaluation
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE num_dessin = ? AND num_evaluateur = ? LIMIT 1'
        );
        $stmt->execute([$numDessin, $numEvaluateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    /**
     * @return Evaluation[]
     */
    public static function getByDessin(int $numDessin): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE num_dessin = ? ORDER BY note DESC'
        );
        $stmt->execute([$numDessin]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Evaluation[]
     */
    public static function getByEvaluateur(int $numEvaluateur): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE num_evaluateur = ? ORDER BY date_evaluation DESC'
        );
        $stmt->execute([$numEvaluateur]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Evaluation[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT d.num_dessin, e.date_evaluation, c.theme, c.description, uc.nom AS nom_competiteur, uc.prenom AS prenom_competiteur, d.commentaire AS commentaire_dessin, e.note, e.commentaire AS commentaire_evaluation, ue.nom AS nom_evaluateur, ue.prenom AS prenom_evaluateur
            FROM Dessin d
            JOIN Evaluation e ON e.num_dessin = d.num_dessin
            JOIN Concours c ON c.num_concours = d.num_concours
            JOIN Utilisateur uc ON uc.num_utilisateur = d.num_competiteur
            JOIN Utilisateur ue ON ue.num_utilisateur = e.num_evaluateur
            ORDER BY c.num_concours, d.num_dessin, e.date_evaluation, e.num_evaluateur
            LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getAllByYear(int $year, int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT d.num_dessin, e.note, u.nom, u.prenom, c.theme, c.description, e.date_evaluation
            FROM Dessin d
            JOIN Evaluation e ON e.num_dessin = d.num_dessin
            JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
            JOIN Concours c ON c.num_concours = d.num_concours
            WHERE YEAR(e.date_evaluation) = ?
            ORDER BY e.note ASC
            LIMIT ? OFFSET ?');

        $stmt->bindValue(1, $year, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    private static function hydrateFromArray(array $data): Evaluation
    {
        $evaluation = new self();
        $evaluation->numDessin = (int)$data['num_dessin'];
        $evaluation->numEvaluateur = (int)$data['num_evaluateur'];
        $evaluation->dateEvaluation = $data['date_evaluation'] ?? null;
        $evaluation->note = $data['note'] ? (float)$data['note'] : null;
        $evaluation->commentaire = $data['commentaire'] ?? null;
        return $evaluation;
    }

    public function toArray(): array
    {
        return [
            'numDessin' => $this->numDessin,
            'numEvaluateur' => $this->numEvaluateur,
            'dateEvaluation' => $this->dateEvaluation,
            'note' => $this->note,
            'commentaire' => $this->commentaire,
        ];
    }

    public function getNumDessin(): int
    {
        return $this->numDessin;
    }

    public function getNumEvaluateur(): int
    {
        return $this->numEvaluateur;
    }

    public function getDateEvaluation(): ?string
    {
        return $this->dateEvaluation;
    }

    public function getNote(): ?float
    {
        return $this->note;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }
}
