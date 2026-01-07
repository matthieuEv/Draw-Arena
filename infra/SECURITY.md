# Azure App Service Security - Draw-Arena

## 🔒 Implemented Security Measures

### 1. Transport Layer Security (TLS)
- ✅ **HTTPS required**: `https_only = true`
- ✅ **TLS 1.2 minimum**: Protection against obsolete protocols
- ✅ **HTTP/2 enabled**: Better performance and security

### 2. CORS Origin Management
- ✅ **Restrictive CORS**: Only authorized origins via `ALLOWED_ORIGINS`
- ✅ **PHP code validation**: Granular control with `Vary: Origin` header
- ✅ **Unauthorized origins rejected**: Returns 403 for invalid OPTIONS requests

### 3. Managed Identity
- ✅ **SystemAssigned identity**: For future secure database connection
- ✅ **No secrets in code**: Will use Azure AD for DB authentication
- ℹ️ **Outputs available**: `backend_identity_principal_id` and `backend_identity_tenant_id`

### 4. Monitoring and Diagnostics
- ✅ **HTTP logs**: 7-day retention (35MB max)
- ✅ **Detailed error messages**: For debugging
- ✅ **Failed request tracing**: Analysis of failed requests
- ✅ **Health check**: `/index.php/api/health` verified every 5 minutes by Azure

### 5. Deployment Protection
- ✅ **FTPS disabled**: `ftps_state = "Disabled"`
- ✅ **SCM on TLS 1.2**: Secure deployments only
- ✅ **Always On**: Avoids cold starts and timeouts

## 🛡️ Additional Security Recommendations

### For Production

#### 1. IP Restrictions (optional)
If you want to limit access to specific IPs:

\`\`\`terraform
# In terraform.tfvars or during apply
backend_ip_restrictions = [
  {
    name       = "Office"
    ip_address = "203.0.113.0/24"
    priority   = 100
    action     = "Allow"
  }
]
\`\`\`

Then add to \`main.tf\`:

\`\`\`terraform
resource "azurerm_linux_web_app" "backend" {
  # ... existing config ...
  
  site_config {
    # ... existing config ...
    
    dynamic "ip_restriction" {
      for_each = var.backend_ip_restrictions
      content {
        name       = ip_restriction.value.name
        ip_address = ip_restriction.value.ip_address
        priority   = ip_restriction.value.priority
        action     = ip_restriction.value.action
      }
    }
  }
}
\`\`\`

#### 2. Azure Application Gateway + WAF
For advanced protection against web attacks (OWASP Top 10):
- SQL Injection
- XSS (Cross-Site Scripting)
- DDoS protection

#### 3. Azure Key Vault
To securely store DB secrets:

\`\`\`terraform
resource "azurerm_key_vault_secret" "db_password" {
  name         = "db-password"
  value        = var.db_password
  key_vault_id = azurerm_key_vault.this.id
}

# In App Service
app_settings = {
  DB_PASS = "@Microsoft.KeyVault(SecretUri=\${azurerm_key_vault_secret.db_password.id})"
}
\`\`\`

#### 4. Private Endpoints
To completely isolate the backend in a private virtual network:
- No direct public access
- Communication via VNET only

#### 5. Rate Limiting
Implement in PHP code or via Azure Front Door:
- Request limit per IP
- Protection against abuse

## 📊 Health Check

### Backend
The \`/index.php/api/health\` endpoint returns:
\`\`\`json
{"ok": true}
\`\`\`

### Frontend
The health check verifies the API every 5 seconds and displays:
- 🟢 **"API online"**: 200 response with \`{"ok": true}\`
- 🟡 **"API degraded"**: 200 response but not \`{"ok": true}\`
- 🔴 **"API error (XXX)"**: Non-200 response (error code displayed)
- 🔴 **"API offline"**: Network error (CORS, timeout, etc.)

### Azure Health Check
Azure automatically checks \`/index.php/api/health\`:
- **Interval**: Every 5 minutes (\`health_check_eviction_time_in_min = 5\`)
- **Action**: If the endpoint fails, Azure automatically restarts the instance

## 🚀 Secure Deployment Checklist

- [ ] Verify \`ALLOWED_ORIGINS\` contains only trusted domains
- [ ] Confirm \`https_only = true\` is applied
- [ ] Test health check: \`curl https://\<backend\>/index.php/api/health\`
- [ ] Check logs: \`az webapp log tail --name <backend> --resource-group <rg>\`
- [ ] Test CORS from deployed frontend
- [ ] (Production) Configure Azure Monitor alerts
- [ ] (Production) Enable Azure Defender for App Service
- [ ] (Production) Configure automatic backups

## 📝 Notes

### Without Database
For now, the DB is not connected:
- Routes \`/index.php/api/register\`, \`/index.php/api/login\`, \`/index.php/api/posts\` will return errors
- Only \`/index.php/api/health\` works without DB
- Perfect for testing deployment and health check

### When DB is Connected
1. Use managed identity for connection (no plaintext passwords)
2. Configure Azure database firewall to allow only App Service
3. Enable SSL for MySQL/MariaDB connections
4. Use Azure Database for MySQL with Private Link

## 🔗 Resources

- [Azure App Service Security](https://learn.microsoft.com/en-us/azure/app-service/overview-security)
- [Managed Identities](https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
