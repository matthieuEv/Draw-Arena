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
    private ?string $photoProfilUrl;
    private int $age;

    private function __construct() {}

    public static function create(
        string $nom,
        string $prenom,
        string $login,
        string $motDePasse,
        UtilisateurType $typeCompte,
        ?string $adresse = null,
        ?int $numClub = null,
        ?string $photoProfilUrl = null,
        ?int $age = 0
    ): bool {
        $hashedPassword = password_hash($motDePasse, PASSWORD_BCRYPT);

        $stmt = Database::prepare(
            'INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club, photo_profil_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        return $stmt->execute([$nom, $prenom, $age, $adresse, $login, $hashedPassword, $typeCompte->value, $numClub, $photoProfilUrl]);
    }

    public static function findByLogin(string $login): ?Utilisateur
    {
        $stmt = Database::prepare('SELECT * FROM Utilisateur WHERE login = ? LIMIT 1');
        $stmt->execute([$login]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? self::hydrateFromArray($result) : null;
    }

    public static function findById(int $numUtilisateur): ?Utilisateur
    {
        $stmt = Database::prepare('SELECT * FROM Utilisateur WHERE num_utilisateur = ? LIMIT 1');
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

    /**
     * @return Utilisateur[]
     */
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

    private static function hydrateFromArray(array $data): Utilisateur
    {
        $user = new self();
        $user->numUtilisateur = (int)$data['num_utilisateur'];
        $user->nom = $data['nom'];
        $user->prenom = $data['prenom'];
        $user->adresse = $data['adresse'] ?? null;
        $user->login = $data['login'];
        $user->motDePasse = $data['mot_de_passe'];
        $user->typeCompte = UtilisateurType::from($data['type_compte']);
        $user->numClub = $data['num_club'] ? (int)$data['num_club'] : null;
        $user->photoProfilUrl = $data['photo_profil_url'] ?? null;
        $user->age = (int)$data['age'];
        return $user;
    }

    public function getRole(): ?string
    {
        $stmt = Database::prepare(
            "SELECT CASE
                WHEN EXISTS (
                    SELECT 1 FROM Administrateur WHERE num_administrateur = ?)
                    THEN 'administrateur'
                WHEN EXISTS (
                    SELECT 1 FROM Directeur WHERE num_directeur = ?)
                    THEN 'directeur'
                ELSE NULL
            END AS role;"
        );
        $stmt->execute([$this->numUtilisateur, $this->numUtilisateur]);
        $role = $stmt->fetchColumn();
        return $role !== false ? $role : null;
    }

    public function toArray(): array
    {
        return [
            'numUtilisateur' => $this->numUtilisateur,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'adresse' => $this->adresse,
            'login' => $this->login,
            'typeCompte' => $this->typeCompte->value,
            'numClub' => $this->numClub,
            'photoProfilUrl' => $this->photoProfilUrl,
            'age' => $this->age,
        ];
    }

    public function getNumUtilisateur(): int
    {
        return $this->numUtilisateur;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function getLogin(): string
    {
        return $this->login;
    }

    public function getMotDePasse(): string
    {
        return $this->motDePasse;
    }

    public function getTypeCompte(): UtilisateurType
    {
        return $this->typeCompte;
    }

    public function getNumClub(): ?int
    {
        return $this->numClub;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function getPhotoProfilUrl(): ?string
    {
        return $this->photoProfilUrl;
    }

    public function getAge(): int
    {
        return $this->age;
    }
}
