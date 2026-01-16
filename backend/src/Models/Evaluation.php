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

    public static function create(
        int $numDessin,
        int $numEvaluateur,
        ?float $note = null,
        ?string $dateEvaluation = null,
        ?string $commentaire = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Evaluation (numDessin, numEvaluateur, dateEvaluation, note, commentaire)
             VALUES (?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$numDessin, $numEvaluateur, $dateEvaluation, $note, $commentaire]);
    }

    public static function findById(int $numDessin, int $numEvaluateur): ?array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE numDessin = ? AND numEvaluateur = ? LIMIT 1'
        );
        $stmt->execute([$numDessin, $numEvaluateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getByDessin(int $numDessin): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE numDessin = ? ORDER BY note DESC'
        );
        $stmt->execute([$numDessin]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getByEvaluateur(int $numEvaluateur): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation WHERE numEvaluateur = ? ORDER BY dateEvaluation DESC'
        );
        $stmt->execute([$numEvaluateur]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Evaluation ORDER BY dateEvaluation DESC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(
        int $numDessin,
        int $numEvaluateur,
        ?float $note = null,
        ?string $dateEvaluation = null,
        ?string $commentaire = null
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Evaluation SET note = ?, dateEvaluation = ?, commentaire = ?
             WHERE numDessin = ? AND numEvaluateur = ?'
        );

        return $stmt->execute([$note, $dateEvaluation, $commentaire, $numDessin, $numEvaluateur]);
    }

    public static function delete(int $numDessin, int $numEvaluateur): bool
    {
        $stmt = Database::prepare(
            'DELETE FROM Evaluation WHERE numDessin = ? AND numEvaluateur = ?'
        );
        return $stmt->execute([$numDessin, $numEvaluateur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numDessin' => (int)$data['numDessin'],
            'numEvaluateur' => (int)$data['numEvaluateur'],
            'dateEvaluation' => $data['dateEvaluation'] ?? null,
            'note' => $data['note'] ? (float)$data['note'] : null,
            'commentaire' => $data['commentaire'] ?? null,
        ];
    }
}
