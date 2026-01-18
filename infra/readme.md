# Infra | Draw-Arena

This folder provisions:
- an Azure Storage Account Static Website for the frontend (plain HTML/CSS/JS)
- an Azure Blob container for uploaded images
- an Azure App Service (Linux) for the PHP backend API
- an Azure Database for MySQL Flexible Server + database

## Prerequisites

- Terraform >= 1.14
- Azure CLI (`az`)
- Logged in Azure session (`az login`)
- MySQL client (`mysql`) for schema import (optional but recommended)

## Setup

1) Move into the infra folder.

```bash
cd infra
```

2) Provide the MySQL admin password (required, 8+ chars, 3 of 4 categories):

```bash
export TF_VAR_mysql_admin_password="change-me"
```

3) Initialize and apply the Terraform stack.

```bash
terraform init
terraform apply
```

4) After applying, note the outputs for later use:

```bash
terraform output
```

You'll need:
- `storage_account_name` for deploying the frontend
- `blob_container_name` for uploaded images
- `backend_app_name` for deploying the backend
- `backend_api_url` for configuring the frontend (includes `/api` on App Service Linux)
- `resource_group_name` for Azure CLI commands
- `mysql_server_fqdn` + `mysql_database_name` for DB initialization

## Deploy the frontend code

After the Storage Account exists, upload the `frontend` folder to the
`$web` container:

```bash
az storage blob upload-batch \\
  --destination '$web' \\
  --source ../frontend \\
  --account-name "$(terraform output -raw storage_account_name)" \\
  --auth-mode login \\
  --overwrite
```

Re-run the same command each time you update the frontend code.

## Link the frontend to the backend

The frontend reads its API base URL from `frontend/config.js`. After
Terraform applies, update the value to the backend API output before
uploading the frontend files:

```bash
terraform output -raw backend_api_url
```

Then set `window.API_BASE` in `frontend/config.js` to that URL.

By default, the backend only allows the static website origin for CORS.
If you need extra origins, set the `backend_allowed_origins` variable.

## Deploy the backend API

Deploy the PHP backend to the App Service (zip deployment):

```bash
cd ../backend
zip -r ../backend.zip . -x "*.git*" -x "readme.md"
cd ../infra
az webapp deploy \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --type zip \
  --src-path ../backend.zip
```

The backend App Service receives DB and Blob Storage settings directly from Terraform app settings.

## Initialize the database schema

Apply the schema from `database/init.sql` to the Azure MySQL database:

```bash
mysql \
  --host "$(terraform output -raw mysql_server_fqdn)" \
  --user "$(terraform output -raw mysql_admin_user)" \
  --password \
  --ssl-mode=REQUIRED \
  --database "$(terraform output -raw mysql_database_name)" \
  < ../database/init.sql
```

If you want to connect from your local machine, add a firewall rule in `mysql_firewall_rules`
or temporarily allow your IP in the Azure portal.

### Verify the backend is running

Check the health endpoint:

```bash
curl "$(terraform output -raw backend_api_url)/health"
# Expected: {"ok":true}
```

### Why two separate steps?

**1. Terraform creates the infrastructure** (`terraform apply`)
- Provisions the Storage Account on Azure
- Enables the Static Website feature
- Configures basic settings (name, region, etc.)
- **Does not manage application content**

**2. Azure CLI uploads the content** (`az storage blob upload-batch`)
- Deploys the HTML/CSS/JS files into the `$web` container
- Uploads only new/changed files
- **Does not modify infrastructure**

**Why not use Terraform to upload the site?**

Terraform is an Infrastructure as Code (IaC) tool:
- It manages cloud resources (create/modify/destroy)
- It's not designed to deploy application code
- Running `terraform apply` to update code would be inefficient and potentially risky

Use a deployment tool (like `az storage blob upload-batch`) for application content:
- Optimizes file transfer
- Allows fast updates without touching infrastructure

Analogy: Terraform builds the house; the Azure CLI moves in the furniture. You don't rebuild the house every time you change the curtains.


## Check the public URL

View your deployed frontend:

```bash
echo "Frontend: $(terraform output -raw static_website_url)"
echo "Backend:  $(terraform output -raw backend_api_url)"
```

## Complete deployment workflow

Here's the recommended order for deploying everything:

```bash
# 1. Deploy infrastructure
cd infra
terraform init
terraform apply

# 2. Initialize database schema
mysql \
  --host "$(terraform output -raw mysql_server_fqdn)" \
  --user "$(terraform output -raw mysql_admin_user)" \
  --password \
  --ssl-mode=REQUIRED \
  --database "$(terraform output -raw mysql_database_name)" \
  < ../database/init.sql

# 3. Deploy backend
cd ../backend
zip -r ../backend.zip . -x "*.git*" -x "readme.md"
cd ../infra
az webapp deploy \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --type zip \
  --src-path ../backend.zip

# 4. Verify backend health
curl "$(terraform output -raw backend_api_url)/health"

# 5. Update frontend config
cd ../frontend
# Edit config.js and set window.API_BASE to the backend_api_url output
echo "window.API_BASE = \"$(cd ../infra && terraform output -raw backend_api_url)\";" > config.js

# 6. Deploy frontend
cd ../infra
az storage blob upload-batch \
  --destination '$web' \
  --source ../frontend \
  --account-name "$(terraform output -raw storage_account_name)" \
  --auth-mode login \
  --overwrite

# 7. Open your app
open "$(terraform output -raw static_website_url)"
```

## Monitoring and logs

View logs from your backend App Service:

```bash
# Stream live logs
az webapp log tail \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)"

# Download logs
az webapp log download \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --name "$(terraform output -raw backend_app_name)" \
  --log-file backend-logs.zip
```
