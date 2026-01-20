#!/bin/bash
# Azure App Service startup script for Draw-Arena backend
# This script copies the custom nginx configuration and starts services

echo "🚀 Starting Draw-Arena backend initialization..."

# Copy custom nginx configuration
if [ -f /home/site/wwwroot/default ]; then
    echo "📝 Copying custom nginx configuration..."
    cp /home/site/wwwroot/default /etc/nginx/sites-available/default
    cp /home/site/wwwroot/default /etc/nginx/sites-enabled/default
    echo "✅ Nginx configuration copied"

    # Test nginx configuration
    nginx -t
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration is invalid, using default"
    fi
else
    echo "⚠️  Custom nginx config not found at /home/site/wwwroot/default"
fi

echo "✅ Draw-Arena backend initialization complete"

# Start PHP-FPM (Azure expects this as the main process)
exec php-fpm
