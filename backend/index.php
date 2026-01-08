<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Blob\Models\CreateContainerOptions;
use MicrosoftAzure\Storage\Blob\Models\PublicAccessType;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;

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

function get_blob_client(): BlobRestProxy
{
    static $client = null;
    if ($client !== null) {
        return $client;
    }

    $account = getenv('STORAGE_ACCOUNT_NAME') ?: 'devstoreaccount1';
    $key = getenv('STORAGE_ACCOUNT_KEY') ?: 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==';
    $endpoint = getenv('STORAGE_BLOB_ENDPOINT') ?: 'http://azurite:10000/devstoreaccount1';
    
    $connectionString = "DefaultEndpointsProtocol=http;AccountName=$account;AccountKey=$key;BlobEndpoint=$endpoint;";
    $client = BlobRestProxy::createBlobService($connectionString);
    
    return $client;
}

function storage_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $account = getenv('STORAGE_ACCOUNT_NAME') ?: 'devstoreaccount1';
    $endpoint = rtrim(getenv('STORAGE_BLOB_ENDPOINT') ?: 'http://azurite:10000/devstoreaccount1', '/');
    $public_base = rtrim(getenv('STORAGE_PUBLIC_BASE_URL') ?: '', '/');
    $container = getenv('STORAGE_CONTAINER') ?: 'post-images';

    if ($public_base === '') {
        $public_base = $endpoint;
    }

    $config = [
        'account' => $account,
        'endpoint' => $endpoint,
        'public_base' => $public_base,
        'container' => $container,
    ];

    return $config;
}

function ensure_storage_container(): void
{
    static $ready = null;
    if ($ready === true) {
        return;
    }

    try {
        $client = get_blob_client();
        $config = storage_config();
        $container = $config['container'];
        
        // Try to get container properties (will throw if doesn't exist)
        try {
            $client->getContainerProperties($container);
        } catch (ServiceException $e) {
            if ($e->getCode() === 404) {
                // Container doesn't exist, create it with public blob access
                $options = new CreateContainerOptions();
                $options->setPublicAccess(PublicAccessType::BLOBS_ONLY);
                $client->createContainer($container, $options);
            } else {
                throw $e;
            }
        }
        
        $ready = true;
    } catch (ServiceException $e) {
        respond(['error' => 'Storage container unavailable: ' . $e->getMessage()], 500);
    }
}

function storage_public_url(string $blob_name): string
{
    $config = storage_config();
    $parts = array_map('rawurlencode', explode('/', $blob_name));
    $path = implode('/', $parts);

    return $config['public_base'] . '/' . $config['container'] . '/' . $path;
}

function storage_upload_blob(string $blob_name, string $content, string $mime): string
{
    ensure_storage_container();
    
    try {
        $client = get_blob_client();
        $config = storage_config();
        $container = $config['container'];
        
        $client->createBlockBlob($container, $blob_name, $content);
        
        return storage_public_url($blob_name);
    } catch (ServiceException $e) {
        respond(['error' => 'Storage upload failed: ' . $e->getMessage()], 500);
    }
}

function is_multipart_request(): bool
{
    $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
    return str_starts_with($content_type, 'multipart/form-data');
}

function image_extension_from_mime(string $mime): ?string
{
    $map = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    return $map[$mime] ?? null;
}

function upload_image_if_present(): ?string
{
    // Handle base64 image from JSON (image_data field)
    if (!is_multipart_request()) {
        $data = read_json();
        $image_data = $data['image_data'] ?? null;
        
        if ($image_data === null || !is_string($image_data)) {
            return null;
        }
        
        // Parse data URL: data:image/png;base64,iVBORw0KG...
        if (!preg_match('/^data:image\/(\w+);base64,(.+)$/', $image_data, $matches)) {
            respond(['error' => 'Invalid image_data format'], 422);
        }
        
        $extension = strtolower($matches[1]);
        $base64_data = $matches[2];
        
        // Validate extension
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $allowed_extensions, true)) {
            respond(['error' => 'Unsupported image type'], 415);
        }
        
        // Decode base64
        $content = base64_decode($base64_data, true);
        if ($content === false) {
            respond(['error' => 'Invalid base64 data'], 422);
        }
        
        // Check size
        $max_bytes = (int)(getenv('UPLOAD_MAX_BYTES') ?: 5 * 1024 * 1024);
        if (strlen($content) > $max_bytes) {
            respond(['error' => 'Image too large (max 5MB)'], 413);
        }
        
        $mime = 'image/' . ($extension === 'jpg' ? 'jpeg' : $extension);
        $blob_name = sprintf('%s/%s.%s', gmdate('Y/m/d'), bin2hex(random_bytes(12)), $extension);
        
        return storage_upload_blob($blob_name, $content, $mime);
    }

    // Handle multipart file upload
    if (!isset($_FILES['image'])) {
        return null;
    }

    $file = $_FILES['image'];
    if (!is_array($file) || !isset($file['error'])) {
        respond(['error' => 'Invalid upload'], 422);
    }

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(['error' => 'Upload failed'], 422);
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        respond(['error' => 'Invalid upload'], 422);
    }

    $max_bytes = (int)(getenv('UPLOAD_MAX_BYTES') ?: 5 * 1024 * 1024);
    if ($file['size'] > $max_bytes) {
        respond(['error' => 'Image too large (max 5MB)'], 413);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!$mime) {
        respond(['error' => 'Invalid image'], 415);
    }

    $extension = image_extension_from_mime($mime);
    if ($extension === null) {
        respond(['error' => 'Unsupported image type'], 415);
    }

    $content = file_get_contents($file['tmp_name']);
    if ($content === false) {
        respond(['error' => 'Image read failed'], 500);
    }

    $blob_name = sprintf('%s/%s.%s', gmdate('Y/m/d'), bin2hex(random_bytes(12)), $extension);

    return storage_upload_blob($blob_name, $content, $mime);
}

// Get path from PATH_INFO if available (for /index.php/api/health), otherwise from REQUEST_URI (for /api/health with rewrite)
if (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] !== '') {
    $path = $_SERVER['PATH_INFO'];
} else {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
    // Normalize paths when requests go through /index.php (App Service nginx)
    $script_name = $_SERVER['SCRIPT_NAME'] ?? '';
    if ($script_name !== '' && str_ends_with($script_name, 'index.php') && str_starts_with($path, $script_name)) {
        $path = substr($path, strlen($script_name));
        if ($path === '') {
            $path = '/';
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

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
    $stmt = db()->query('SELECT posts.id, posts.title, posts.body, posts.image_url, posts.created_at, users.username AS author FROM posts JOIN users ON users.id = posts.user_id ORDER BY posts.created_at DESC');
    $posts = $stmt->fetchAll();

    respond(['posts' => $posts]);
}

if ($path === '/api/posts' && $method === 'POST') {
    $user = require_user();
    $data = is_multipart_request() ? $_POST : read_json();
    $title = trim((string)($data['title'] ?? ''));
    $body = trim((string)($data['body'] ?? ''));

    if ($title === '' || strlen($title) > 120) {
        respond(['error' => 'Title required (max 120 chars)'], 422);
    }

    if ($body === '') {
        respond(['error' => 'Body required'], 422);
    }

    $image_url = upload_image_if_present();

    $stmt = db()->prepare('INSERT INTO posts (user_id, title, body, image_url) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user['id'], $title, $body, $image_url]);
    $id = (int)db()->lastInsertId();

    respond([
        'post' => [
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'image_url' => $image_url,
            'author' => $user['username'],
        ]
    ], 201);
}

respond(['error' => 'Not found'], 404);
