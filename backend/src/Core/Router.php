<?php
declare(strict_types=1);

namespace DrawArena\Core;

class Router
{
    private array $routes = [];
    private array $globalMiddlewares = [];
    private Request $request;
    private Response $response;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
    }

    /**
     * Register a global middleware (applies to all routes)
     */
    public function use(mixed $middleware): self
    {
        $this->globalMiddlewares[] = $middleware;
        return $this;
    }

    /**
     * Register a GET route with optional middlewares
     */
    public function get(string $path, callable|array $handler, array $middlewares = []): self
    {
        return $this->route('GET', $path, $handler, $middlewares);
    }

    /**
     * Register a POST route with optional middlewares
     */
    public function post(string $path, callable|array $handler, array $middlewares = []): self
    {
        return $this->route('POST', $path, $handler, $middlewares);
    }

    /**
     * Register a PUT route with optional middlewares
     */
    public function put(string $path, callable|array $handler, array $middlewares = []): self
    {
        return $this->route('PUT', $path, $handler, $middlewares);
    }

    /**
     * Register a DELETE route with optional middlewares
     */
    public function delete(string $path, callable|array $handler, array $middlewares = []): self
    {
        return $this->route('DELETE', $path, $handler, $middlewares);
    }

    private function route(string $method, string $path, callable|array $handler, array $middlewares = []): self
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares,
        ];
        return $this;
    }

    public function dispatch(): void
    {
        $method = $this->request->getMethod();
        $path = $this->request->getPath();

        // Run global middlewares first
        foreach ($this->globalMiddlewares as $middleware) {
            $middleware->handle($this->request, $this->response);
        }

        // Find matching route
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->pathMatches($route['path'], $path)) {
                // Run route-specific middlewares
                foreach ($route['middlewares'] as $middleware) {
                    $middleware->handle($this->request, $this->response);
                }

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
