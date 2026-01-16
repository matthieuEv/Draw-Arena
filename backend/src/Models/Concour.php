<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Concours
{
    private int $numConcours;
    private string $theme;
    private date $dateDebut;
    private date $dateFin;
    private ConcourEtat $etat;
    private int $numPresident;
    private ?int $numClub;

    public static function create(
        string $theme,
        ConcourEtat $etat,
        date $dateDebut,
        date $dateFin,
        int $numPresident,
        ?int $numClub = null
    ): bool {
        $stmt = Database::prepare(
            'INSERT INTO Concours (theme, dateDebut, dateFin, etat, numClub, numPresident)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$theme, $dateDebut, $dateFin, $etat->value, $numClub, $numPresident]);
    }

    public static function getAll(): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours ORDER BY dateDebut DESC');
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getById(int $numConcours): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE numConcours = ? LIMIT 1');
        $stmt->execute([$numConcours]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function getByClub(int $numClub): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE numClub = ? ORDER BY dateDebut DESC');
        $stmt->execute([$numClub]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function getByEtat(ConcourEtat $etat): array
    {
        $stmt = Database::prepare('SELECT * FROM Concours WHERE etat = ? ORDER BY dateDebut DESC');
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
        int $numPresident = null,
        ?int $numClub
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Concours SET theme = ?, dateDebut = ?, dateFin = ?, etat = ?, numClub = ?, numPresident = ?
             WHERE numConcours = ?'
        );

        return $stmt->execute([$theme, $dateDebut, $dateFin, $etat->value, $numClub, $numPresident, $numConcours]);
    }

    public static function updateEtat(int $numConcours, ConcourEtat $etat): bool
    {
        $stmt = Database::prepare('UPDATE Concours SET etat = ? WHERE numConcours = ?');
        return $stmt->execute([$etat->value, $numConcours]);
    }

    public static function delete(int $numConcours): bool
    {
        $stmt = Database::prepare('DELETE FROM Concours WHERE numConcours = ?');
        return $stmt->execute([$numConcours]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numConcours' => (int)$data['numConcours'],
            'theme' => $data['theme'],
            'dateDebut' => $data['dateDebut'] ?? null,
            'dateFin' => $data['dateFin'] ?? null,
            'etat' => ConcourEtat::from($data['etat']),
            'numClub' => $data['numClub'] ? (int)$data['numClub'] : null,
            'numPresident' => $data['numPresident'] ? (int)$data['numPresident'] : null,
        ];
    }
}
