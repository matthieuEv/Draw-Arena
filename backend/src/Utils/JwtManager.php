<?php
declare(strict_types=1);

namespace DrawArena\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JwtManager
{
    private string $secret;
    private string $algorithm = 'HS256';
    private int $expiryTime = 3600; // 1 hour

    public function __construct()
    {
        $this->secret = getenv('JWT_SECRET');
        $this->expiryTime = (int)(getenv('JWT_EXPIRY') ?: 3600);
    }

    public function generateToken(array $payload): string
    {
        $payload['iat'] = time();
        $payload['exp'] = time() + $this->expiryTime;

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
            return (array)$decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    public function isValid(string $token): bool
    {
        return $this->verifyToken($token) !== null;
    }
}
