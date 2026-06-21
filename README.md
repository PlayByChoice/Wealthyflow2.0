# Wealthflows

Wealthflows is a crypto wallet and trading-focused project intended to help users track markets and make more informed investing decisions.

## Project status

This repository is currently in an early stage and contains deployment workflow configuration plus core project documentation.

## Deployment

This repo includes a GitHub Actions workflow for Azure Web App deployment:

- Workflow file: `.github/workflows/azure-webapps-node.yml`
- Target environment: `Production`
- Deployment requires:
  - `AZURE_WEBAPP_NAME` repository variable
  - `AZURE_WEBAPP_PUBLISH_PROFILE` repository secret

If those values are not configured, deployment steps are skipped safely.
