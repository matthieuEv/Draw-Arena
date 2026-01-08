# Configuration Terraform pour l'environnement PRODUCTION

environment                 = "prod"
storage_account_name        = "drawarenastaticprod"
backend_service_plan_name   = "draw-arena-backend-plan"
backend_app_name            = "draw-arena-backend-app"
backend_sku_name            = "B1"  # Ajuster selon les besoins (S1, P1V2, etc.)

# CORS sera configuré automatiquement avec l'URL du frontend
backend_allowed_origins     = []
