# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview
This is a monorepo (pnpm workspaces + Turborepo) for **태자월드 (Thai Ja World)**, a Korean community platform. Key services:

| Service | Tech | Port | Run Command |
|---------|------|------|-------------|
| Backend API | FastAPI (Python 3.12) | 8000 | `source .venv/bin/activate && python -m uvicorn src.main:app --app-dir app/backend --reload --port 8000` |
| Web Frontend | Next.js 14 | 3000 | `pnpm --dir apps/web dev` |
| Socket Server | Socket.IO (TypeScript) | 3001 | `pnpm --dir apps/socket-server dev` |
| PostgreSQL 16 | Docker | 5432 | `docker compose -f docker-compose.dev.yml up -d postgres` |
| Redis 7 | Docker | 6379 | `docker compose -f docker-compose.dev.yml up -d redis` |

### Starting the dev environment
1. Start Docker daemon: `sudo dockerd &>/tmp/dockerd.log &` then `sudo chmod 666 /var/run/docker.sock`
2. Start DB services: `docker compose -f docker-compose.dev.yml up -d postgres redis`
3. Wait for healthy: `docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U taeja`
4. Start backend in a tmux session (activate `.venv` first)
5. Start web and socket-server via pnpm in separate tmux sessions
6. Or use the all-in-one: `pnpm dev:local` (requires all deps + activated venv)

### Environment files
- Root `.env` — loaded by backend (FastAPI) and docker-compose. Copy from `.env.example`.
- `apps/web/.env` — loaded by Next.js. Copy from `apps/web/.env.example`. Root `.env` is NOT auto-injected.
- `apps/socket-server/.env` — loaded by socket server. Copy from `apps/socket-server/.env.example`.
- For local dev (outside Docker), DB/Redis URLs should point to `localhost`.

### Build & Lint
- Build all: `pnpm run build` (runs Turborepo across workspaces)
- Build socket-server: `pnpm --dir apps/socket-server build`
- No ESLint config exists project-wide; only `apps/admin` has a lint script but ESLint is not installed.
- TypeScript checking happens during build.

### Gotchas
- The backend uses `create_all` on startup to auto-create DB tables. No Alembic migration run needed for dev.
- Login requires `email_verified=true`. For dev testing, use the internal endpoint: `POST /api/v1/auth/verify-email-internal` with `{"user_id": "<uuid>", "internal_secret": "<SECRET_KEY>"}`.
- Default admin account (`admin@taeja.local` / `admin1234`) is auto-seeded on first backend startup.
- The homepage (`/`) has a pre-existing webpack module error in dev mode. Auth pages (`/signup`, `/login`) render correctly.
- Socket.IO server doesn't respond to plain HTTP GET on port 3001; verify with: `curl "http://localhost:3001/socket.io/?transport=polling&EIO=4"`
- Python venv must be activated before running the backend outside Docker.
