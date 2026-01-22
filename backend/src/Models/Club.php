<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Club
{
    private int $numClub;
    private string $nomClub;
    private ?string $adresse;
    private ?string $numTelephone;
    private string $ville;
    private string $departement;
    private string $region;

    private function __construct() {}

    public static function create(
        string $nomClub,
        string $ville,
        string $departement,
        string $region,
        ?string $adresse = null,
        ?string $numTelephone = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Club (nom_club, adresse, num_telephone, ville, departement, region)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$nomClub, $adresse, $numTelephone, $ville, $departement, $region]);
    }

    /**
     * @return Club[]
     */
    public static function getAll(): array
    {
        $stmt = Database::prepare('SELECT * FROM Club ORDER BY nom_club ASC');
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function findById(int $numClub): ?Club
    {
        $stmt = Database::prepare('SELECT * FROM Club WHERE num_club = ? LIMIT 1');
        $stmt->execute([$numClub]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getUsersByClubId(int $clubId, int $limit, int $index): array
    {
        // Limit + 1 to check if there are more results
        $limit++;
        $stmt = Database::prepare(
            'SELECT u.* FROM Utilisateur u
             WHERE u.num_club = ?
             ORDER BY u.nom, u.prenom
             LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $clubId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $index, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => Utilisateur::hydrateFromArray($row), $results);
    }

    private static function hydrateFromArray(array $data): Club
    {
        $club = new self();
        $club->numClub = (int)$data['num_club'];
        $club->nomClub = $data['nom_club'];
        $club->adresse = $data['adresse'] ?? null;
        $club->numTelephone = $data['num_telephone'] ?? null;
        $club->ville = $data['ville'];
        $club->departement = $data['departement'];
        $club->region = $data['region'];
        return $club;
    }

    public function toArray(): array
    {
        return [
            'numClub' => $this->numClub,
            'nomClub' => $this->nomClub,
            'adresse' => $this->adresse,
            'numTelephone' => $this->numTelephone,
            'ville' => $this->ville,
            'departement' => $this->departement,
            'region' => $this->region,
        ];
    }

    public function getNumClub(): int
    {
        return $this->numClub;
    }

    public function getNomClub(): string
    {
        return $this->nomClub;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function getNumTelephone(): ?string
    {
        return $this->numTelephone;
    }

    public function getVille(): string
    {
        return $this->ville;
    }

    public function getDepartement(): string
    {
        return $this->departement;
    }

    public function getRegion(): string
    {
        return $this->region;
    }
}
