# Wealthflows
A crypto wallet and financing trading when to buy in app live market data for future investing 

## Web app scaffold

A Next.js app is scaffolded in `/web` with a basic authentication flow.

### Run locally

```bash
cd web
cp env.example .env.local
npm install
npm run dev
```

### Database-backed login

Auth now uses a local SQLite database (`web/data/wealthyflow.db` by default).

Use the credentials in `.env.local` (`AUTH_ADMIN_USERNAME` and `AUTH_ADMIN_PASSWORD`) for the initial seeded admin user.

You can change DB location with `DATABASE_PATH`.
