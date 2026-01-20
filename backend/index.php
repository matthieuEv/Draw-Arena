<?php
/**
 * Azure App Service entry point
 * Redirects to the actual application entry point in public/
 */

// Change working directory to public folder
chdir(__DIR__ . '/public');

// Include the real entry point
require __DIR__ . '/public/index.php';
