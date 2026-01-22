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
  allow_nested_items_to_be_public = true
  min_tls_version                 = "TLS1_2"

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }

  tags = {
    project = "Draw-Arena"
    environment = var.environment
  }
}

resource "azurerm_storage_container" "uploads" {
  name                  = var.storage_container_name
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "blob"
}

locals {
  frontend_origin        = trimsuffix(azurerm_storage_account.this.primary_web_endpoint, "/")
  backend_allowed_origins = compact(concat([local.frontend_origin], var.backend_allowed_origins))
}

resource "azurerm_mysql_flexible_server" "this" {
  name                   = var.mysql_server_name
  resource_group_name    = data.azurerm_resource_group.this.name
  location               = var.location
  administrator_login    = var.mysql_admin_user
  administrator_password = var.mysql_admin_password
  sku_name               = var.mysql_sku_name
  version                = var.mysql_version
  backup_retention_days  = var.mysql_backup_retention_days

  storage {
    size_gb = var.mysql_storage_gb
  }

  tags = {
    project = "Draw-Arena"
    environment = var.environment
  }
}

resource "azurerm_mysql_flexible_database" "app" {
  name                = var.mysql_database_name
  resource_group_name = data.azurerm_resource_group.this.name
  server_name         = azurerm_mysql_flexible_server.this.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}

resource "azurerm_mysql_flexible_server_firewall_rule" "allow_azure" {
  count               = var.mysql_allow_azure_services ? 1 : 0
  name                = "AllowAzureServices"
  resource_group_name = data.azurerm_resource_group.this.name
  server_name         = azurerm_mysql_flexible_server.this.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_mysql_flexible_server_firewall_rule" "extra" {
  for_each            = { for rule in var.mysql_firewall_rules : rule.name => rule }
  name                = each.value.name
  resource_group_name = data.azurerm_resource_group.this.name
  server_name         = azurerm_mysql_flexible_server.this.name
  start_ip_address    = each.value.start_ip_address
  end_ip_address      = each.value.end_ip_address
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
    DB_HOST                             = azurerm_mysql_flexible_server.this.fqdn
    DB_NAME                             = azurerm_mysql_flexible_database.app.name
    DB_USER                             = var.mysql_admin_user
    DB_PASS                             = var.mysql_admin_password
    STORAGE_CONNECTION_STRING           = azurerm_storage_account.this.primary_connection_string
    STORAGE_ACCOUNT_NAME                = azurerm_storage_account.this.name
    STORAGE_BLOB_ENDPOINT               = azurerm_storage_account.this.primary_blob_endpoint
    STORAGE_PUBLIC_BASE_URL             = azurerm_storage_account.this.primary_blob_endpoint
    STORAGE_CONTAINER                   = azurerm_storage_container.uploads.name
    JWT_SECRET                          = var.backend_jwt_secret
  }

  site_config {
    always_on                         = true
    ftps_state                        = "Disabled"
    http2_enabled                     = true
    minimum_tls_version               = "1.2"
    scm_minimum_tls_version           = "1.2"
    vnet_route_all_enabled            = false
    app_command_line                  = "bash /home/site/wwwroot/startup.sh"

    # Health check path for Azure App Service Linux PHP
    health_check_path                 = "/api/health"
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
