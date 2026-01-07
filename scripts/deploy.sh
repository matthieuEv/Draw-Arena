#!/bin/bash
# Draw-Arena deployment script for Azure
# Usage: ./deploy.sh [init|backend|frontend|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/infra"

function deploy_infra() {
    echo "🏗️  Deploying Terraform infrastructure..."
    terraform init
    terraform apply
    echo "✅ Infrastructure deployed"
}

function deploy_backend() {
    echo "📦 Creating backend package..."
    cd "$PROJECT_ROOT/backend"
    zip -r "$PROJECT_ROOT/backend.zip" . -x "*.git*" -x "readme.md" -x "__pycache__/*"
    
    cd "$PROJECT_ROOT/infra"
    
    RG_NAME=$(terraform output -raw resource_group_name)
    APP_NAME=$(terraform output -raw backend_app_name)
    
    echo "🚀 Deploying backend to Azure App Service..."
    az webapp deploy \
        --resource-group "$RG_NAME" \
        --name "$APP_NAME" \
        --type zip \
        --src-path "$PROJECT_ROOT/backend.zip"
    
    rm "$PROJECT_ROOT/backend.zip"
    
    echo "🔍 Verifying health check..."
    API_URL=$(terraform output -raw backend_api_url)
    sleep 5
    curl -f "$API_URL/health" || echo "⚠️  Health check failed"
    
    echo "✅ Backend deployed: $API_URL"
}

function deploy_frontend() {
    cd "$PROJECT_ROOT/infra"
    
    API_URL=$(terraform output -raw backend_api_url)
    STORAGE_NAME=$(terraform output -raw storage_account_name)
    
    echo "⚙️  Configuring frontend..."
    echo "window.API_BASE = \"$API_URL\";" > "$PROJECT_ROOT/frontend/config.js"
    
    echo "📤 Uploading frontend to Azure Storage..."
    az storage blob upload-batch \
        --destination '$web' \
        --source "$PROJECT_ROOT/frontend" \
        --account-name "$STORAGE_NAME" \
        --auth-mode login \
        --overwrite
    
    FRONTEND_URL=$(terraform output -raw static_website_url)
    echo "✅ Frontend deployed: $FRONTEND_URL"
}

function show_urls() {
    cd "$PROJECT_ROOT/infra"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: $(terraform output -raw static_website_url)"
    echo "   Backend:  $(terraform output -raw backend_api_url)"
    echo ""
}

case "${1:-all}" in
    init)
        deploy_infra
        show_urls
        ;;
    backend)
        deploy_backend
        show_urls
        ;;
    frontend)
        deploy_frontend
        show_urls
        ;;
    all)
        deploy_infra
        deploy_backend
        deploy_frontend
        show_urls
        echo "🎉 Complete deployment finished!"
        ;;
    *)
        echo "Usage: $0 {init|backend|frontend|all}"
        exit 1
        ;;
esac
