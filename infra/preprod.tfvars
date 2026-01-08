# Configuration Terraform pour l'environnement PREPROD

environment                 = "preprod"
storage_account_name        = "drawarenastaticpreprod"
backend_service_plan_name   = "draw-arena-backend-plan-preprod"
backend_app_name            = "draw-arena-backend-app-preprod"
backend_sku_name            = "B1"  # Basic tier pour preprod

# CORS sera configuré automatiquement avec l'URL du frontend
backend_allowed_origins     = []
