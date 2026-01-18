<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Dessin
{
    private int $numDessin;
    private ?string $commentaire;
    private ?int $classement;
    private string $dateRemise;
    private string $leDessin;
    private int $numConcours;
    private int $numCompetiteur;

    private function __construct() {}

    public static function create(
        int $numConcours,
        int $numCompetiteur,
        string $dateRemise,
        string $leDessin,
        ?string $commentaire = null,
        ?int $classement = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Dessin (commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$commentaire, $classement, $dateRemise, $leDessin, $numConcours, $numCompetiteur]);
    }

    public static function findById(int $numDessin): ?Dessin
    {
        $stmt = Database::prepare('SELECT * FROM Dessin WHERE num_dessin = ? LIMIT 1');
        $stmt->execute([$numDessin]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    /**
     * @return Dessin[]
     */
    public static function getByConcours(int $numConcours): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin WHERE num_concours = ? ORDER BY classement ASC'
        );
        $stmt->execute([$numConcours]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Dessin[]
     */
    public static function getByCompetiteur(int $numCompetiteur): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin WHERE num_competiteur = ? ORDER BY date_remise DESC'
        );
        $stmt->execute([$numCompetiteur]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Dessin[]
     */
    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Dessin ORDER BY date_remise DESC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Dessin
    {
        $dessin = new self();
        $dessin->numDessin = (int)$data['num_dessin'];
        $dessin->commentaire = $data['commentaire'] ?? null;
        $dessin->classement = $data['classement'] ? (int)$data['classement'] : null;
        $dessin->dateRemise = $data['date_remise'] ?? '';
        $dessin->leDessin = $data['le_dessin'] ?? '';
        $dessin->numConcours = (int)$data['num_concours'];
        $dessin->numCompetiteur = (int)$data['num_competiteur'];
        return $dessin;
    }

    public function toArray(): array
    {
        return [
            'numDessin' => $this->numDessin,
            'commentaire' => $this->commentaire,
            'classement' => $this->classement,
            'dateRemise' => $this->dateRemise,
            'leDessin' => $this->leDessin,
            'numConcours' => $this->numConcours,
            'numCompetiteur' => $this->numCompetiteur,
        ];
    }

    public function getNumDessin(): int
    {
        return $this->numDessin;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function getClassement(): ?int
    {
        return $this->classement;
    }

    public function getDateRemise(): string
    {
        return $this->dateRemise;
    }

    public function getLeDessin(): string
    {
        return $this->leDessin;
    }

    public function getNumConcours(): int
    {
        return $this->numConcours;
    }

    public function getNumCompetiteur(): int
    {
        return $this->numCompetiteur;
    }
}
