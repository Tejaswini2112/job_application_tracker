# Deploy the frontend on Vercel

## 1. Connect the repo

Import the Git repository. If the monorepo root contains both apps, set:

- **Root Directory:** `frontend`

## 2. Build settings

| Setting | Value |
|---------|--------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` (default) |

## 3. Environment variable

Add **`VITE_API_URL`** with your **deployed API origin** (no path), e.g.:

`https://your-backend.onrender.com`

The app resolves requests to `{VITE_API_URL}/api/...`.  
Your backend must allow this site’s origin in **`FRONTEND_ORIGIN`** (CORS).

> Vite inlines `VITE_*` at **build** time. Redeploy the frontend when the API URL changes.

## 4. Local development

Leave **`VITE_API_URL`** unset and run **`npm run dev`** — requests use `/api` and the Vite proxy sends them to `http://localhost:5000`.

## 5. Verify

After deploy, open the Vercel URL, register/login, and confirm network calls hit your production API domain.
