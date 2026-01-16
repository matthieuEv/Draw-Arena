<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\User;
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
            'username' => 'required|string|min:3|max:255',
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ])) {
            $response->error('Validation failed', 422, ['errors' => $validator->getErrors()])->send();
        }

        // Check if user exists
        if (User::existsByEmail($data['email'])) {
            $response->error('Email already registered', 409)->send();
        }

        // Create user
        if (!User::create($data['username'], $data['email'], $data['password'])) {
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
            'email' => 'required|email',
            'password' => 'required|string',
        ])) {
            $response->error('Validation failed', 422, ['errors' => $validator->getErrors()])->send();
        }

        // Find user
        $user = User::findByEmail($data['email']);
        if (!$user) {
            $response->error('Invalid credentials', 401)->send();
        }

        // Verify password
        if (!User::verifyPassword($data['password'], $user['password'])) {
            $response->error('Invalid credentials', 401)->send();
        }

        // Generate JWT token
        $jwtManager = new JwtManager();
        $token = $jwtManager->generateToken([
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
        ]);

        $response->success([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
            ]
        ])->send();
    }
}
