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
