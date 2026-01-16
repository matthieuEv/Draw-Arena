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

    public function send(): void
    {
        http_response_code($this->statusCode);
        echo json_encode($this->payload, JSON_UNESCAPED_SLASHES);
        exit;
    }
}
