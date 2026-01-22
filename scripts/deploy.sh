#!/bin/bash
# Draw-Arena deployment script for Azure
# Usage: ./deploy.sh [init|db|backend|frontend|all] [preprod|prod]

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

function ensure_terraform() {
    if [[ ! -d "$PROJECT_ROOT/infra/.terraform" ]]; then
        terraform init
    fi
}

function ensure_workspace() {
    ensure_terraform
    terraform workspace select "$ENV" >/dev/null 2>&1 || terraform workspace new "$ENV"
}

function show_urls() {
    cd "$PROJECT_ROOT/infra"
    ensure_workspace
    WORKSPACE_NAME=$(terraform workspace show 2>/dev/null || echo "default")
    echo ""
    echo "🌐 Application URLs ($WORKSPACE_NAME):"
    echo "   Frontend: $(terraform output -raw static_website_url)"
    echo "   Backend:  $(terraform output -raw backend_api_url)"
    echo ""
}

function deploy_infra() {
    echo "🏗️  Deploying Terraform infrastructure for $ENV..."
    terraform init
    terraform workspace select "$ENV" || terraform workspace new "$ENV"
    terraform apply -var-file="${ENV}.tfvars"
    echo "✅ Infrastructure deployed"
}

function run_composer_install() {
    local target_dir="$1"

    if command -v composer >/dev/null 2>&1; then
        (cd "$target_dir" && composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader)
        return 0
    fi

    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ composer not found and docker is unavailable."
        echo "   Install composer or docker to build backend dependencies."
        exit 1
    fi

    docker run --rm \
        -e COMPOSER_ALLOW_SUPERUSER=1 \
        -v "$target_dir":/app \
        -w /app \
        composer:2 \
        install --no-dev --no-scripts --prefer-dist --optimize-autoloader
}

function build_backend_package() {
    local tmp_dir
    tmp_dir=$(mktemp -d)

    tar -C "$PROJECT_ROOT/backend" -cf - . | tar -C "$tmp_dir" -xf -
    rm -rf "$tmp_dir/.git" "$tmp_dir/__pycache__" "$tmp_dir/vendor"
    rm -f "$tmp_dir/readme.md"

    run_composer_install "$tmp_dir"

    (cd "$tmp_dir" && zip -r "$PROJECT_ROOT/backend.zip" . -x "*.git*" -x "__pycache__/*" -x "readme.md")

    rm -rf "$tmp_dir"
}

function load_db_password() {
    if [[ -n "${MYSQL_PWD:-}" ]]; then
        return 0
    fi

    if [[ -n "${MYSQL_ADMIN_PASSWORD:-}" ]]; then
        export MYSQL_PWD="$MYSQL_ADMIN_PASSWORD"
        return 0
    fi

    if [[ -n "${TF_VAR_mysql_admin_password:-}" ]]; then
        export MYSQL_PWD="$TF_VAR_mysql_admin_password"
        return 0
    fi

    read -s -p "MySQL admin password: " MYSQL_PWD
    echo ""
    export MYSQL_PWD
}

function resolve_mysql_client() {
    if [[ -n "${MYSQL_CLIENT:-}" ]]; then
        if command -v "$MYSQL_CLIENT" >/dev/null 2>&1; then
            command -v "$MYSQL_CLIENT"
            return 0
        fi
        if [[ -x "$MYSQL_CLIENT" ]]; then
            echo "$MYSQL_CLIENT"
            return 0
        fi
        return 1
    fi

    if command -v mariadb >/dev/null 2>&1; then
        command -v mariadb
        return 0
    fi

    local candidates=(
        "/opt/homebrew/opt/mariadb/bin/mariadb"
        "/usr/local/opt/mariadb/bin/mariadb"
        "/opt/homebrew/opt/mysql-client@8.0/bin/mysql"
        "/opt/homebrew/opt/mysql-client@8.4/bin/mysql"
        "/usr/local/opt/mysql-client@8.0/bin/mysql"
        "/usr/local/opt/mysql-client@8.4/bin/mysql"
        "/opt/homebrew/opt/mysql-client/bin/mysql"
        "/usr/local/opt/mysql-client/bin/mysql"
    )

    local candidate
    for candidate in "${candidates[@]}"; do
        if [[ -x "$candidate" ]]; then
            echo "$candidate"
            return 0
        fi
    done

    if command -v mysql >/dev/null 2>&1; then
        command -v mysql
        return 0
    fi

    return 1
}

function deploy_db() {
    echo "🗄️  Initializing database schema for $ENV..."
    cd "$PROJECT_ROOT/infra"
    ensure_workspace

    MYSQL_BIN=$(resolve_mysql_client) || true
    if [[ -z "${MYSQL_BIN:-}" ]]; then
        echo "❌ MySQL client not found. Install mariadb or mysql-client@8.0/@8.4, or set MYSQL_CLIENT."
        exit 1
    fi

    MYSQL_VERSION=$("$MYSQL_BIN" --version 2>/dev/null || true)
    if [[ -n "$MYSQL_VERSION" ]] && ! echo "$MYSQL_VERSION" | grep -qi "MariaDB"; then
        MYSQL_MAJOR=$(echo "$MYSQL_VERSION" | sed -n 's/.*Distrib \([0-9]\+\)\..*/\1/p')
        if [[ -z "$MYSQL_MAJOR" ]]; then
            MYSQL_MAJOR=$(echo "$MYSQL_VERSION" | sed -n 's/.*Ver \([0-9]\+\)\..*/\1/p')
        fi
        if [[ -n "$MYSQL_MAJOR" && "$MYSQL_MAJOR" -ge 9 ]]; then
            echo "❌ Incompatible MySQL client detected ($MYSQL_VERSION)."
            echo "   MySQL 9+ often lacks mysql_native_password needed for Azure."
            echo "   Install mysql-client@8.0 or mariadb, or set MYSQL_CLIENT to a compatible binary."
            exit 1
        fi
    fi

    load_db_password

    MYSQL_HOST=$(terraform output -raw mysql_server_fqdn)
    MYSQL_USER=$(terraform output -raw mysql_admin_user)
    MYSQL_DB=$(terraform output -raw mysql_database_name)

    if ! "$MYSQL_BIN" \
        --host "$MYSQL_HOST" \
        --user "$MYSQL_USER" \
        --ssl-mode=REQUIRED \
        --database "$MYSQL_DB" \
        < "$PROJECT_ROOT/database/init.sql"; then
        echo "❌ MySQL client failed to connect."
        echo "   If you use MySQL 9+, install mysql-client@8.0 or mariadb, or set MYSQL_CLIENT."
        exit 1
    fi

    unset MYSQL_PWD

    echo "✅ Database initialized: $MYSQL_DB ($MYSQL_HOST)"
}

function deploy_backend() {
    echo "📦 Creating backend package..."
    build_backend_package
    
    cd "$PROJECT_ROOT/infra"
    
    ensure_workspace
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
    echo "curl  $API_URL/health..."
    curl -f "$API_URL/health" || echo "⚠️  Health check failed"
    
    echo "✅ Backend deployed: $API_URL"
}

function deploy_frontend() {
    cd "$PROJECT_ROOT/infra"

    ensure_workspace
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

    rm -rf "$TMP_DIR"
}

case "${1:-all}" in
    init)
        deploy_infra
        show_urls
        ;;
    db|database)
        deploy_db
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
        deploy_db
        deploy_backend
        deploy_frontend
        show_urls
        echo "🎉 Complete deployment finished for $ENV!"
        ;;
    *)
        echo "Usage: $0 {init|db|backend|frontend|all} [preprod|prod]"
        echo ""
        echo "Examples:"
        echo "  $0 all preprod     # Déploie tout sur preprod"
        echo "  $0 backend prod    # Déploie seulement le backend sur prod"
        echo "  $0 db preprod      # Initialise le schéma DB sur preprod"
        exit 1
        ;;
esac
