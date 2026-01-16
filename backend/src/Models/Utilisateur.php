<?php
declare(strict_types=1);

namespace DrawArena\Models;

use DrawArena\Utils\Database;
use PDO;

class Utilisateur
{
    private int $numUtilisateur;
    private string $nom;
    private string $prenom;
    private ?string $adresse;
    private string $login;
    private string $motDePasse;
    private UtilisateurType $typeCompte;
    private ?int $numClub;

    public static function create(
        string $nom,
        string $prenom,
        string $login,
        string $motDePasse,
        UtilisateurType $typeCompte,
        ?string $adresse = null,
        ?int $numClub = null
    ): bool {
        $hashedPassword = password_hash($motDePasse, PASSWORD_BCRYPT);

        $stmt = Database::prepare(
            'INSERT INTO Utilisateur (nom, prenom, adresse, login, motDePasse, typeCompte, numClub)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$nom, $prenom, $adresse, $login, $hashedPassword, $typeCompte->value, $numClub]);
    }

    public static function findByLogin(string $login): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Utilisateur WHERE login = ? LIMIT 1');
        $stmt->execute([$login]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function findById(int $numUtilisateur): ?array
    {
        $stmt = Database::prepare('SELECT * FROM Utilisateur WHERE numUtilisateur = ? LIMIT 1');
        $stmt->execute([$numUtilisateur]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function existsByLogin(string $login): bool
    {
        $stmt = Database::prepare('SELECT COUNT(*) as count FROM Utilisateur WHERE login = ?');
        $stmt->execute([$login]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0) > 0;
    }

    public static function verifyPassword(string $plainPassword, string $hash): bool
    {
        return password_verify($plainPassword, $hash);
    }

    public static function getAll(int $limit = 20, int $offset = 0): array
    {
        $stmt = Database::prepare(
            'SELECT * FROM Utilisateur ORDER BY nom, prenom LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($row) => self::hydrateFromArray($row), $results);
    }

    public static function update(
        int $numUtilisateur,
        string $nom,
        string $prenom,
        ?string $adresse = null,
        ?int $numClub = null
    ): bool {
        $stmt = Database::prepare(
            'UPDATE Utilisateur SET nom = ?, prenom = ?, adresse = ?, numClub = ? WHERE numUtilisateur = ?'
        );

        return $stmt->execute([$nom, $prenom, $adresse, $numClub, $numUtilisateur]);
    }

    public static function delete(int $numUtilisateur): bool
    {
        $stmt = Database::prepare('DELETE FROM Utilisateur WHERE numUtilisateur = ?');
        return $stmt->execute([$numUtilisateur]);
    }

    private static function hydrateFromArray(array $data): array
    {
        return [
            'numUtilisateur' => (int)$data['numUtilisateur'],
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'adresse' => $data['adresse'] ?? null,
            'login' => $data['login'],
            'motDePasse' => $data['motDePasse'],
            'typeCompte' => UtilisateurType::from($data['typeCompte']),
            'numClub' => $data['numClub'] ? (int)$data['numClub'] : null,
        ];
    }
}
