<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Utilisateur;
use DrawArena\Models\UtilisateurType;
use DrawArena\Utils\JwtManager;
use DrawArena\Utils\Validator;

class AuthHandler
{
    public function register(Request $request, Response $response): void
    {
        $data = $request->getBody();

        // Validate input
        $validator = new Validator();
        if (!$validator->validate($data, [
            'nom' => 'required|string|min:2|max:100',
            'prenom' => 'required|string|min:2|max:100',
            'login' => 'required|email|string|max:100',
            'password' => 'required|string|min:6|max:255',
            'num_club' => 'int',
            'typeCompte' => 'string|typeCompte',
            'adresse' => 'string|min:2|max:255',
            'photo_profil_url' => 'string|min:2|max:255',
            'age' => 'int',
        ])) {
            $response->error('Validation failed', 422, ['errors' => $validator->getErrors()])->send();
        }

        // Check if user exists
        if (Utilisateur::existsByLogin($data['login'])) {
            $response->error('Login already registered', 409)->send();
        }

        // Create user
        $typeCompte = UtilisateurType::from($data['typeCompte'] ?? 'prive');
        if (!Utilisateur::create(
            $data['nom'],
            $data['prenom'],
            $data['login'],
            $data['password'],
            $typeCompte,
            $data['adresse'] ?? null,
            $data['num_club'] ?? null,
            $data['photo_profil_url'] ?? null,
            $data['age'] ?? 0
        )) {
            $response->error('Failed to create user', 500)->send();
        }

        $response->success(['message' => 'User registered successfully'], 201)->send();
    }

    public function login(Request $request, Response $response): void
    {
        $data = $request->getBody();

        // Validate input
        $validator = new Validator();
        if (!$validator->validate($data, [
            'login' => 'required|email|string|min:2|max:100',
            'password' => 'required|string',
        ])) {
            $response->error('Validation failed', 422, ['errors' => $validator->getErrors()])->send();
        }

        // Find user by login
        $user = Utilisateur::getByLogin($data['login']);
        if (!$user) {
            $response->error('Invalid credentials', 401)->send();
        }

        // Verify password
        if (!Utilisateur::verifyPassword($data['password'], $user->getMotDePasse())) {
            $response->error('Invalid credentials', 401)->send();
        }

        // Generate JWT token with user data
        $jwtManager = new JwtManager();
        $token = $jwtManager->generateToken([
            'numUtilisateur' => $user->getNumUtilisateur(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'login' => $user->getLogin(),
            'photoProfilUrl' => $user->getPhotoProfilUrl(),
            'typeCompte' => $user->getTypeCompte()->value,
        ]);

        $response->success([
            'token' => $token,
            'role' => $user->getRole(),
            'club' => $user->getNumClub(),
        ])->send();
    }
}
