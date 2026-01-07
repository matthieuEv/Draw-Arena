# Backend | Draw-Arena

## Viewing Logs

To view the current App Service logs for the backend from your local machine, use the Azure CLI:

```bash
az webapp log tail --name draw-arena-backend-app --resource-group draw-arena-rg
```

This streams the live logs from the `draw-arena-backend-app` App Service.
