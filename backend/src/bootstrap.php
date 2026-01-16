<?php
declare(strict_types=1);

/**
 * Bootstrap file - Initialize application configuration
 */

// Load environment variables
$envFile = __DIR__ . '/../.env.local';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, ' "\'');
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

// Set default headers
header('Content-Type: application/json; charset=utf-8');

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', getenv('APP_DEBUG') === 'true' ? '1' : '0');

// Timezone
date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'UTC');
