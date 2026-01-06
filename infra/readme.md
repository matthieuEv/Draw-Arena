# Infra | Draw-Arena

This folder provisions an Azure Storage Account Static Website for the
frontend (plain HTML/CSS/JS). Nginx is not used in Azure; the static
website endpoint serves the files directly.

## Prerequisites

- Terraform >= 1.14
- Azure CLI (`az`)
- Logged in Azure session (`az login`)

## Setup

1) Move into the infra folder.

```bash
cd infra
```

1) Initialize and apply the Terraform stack.

```bash
terraform init
terraform apply
```

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

```bash
echo "$(terraform output -raw static_website_url)"
```
