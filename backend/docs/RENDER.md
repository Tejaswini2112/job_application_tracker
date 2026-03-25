# Deploy the API on Render

## 1. Create a PostgreSQL database

In the Render dashboard: **New** → **PostgreSQL**. Note the **Internal Database URL** (recommended if the web service runs in the same account/region).

## 2. Create a Web Service (Node)

- **Root directory:** `backend` (if the repo is monorepo) or repository root if backend-only.
- **Runtime:** Node
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`

This runs `prisma migrate deploy` then `node dist/server.js`.

## 3. Environment variables

| Key | Required | Notes |
|-----|----------|--------|
| `DATABASE_URL` | Yes | From Render Postgres (often **Internal** URL for the API service). |
| `JWT_SECRET` | Yes | Long random string (≥ 16 characters). |
| `FRONTEND_ORIGIN` | Yes* | Your static site origin(s), comma-separated. *Required when `NODE_ENV` is `production` (Render sets this automatically). |
| `PORT` | No | Render sets `PORT`; do not override unless you know Render’s layout. |
| `HOST` | No | Defaults to `0.0.0.0` so the service accepts external traffic. |

## 4. Frontend

Build your Vite app with `VITE_API_URL=https://<your-render-service>.onrender.com/api` (your API’s public URL).

Set `FRONTEND_ORIGIN` on the API to that frontend URL (exact scheme + host, no trailing path).

## 5. Health check

Use path `/health` if you configure a Render health check.
