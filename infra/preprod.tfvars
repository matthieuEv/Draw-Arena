# Configuration Terraform pour l'environnement PREPROD

environment                 = "preprod"
resource_group_name         = "draw-arena-rg-preprod"
storage_account_name        = "drawarenastaticpreprod"
backend_service_plan_name   = "draw-arena-backend-plan-preprod"
backend_app_name            = "draw-arena-backend-app-preprod"
backend_sku_name            = "B1"  # Basic tier pour preprod

# CORS sera configuré automatiquement avec l'URL du frontend
backend_allowed_origins     = []

# MySQL flexible server (nom DNS unique)
mysql_server_name           = "draw-arena-mysql-preprod"
mysql_admin_user            = "drawarena"
mysql_database_name         = "drawarena"
# Fournir mysql_admin_password via TF_VAR_mysql_admin_password ou terraform apply -var
