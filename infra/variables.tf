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
