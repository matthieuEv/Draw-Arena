# Configuration Terraform pour l'environnement PRODUCTION

environment                 = "prod"
storage_account_name        = "drawarenastatic2026"
backend_service_plan_name   = "draw-arena-backend-plan"
backend_app_name            = "draw-arena-backend-app"
backend_sku_name            = "B1"  # Ajuster selon les besoins (S1, P1V2, etc.)

# CORS sera configuré automatiquement avec l'URL du frontend
backend_allowed_origins     = []

# MySQL flexible server (nom DNS unique)
mysql_server_name           = "draw-arena-mysql-prod"
mysql_admin_user            = "drawarena"
mysql_database_name         = "drawarena"
# Fournir mysql_admin_password via TF_VAR_mysql_admin_password ou terraform apply -var
