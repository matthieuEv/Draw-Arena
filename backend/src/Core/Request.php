<?php
declare(strict_types=1);

namespace DrawArena\Core;

class Request
{
    private string $method;
    private string $path;
    private array $queryParams;
    private array $body;
    private array $headers;
    private array $params = [];

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $this->queryParams = $_GET;
        $this->headers = $this->getAllHeaders();
        $this->body = $this->parseBody();
    }

    /**
     * Set route parameters (e.g., {id}, {slug})
     */
    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    /**
     * Get a specific route parameter
     */
    public function getParam(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    /**
     * Get all route parameters
     */
    public function getParams(): array
    {
        return $this->params;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getQuery(string $key, mixed $default = null): mixed
    {
        return $this->queryParams[$key] ?? $default;
    }

    public function getBodyParam(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function getBody(): array
    {
        return $this->body;
    }

    public function getHeader(string $key, mixed $default = null): mixed
    {
        $key = strtolower(str_replace('-', '_', $key));

        // Check in headers array first
        if (isset($this->headers[$key])) {
            return $this->headers[$key];
        }

        // Also check in $_SERVER directly (some servers may not populate HTTP_ prefix properly)
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        if (isset($_SERVER[$serverKey])) {
            return $_SERVER[$serverKey];
        }

        // Check without HTTP_ prefix for Content-Type and Content-Length
        if (in_array($key, ['content_type', 'content_length'])) {
            $serverKey = strtoupper($key);
            if (isset($_SERVER[$serverKey])) {
                return $_SERVER[$serverKey];
            }
        }

        return $default;
    }

    public function getBearerToken(): ?string
    {
        $auth = $this->getHeader('Authorization') ?? '';
        if (preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function parseBody(): array
    {
        $contentType = $this->getHeader('Content-Type') ?? '';

        if (strpos($contentType, 'application/json') !== false) {
            $input = file_get_contents('php://input');
            $decoded = json_decode($input, true);
            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }

    private function getAllHeaders(): array
    {
        $headers = [];

        // Use getallheaders() if available (most reliable, especially for Authorization header)
        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $key => $value) {
                $headers[strtolower(str_replace('-', '_', $key))] = $value;
            }
            return $headers;
        }

        // Fallback for environments without getallheaders()
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headerKey = strtolower(substr($key, 5));
                $headers[$headerKey] = $value;
            }
        }
        return $headers;
    }
}
