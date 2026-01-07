# Draw-Arena - Azure Deployment Guide

## 🚀 Quick Deploy

```bash
# Deploy everything
./scripts/deploy.sh all

# Or step by step
./scripts/deploy.sh init      # Infrastructure only
./scripts/deploy.sh backend   # Backend only
./scripts/deploy.sh frontend  # Frontend only
```

## 📊 Verification

```bash
cd infra

# View all URLs
terraform output

# Test backend
curl "$(terraform output -raw backend_api_url)/health"
# ➜ {"ok":true}

# Open frontend
open "$(terraform output -raw static_website_url)"
```

## 🏥 Health Check Status

In the browser, you'll see the API status indicator:

- 🟢 **"API online"** → Everything works
- 🟡 **"API degraded"** → Abnormal response
- 🔴 **"API error (XXX)"** → HTTP error
- 🔴 **"API offline"** → No connection

## 🔐 Implemented Security

✅ HTTPS required  
✅ TLS 1.2 minimum  
✅ Restrictive CORS with `ALLOWED_ORIGINS`  
✅ FTPS disabled  
✅ HTTP/2 enabled  
✅ Managed identity (for future DB)  
✅ Diagnostic logs (7 days)  
✅ Automatic health check (5 min)

## 📁 File Structure

```
Draw-Arena/
├── backend/          → PHP API
│   └── index.php     → Routes + secure CORS
├── frontend/         → HTML/CSS/JS
│   ├── app.js        → Improved health check
│   └── config.js     → API URL (auto-generated)
├── infra/            → Terraform
│   ├── main.tf       → App Service + Storage
│   ├── variables.tf  → Configuration
│   ├── outputs.tf    → URLs + identities
│   ├── readme.md     → Complete guide
│   └── SECURITY.md   → Security documentation
├── .github/workflows/ → CI/CD pipelines
│   ├── deploy_frontend.yml
│   ├── deploy_backend.yml
│   └── deploy_all.yml
└── scripts/
    └── deploy.sh     → Automated deployment
```

## 🔧 Useful Commands

```bash
# Live logs
az webapp log tail \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)"

# Download logs
az webapp log download \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --log-file backend-logs.zip

# Restart backend
az webapp restart \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)"
```

## 📝 Important Notes

### Without DB for now
- ✅ `/index.php/api/health` works
- ❌ `/index.php/api/register`, `/index.php/api/login`, `/index.php/api/posts` → error (need DB)

### When adding DB
```bash
az webapp config appsettings set \
  --resource-group "$(cd infra && terraform output -raw resource_group_name)" \
  --name "$(cd infra && terraform output -raw backend_app_name)" \
  --settings \
    DB_HOST=<azure-db-host> \
    DB_NAME=drawarena \
    DB_USER=<user> \
    DB_PASS=<password>
```

## 🎯 CI/CD Workflows

### GitHub Actions
Three workflows are available:

1. **Deploy Frontend** (`.github/workflows/deploy_static_website.yml`)
   - Triggers on frontend changes or tags
   - Configures and uploads to Azure Storage

2. **Deploy Backend** (`.github/workflows/deploy_backend.yml`)
   - Triggers on backend changes or tags
   - Creates zip and deploys to App Service
   - Runs health check

3. **Deploy All** (`.github/workflows/deploy_all.yml`)
   - Manual workflow with Terraform option
   - Deploys infrastructure → backend → frontend
   - Complete deployment pipeline

### Required Secrets
Configure in GitHub repository settings:
- `AZURE_CREDENTIALS`: Service principal credentials
  ```json
  {
    "clientId": "<GUID>",
    "clientSecret": "<STRING>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>"
  }
  ```

### Terraform State
Make sure to configure remote state (Azure Storage, Terraform Cloud, etc.) for production use.

## 🆘 Troubleshooting

**Health check fails?**
```bash
# Check if app is started
az webapp show \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --query "state"
```

**CORS not working?**
```bash
# Check ALLOWED_ORIGINS
az webapp config appsettings list \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --query "[?name=='ALLOWED_ORIGINS']"
```

**Frontend can't find API?**
```bash
# Check config.js
cat frontend/config.js
# Should contain: window.API_BASE = "https://...azurewebsites.net/index.php/api"
```

## 📚 Documentation

- [infra/readme.md](infra/readme.md) → Detailed installation guide
- [infra/SECURITY.md](infra/SECURITY.md) → Security and best practices

## 🔗 Resources

- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
