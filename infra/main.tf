data "azurerm_resource_group" "this" {
  name = var.resource_group_name
}

resource "azurerm_storage_account" "this" {
  name                = var.storage_account_name
  resource_group_name = data.azurerm_resource_group.this.name
  location            = var.location

  account_kind                    = "StorageV2"
  account_tier                    = var.account_tier
  account_replication_type        = var.account_replication_type
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"

  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }

  tags = {
    project = "Draw-Arena"
    environment = var.environment
  }
}

locals {
  frontend_origin        = trimsuffix(azurerm_storage_account.this.primary_web_endpoint, "/")
  backend_allowed_origins = compact(concat([local.frontend_origin], var.backend_allowed_origins))
}

resource "azurerm_service_plan" "backend" {
  name                = var.backend_service_plan_name
  resource_group_name = data.azurerm_resource_group.this.name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.backend_sku_name

  tags = {
    project = "Draw-Arena"
    environment = var.environment
  }
}

resource "azurerm_linux_web_app" "backend" {
  name                = var.backend_app_name
  resource_group_name = data.azurerm_resource_group.this.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.backend.id
  https_only          = true

  # Identité managée pour une sécurité accrue (future DB connection)
  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    ALLOWED_ORIGINS                     = join(",", local.backend_allowed_origins)
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    POST_BUILD_SCRIPT_PATH              = "startup.sh"
  }

  site_config {
    always_on                         = true
    ftps_state                        = "Disabled"
    http2_enabled                     = true
    minimum_tls_version               = "1.2"
    scm_minimum_tls_version           = "1.2"
    vnet_route_all_enabled            = false
    
    # Health check path for Azure App Service Linux PHP
    health_check_path                 = "/index.php/api/health"
    health_check_eviction_time_in_min = 5

    application_stack {
      php_version = var.backend_php_version
    }

    # CORS configuration at infrastructure level (first line of defense)
    cors {
      allowed_origins     = local.backend_allowed_origins
      support_credentials = false
    }
  }

  # Logs de diagnostic pour monitoring
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = {
    project = "Draw-Arena"
    environment = var.environment
  }
}
