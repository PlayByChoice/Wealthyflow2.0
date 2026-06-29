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

## Configuration

Use the included example environment file as a starting point:

- `.env.example`

### GitHub Actions and Production setup

1. Set repository variable `AZURE_WEBAPP_NAME`.
2. Set repository secret `AZURE_WEBAPP_PUBLISH_PROFILE`.
3. Keep the `Production` environment configured in GitHub with any required protection rules.
4. Enable deployment by setting `AZURE_WEBAPP_DEPLOY_ENABLED` to `'true'` in:
   - `.github/workflows/azure-webapps-node.yml`

### CI behavior

- The workflow runs on pushes to `main`, pull requests targeting `main`, and manual dispatch.
- Deployment runs only on push events when deployment is fully configured and enabled.
