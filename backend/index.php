<?php
/**
 * Entry point for Azure App Service
 * Redirects to the actual application entry point in public/
 */

// Include the real entry point
require __DIR__ . '/public/index.php';
