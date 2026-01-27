<?php
declare(strict_types=1);

namespace DrawArena\Core;

class Response
{
    private int $statusCode = 200;
    private array $payload = [];
    private array $headers = [];

    public function setStatus(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }

    public function json(array $data): self
    {
        $this->payload = $data;
        return $this;
    }

    public function success(array $data, int $code = 200): self
    {
        return $this->setStatus($code)->json($data);
    }

    public function error(string $message, int $code = 400, array $details = []): self
    {
        return $this->setStatus($code)->json([
            'error' => $message,
            'code' => $code,
            ...$details
        ]);
    }

    public function send(?string $content = null, ?int $code = null, array $headers = []): void
    {
        http_response_code($code ?? $this->statusCode);

        foreach ($headers as $name => $value) {
            header("$name: $value");
        }

        if ($content !== null) {
            // Mode contenu brut (HTML, JSON string, etc.)
            if (empty($headers)) {
                header('Content-Type: application/json');
            }
            echo $content;
        } else {
            // Mode JSON API classique
            header('Content-Type: application/json');
            echo json_encode($this->payload, JSON_UNESCAPED_SLASHES);
        }
        exit;
    }
}
