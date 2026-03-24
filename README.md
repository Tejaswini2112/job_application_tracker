# Job Application Tracker (MVP)

Monorepo: **Express + Prisma + PostgreSQL** backend, **React (Vite)** frontend, **JWT** auth (`Authorization: Bearer`).

## Prerequisites

- Node.js LTS
- PostgreSQL running locally (or Docker) and a database created, e.g. `job_application_tracker`

## Setup

1. **Install dependencies (once, from repo root)**

   ```bash
   npm install
   ```

2. **Database**

   Create an empty database (e.g. `job_application_tracker`) and set `DATABASE_URL` in `backend/.env` (see `backend/.env.example`).

3. **Backend**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env`:

   - **`DATABASE_URL`** — must match your Postgres user, password, host, port, and database name.
   - **`JWT_SECRET`** — must be **at least 16 characters** (the app validates this; short values cause a startup error).
   - **`PORT`** — default `5000` (optional).

   Apply the schema and generate the Prisma client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

   For local development you can use `npx prisma migrate dev` instead of `deploy` if you prefer interactive migrations.

   Start the API:

   ```bash
   npm run dev
   ```

   Health check: `http://localhost:5000/health`  
   API base: `http://localhost:5000/api` (or your `PORT`).

4. **Frontend**

   From repo root, the `frontend` workspace is already installed. Start the UI:

   ```bash
   cd frontend
   npm run dev
   ```

   In development, **Vite proxies `/api`** to `http://localhost:5000`, so the default `VITE_API_URL` (`/api` in code) works without a `.env` file. Optional: create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api` if you change ports.

5. **Run both (from repo root)**

   ```bash
   npm run dev
   ```

   This starts the backend and frontend together (requires `concurrently` from the root install).

## Troubleshooting

| Problem | What to do |
|--------|------------|
| `npm install` fails at repo root | Ensure both `backend/package.json` and `frontend/package.json` exist (monorepo workspaces). Run `npm install` from the **root**, not only inside one folder, unless you only need one app. |
| Backend exits immediately / Zod error for `JWT_SECRET` | Set `JWT_SECRET` in `backend/.env` to a string **at least 16 characters** long. |
| `P1001` / can't reach database | Postgres must be running; `DATABASE_URL` host, port, user, password, and database name must be correct. |
| Prisma / migration errors | From `backend`, run `npx prisma migrate deploy` after `.env` is correct. If the DB is new and empty, this applies the SQL in `prisma/migrations`. |
| Frontend can’t reach API | Start the backend first. Use the same ports as in `vite.config.ts` proxy (`5000`) or set `VITE_API_URL` to your API base URL. |
| IDE errors on `@prisma/client` | After changing the schema, run `npx prisma generate` from `backend`. |

## Analytics: response rate

**Response rate** = (applications whose status is not `Applied`) / (total applications). If there are no applications, the rate is `0`.

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Bearer |
| GET | `/api/applications` | Bearer |
| POST | `/api/applications` | Bearer |
| PATCH | `/api/applications/:id` | Bearer |
| DELETE | `/api/applications/:id` | Bearer |
| GET | `/api/applications/:applicationId/notes` | Bearer |
| POST | `/api/applications/:applicationId/notes` | Bearer |
| PATCH | `/api/notes/:noteId` | Bearer |
| DELETE | `/api/notes/:noteId` | Bearer |
| GET | `/api/analytics/summary` | Bearer |
