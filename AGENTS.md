# AGENTS.md

## Development Commands

### Start full stack (recommended)
```bash
cd infra && podman-compose up
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432 (user: salon, password: salon123, db: salon_db)
- Redis: localhost:6379

### Run backend locally (without containers)
```bash
cd backend && pip install -r requirements.txt
# Requires DATABASE_URL and REDIS_URL env vars set
uvicorn app.main:app --reload --port 8000
```

### Run frontend locally
```bash
cd frontend && npm install
npm run dev
```

## Architecture

- **Backend**: FastAPI with SQLAlchemy, located in `backend/app/`
- **Frontend**: React + Vite + Tailwind, located in `frontend/src/`
- **Entrypoint**: `backend/app/main.py`
- **DB Models**: `backend/app/models/`
- **API Routes**: `backend/app/routers/`
- **Schemas**: `backend/app/schemas/`

## Container Files

- Backend: `backend/Containerfile` (dev) and `backend/Containerfile.prod`
- Frontend: `frontend/Containerfile` (dev) and `frontend/Containerfile.prod`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `DEBUG`: Set to `True` for development
- `SECRET_KEY`: Required for production

## Notes

- No Alembic migrations configured yet (check `backend/migrations/` if present)
- Uses `podman` (rootless containers), not Docker
- Vite dev server runs on port 3000, not the usual 5173
