# Frontend | Draw-Arena
## Connexion au serveur Azure Static Web

Pour lister les fichiers hébergés sur Azure Storage Account :

```bash
# Se connecter à Azure
az login

# Lister les fichiers du conteneur $web (site statique)
az storage blob list \
  --account-name $(terraform output -raw storage_account_name) \
  --container-name '$web' \
  --output table \
  --auth-mode login
```
