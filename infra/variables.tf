variable "location" {
  type        = string
  description = "Azure region for the Storage Account."
  default     = "francecentral"
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
