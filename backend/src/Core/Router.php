<?php
declare(strict_types=1);

namespace DrawArena\Core;

class Router
{
    private array $routes = [];
    private array $middlewares = [];
    private Request $request;
    private Response $response;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
    }

    public function use(mixed $middleware): self
    {
        $this->middlewares[] = $middleware;
        return $this;
    }

    public function get(string $path, callable|array $handler): self
    {
        return $this->route('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): self
    {
        return $this->route('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): self
    {
        return $this->route('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): self
    {
        return $this->route('DELETE', $path, $handler);
    }

    private function route(string $method, string $path, callable|array $handler): self
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
        ];
        return $this;
    }

    public function dispatch(): void
    {
        $method = $this->request->getMethod();
        $path = $this->request->getPath();

        // Run middlewares
        foreach ($this->middlewares as $middleware) {
            $middleware->handle($this->request, $this->response);
        }

        // Find matching route
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->pathMatches($route['path'], $path)) {
                $this->executeHandler($route['handler']);
                return;
            }
        }

        // No route found
        $this->response->error('Route not found', 404)->send();
    }

    private function pathMatches(string $routePath, string $requestPath): bool
    {
        $routePath = rtrim($routePath, '/');
        $requestPath = rtrim($requestPath, '/');
        return $routePath === $requestPath;
    }

    private function executeHandler(callable|array $handler): void
    {
        if (is_array($handler)) {
            [$className, $methodName] = $handler;
            $instance = new $className();
            $instance->$methodName($this->request, $this->response);
        } else {
            $handler($this->request, $this->response);
        }
    }
}
