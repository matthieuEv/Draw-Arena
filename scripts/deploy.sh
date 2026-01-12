#!/bin/bash
# Draw-Arena deployment script for Azure
# Usage: ./deploy.sh [init|backend|frontend|all] [preprod|prod]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Déterminer l'environnement (preprod ou prod)
ENV="${2:-prod}"
if [[ "$ENV" != "preprod" && "$ENV" != "prod" ]]; then
    echo "❌ Environnement invalide: $ENV (doit être 'preprod' ou 'prod')"
    exit 1
fi

echo "🎯 Déploiement pour l'environnement: $ENV"

cd "$PROJECT_ROOT/infra"

function deploy_infra() {
    echo "🏗️  Deploying Terraform infrastructure for $ENV..."
    terraform init
    terraform workspace select "$ENV" || terraform workspace new "$ENV"
    terraform apply -var-file="${ENV}.tfvars"
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

    echo "⚙️  Configuring frontend for $ENV environment..."
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    "$FRONTEND_DIR/build.sh"
    # Copier les fichiers frontend dans un répertoire temporaire
    TMP_DIR=$(mktemp -d)
    cp -r "$FRONTEND_DIR/dist/"* "$TMP_DIR/"
    
    # Remplacer le placeholder par l'URL réelle de l'API
    sed -i.bak "s|BACKEND_API_URL_PLACEHOLDER|$API_URL|g" "$TMP_DIR/config.js"
    rm -f "$TMP_DIR/config.js.bak"
    
    echo "📤 Uploading frontend to Azure Storage ($ENV)..."
    az storage blob upload-batch \
        --destination '$web' \
        --source "$TMP_DIR" \
        --account-name "$STORAGE_NAME" \
        --auth-mode login \
        --overwrite
    
    WORKSPACE_NAME=$(terraform workspace show 2>/dev/null || echo "default")
    echo ""
    echo "🌐 Application URLs ($WORKSPACE_NAME):"
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
        echo "🎉 Complete deployment finished for $ENV!"
        ;;
    *)
        echo "Usage: $0 {init|backend|frontend|all} [preprod|prod]"
        echo ""
        echo "Examples:"
        echo "  $0 all preprod    # Déploie tout sur preprod"
        echo "  $0 frontend prod  # Déploie seulement le frontend sur prod
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
