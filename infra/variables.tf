variable "location" {
  type        = string
  description = "Azure region for the Storage Account."
  default     = "francecentral"
}

variable "environment" {
  type        = string
  description = "Deployment environment tag for Azure resources (preprod or prod)."
  default     = "prod"

  validation {
    condition     = contains(["preprod", "prod"], var.environment)
    error_message = "environment must be one of: preprod, prod."
  }
}

variable "resource_group_name" {
  type        = string
  description = "Existing resource group name."
  default     = "draw-arena-rg"
}

variable "storage_account_name" {
  type        = string
  description = "Storage Account name (lowercase, 3-24 chars, globally unique)."
  default     = "drawarenastatic2026"
}

variable "account_tier" {
  type        = string
  description = "Storage Account tier."
  default     = "Standard"
}

variable "account_replication_type" {
  type        = string
  description = "Storage Account replication type."
  default     = "LRS"
}

variable "storage_container_name" {
  type        = string
  description = "Blob container name for uploaded images."
  default     = "post-images"
}

variable "backend_service_plan_name" {
  type        = string
  description = "App Service plan name for the PHP backend."
  default     = "draw-arena-backend-plan"
}

variable "backend_app_name" {
  type        = string
  description = "Backend Web App name (globally unique)."
  default     = "draw-arena-backend-app"
}

variable "backend_sku_name" {
  type        = string
  description = "App Service plan SKU for the backend (Linux)."
  default     = "B1"
}

variable "backend_php_version" {
  type        = string
  description = "PHP version for the backend App Service."
  default     = "8.2"
}

variable "backend_allowed_origins" {
  type        = list(string)
  description = "Additional allowed CORS origins for the backend API."
  default     = []
}

variable "backend_ip_restrictions" {
  type = list(object({
    name        = string
    ip_address  = string
    priority    = number
    action      = string
  }))
  description = "Liste des restrictions IP pour le backend (optionnel)."
  default     = []
}

variable "mysql_server_name" {
  type        = string
  description = "MySQL flexible server name (globally unique DNS)."
  default     = "draw-arena-mysql"
}

variable "mysql_admin_user" {
  type        = string
  description = "Administrator username for MySQL."
  default     = "drawarena"
}

variable "mysql_admin_password" {
  type        = string
  description = "Administrator password for MySQL."
  sensitive   = true

  validation {
    condition = length(var.mysql_admin_password) >= 8
    error_message = "mysql_admin_password must be at least 8 characters."
  }

  validation {
    condition = (
      (length(regexall("[A-Z]", var.mysql_admin_password)) > 0 ? 1 : 0) +
      (length(regexall("[a-z]", var.mysql_admin_password)) > 0 ? 1 : 0) +
      (length(regexall("[0-9]", var.mysql_admin_password)) > 0 ? 1 : 0) +
      (length(regexall("[^A-Za-z0-9]", var.mysql_admin_password)) > 0 ? 1 : 0)
    ) >= 3
    error_message = "mysql_admin_password must include characters from at least three categories: uppercase, lowercase, numbers, symbols."
  }
}

variable "mysql_database_name" {
  type        = string
  description = "Application database name."
  default     = "drawarena"
}

variable "mysql_version" {
  type        = string
  description = "MySQL version for flexible server."
  default     = "8.0.21"

  validation {
    condition     = contains(["5.7", "8.0.21"], var.mysql_version)
    error_message = "mysql_version must be one of: 5.7, 8.0.21."
  }
}

variable "mysql_sku_name" {
  type        = string
  description = "MySQL flexible server SKU."
  default     = "B_Standard_B1ms"
}

variable "mysql_storage_gb" {
  type        = number
  description = "Storage size in GB for MySQL."
  default     = 20
}

variable "mysql_backup_retention_days" {
  type        = number
  description = "Backup retention in days for MySQL."
  default     = 7
}

variable "mysql_allow_azure_services" {
  type        = bool
  description = "Allow Azure services to access the MySQL server."
  default     = true
}

variable "mysql_firewall_rules" {
  type = list(object({
    name             = string
    start_ip_address = string
    end_ip_address   = string
  }))
  description = "Additional firewall rules for MySQL."
  default     = []
}
