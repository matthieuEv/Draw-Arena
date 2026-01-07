<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function allowed_origins(): array
{
    $raw = getenv('ALLOWED_ORIGINS') ?: '';
    $origins = array_map('trim', explode(',', $raw));
    return array_values(array_filter($origins, static fn($origin) => $origin !== ''));
}

$allowed_origins = allowed_origins();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$origin_allowed = $origin !== '' && in_array($origin, $allowed_origins, true);

if ($origin_allowed) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (!$origin_allowed) {
        respond(['error' => 'CORS origin not allowed'], 403);
    }
    http_response_code(204);
    exit;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: 'db';
    $name = getenv('DB_NAME') ?: 'drawarena';
    $user = getenv('DB_USER') ?: 'drawarena';
    $pass = getenv('DB_PASS') ?: 'drawarena';

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $host, $name);
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function read_json(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);

    return is_array($data) ? $data : [];
}

function get_auth_token(): ?string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = $headers['X-Auth-Token'] ?? $headers['x-auth-token'] ?? $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';

    if ($auth && preg_match('/Bearer\s+(\S+)/i', $auth, $matches)) {
        return $matches[1];
    }

    if ($token) {
        return $token;
    }

    return null;
}

function require_user(): array
{
    $token = get_auth_token();
    if (!$token) {
        respond(['error' => 'Unauthorized'], 401);
    }

    $stmt = db()->prepare('SELECT users.id, users.username FROM tokens JOIN users ON users.id = tokens.user_id WHERE tokens.token = ?');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        respond(['error' => 'Unauthorized'], 401);
    }

    return $user;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Normalize paths when requests go through /index.php (App Service nginx).
$script_name = $_SERVER['SCRIPT_NAME'] ?? '';
if ($script_name !== '' && str_starts_with($path, $script_name)) {
    $path = substr($path, strlen($script_name));
    if ($path === '') {
        $path = '/';
    }
}

if ($path === '/api/health' && $method === 'GET') {
    respond(['ok' => true]);
}

if ($path === '/api/register' && $method === 'POST') {
    $data = read_json();
    $username = trim((string)($data['username'] ?? ''));
    $password = (string)($data['password'] ?? '');

    if ($username === '' || strlen($username) < 3 || strlen($username) > 30) {
        respond(['error' => 'Username must be 3-30 characters'], 422);
    }

    if (strlen($password) < 6) {
        respond(['error' => 'Password must be at least 6 characters'], 422);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = db()->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, $hash]);
    } catch (PDOException $e) {
        if (isset($e->errorInfo[1]) && (int)$e->errorInfo[1] === 1062) {
            respond(['error' => 'Username already taken'], 409);
        }
        throw $e;
    }

    respond(['message' => 'User created'], 201);
}

if ($path === '/api/login' && $method === 'POST') {
    $data = read_json();
    $username = trim((string)($data['username'] ?? ''));
    $password = (string)($data['password'] ?? '');

    if ($username === '' || $password === '') {
        respond(['error' => 'Missing credentials'], 422);
    }

    $stmt = db()->prepare('SELECT id, password_hash FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['error' => 'Invalid credentials'], 401);
    }

    $token = bin2hex(random_bytes(32));
    $stmt = db()->prepare('INSERT INTO tokens (user_id, token) VALUES (?, ?)');
    $stmt->execute([$user['id'], $token]);

    respond(['token' => $token, 'username' => $username]);
}

if ($path === '/api/logout' && $method === 'POST') {
    $token = get_auth_token();
    if (!$token) {
        respond(['error' => 'Unauthorized'], 401);
    }

    $stmt = db()->prepare('DELETE FROM tokens WHERE token = ?');
    $stmt->execute([$token]);

    respond(['message' => 'Logged out']);
}

if ($path === '/api/me' && $method === 'GET') {
    $user = require_user();
    respond(['id' => $user['id'], 'username' => $user['username']]);
}

if ($path === '/api/posts' && $method === 'GET') {
    require_user();
    $stmt = db()->query('SELECT posts.id, posts.title, posts.body, posts.created_at, users.username AS author FROM posts JOIN users ON users.id = posts.user_id ORDER BY posts.created_at DESC');
    $posts = $stmt->fetchAll();

    respond(['posts' => $posts]);
}

if ($path === '/api/posts' && $method === 'POST') {
    $user = require_user();
    $data = read_json();
    $title = trim((string)($data['title'] ?? ''));
    $body = trim((string)($data['body'] ?? ''));

    if ($title === '' || strlen($title) > 120) {
        respond(['error' => 'Title required (max 120 chars)'], 422);
    }

    if ($body === '') {
        respond(['error' => 'Body required'], 422);
    }

    $stmt = db()->prepare('INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $title, $body]);
    $id = (int)db()->lastInsertId();

    respond([
        'post' => [
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'author' => $user['username'],
        ]
    ], 201);
}

respond(['error' => 'Not found'], 404);
