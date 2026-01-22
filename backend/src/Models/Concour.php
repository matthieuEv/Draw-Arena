<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Concour
{
    private int $numConcours;
    private string $theme;
    private string $dateDebut;
    private string $dateFin;
    private ConcourEtat $etat;
    private ?int $numPresident;
    private ?int $numClub;

    private function __construct() {}

    public static function create(
        string $theme,
        ConcourEtat $etat,
        string $dateDebut,
        string $dateFin,
        int $numPresident,
        ?int $numClub = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Concours (theme, date_debut, date_fin, etat, num_club, num_president)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$theme, $dateDebut, $dateFin, $etat->value, $numClub, $numPresident]);
    }

    /**
     * @return Concour[]
     */
    public static function getAll(): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours ORDER BY date_debut DESC');
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getById(int $numConcours): ?Concour
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE num_concours = ? LIMIT 1');
        $stmt->execute([$numConcours]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    /**
     * @return Concour[]
     */
    public static function getByClub(int $numClub): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE num_club = ? ORDER BY date_debut DESC');
        $stmt->execute([$numClub]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    /**
     * @return Concour[]
     */
    public static function getByEtat(ConcourEtat $etat): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE etat = ? ORDER BY date_debut DESC');
        $stmt->execute([$etat->value]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(
        int $numConcours,
        string $theme,
        ConcourEtat $etat,
        string $dateDebut,
        string $dateFin,
        ?int $numPresident = null,
        ?int $numClub = null
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Concours SET theme = ?, date_debut = ?, date_fin = ?, etat = ?, num_club = ?, num_president = ?
             WHERE num_concours = ?'
        );

        return $stmt->execute([$theme, $dateDebut, $dateFin, $etat->value, $numClub, $numPresident, $numConcours]);
    }

    private static function hydrateFromArray(array $data): Concour
    {
        $concour = new self();
        $concour->numConcours = (int)$data['num_concours'];
        $concour->theme = $data['theme'];
        $concour->dateDebut = $data['date_debut'] ?? '';
        $concour->dateFin = $data['date_fin'] ?? '';
        $concour->etat = ConcourEtat::from($data['etat']);
        $concour->numClub = $data['num_club'] ? (int)$data['num_club'] : null;
        $concour->numPresident = $data['num_president'] ? (int)$data['num_president'] : null;
        return $concour;
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

    public function getEtat(): ConcourEtat
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
