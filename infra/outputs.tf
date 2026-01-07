output "resource_group_name" {
  value       = data.azurerm_resource_group.this.name
  description = "Resource group name."
}

output "storage_account_name" {
  value       = azurerm_storage_account.this.name
  description = "Storage Account name."
}

output "static_website_url" {
  value       = azurerm_storage_account.this.primary_web_endpoint
  description = "Public URL of the Static Website."
}

output "backend_app_name" {
  value       = azurerm_linux_web_app.backend.name
  description = "Backend App Service name."
}

output "backend_app_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "Backend App Service base URL."
}

output "backend_api_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}/index.php/api"
  description = "Backend API base URL (App Service Linux uses /index.php/api)."
}

output "backend_identity_principal_id" {
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
  description = "Principal ID of the backend managed identity (for future DB access)."
}

output "backend_identity_tenant_id" {
  value       = azurerm_linux_web_app.backend.identity[0].tenant_id
  description = "Tenant ID of the backend managed identity."
}
