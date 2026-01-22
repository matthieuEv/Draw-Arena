#!/bin/bash
# Azure App Service startup script for Draw-Arena backend
# This script copies the custom nginx configuration and restarts nginx

echo "🚀 Starting Draw-Arena backend initialization..."

# Copy custom nginx configuration
if [ -f /home/site/wwwroot/default ]; then
    echo "📝 Copying custom nginx configuration..."
    cp /home/site/wwwroot/default /etc/nginx/sites-available/default
    cp /home/site/wwwroot/default /etc/nginx/sites-enabled/default
    echo "✅ Nginx configuration copied"
else
    echo "⚠️  Custom nginx config not found at /home/site/wwwroot/default"
fi

# Reload nginx to apply configuration
if command -v nginx >/dev/null 2>&1; then
    echo "🔄 Reloading nginx..."
    nginx -t && nginx -s reload || echo "⚠️  Nginx reload failed"
    echo "✅ Nginx reloaded"
fi

echo "✅ Draw-Arena backend initialization complete"
