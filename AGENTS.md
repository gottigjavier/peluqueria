# AGENTS.md - Pelu-Francis Salon

## 🤖 Agent Profile

**Role:** Senior Full Stack Developer
**Focus:** Salon management application with FastAPI backend and React frontend.

## 🏗 Tech Stack & Tooling

- **Backend Runtime:** Python 3.11+ with FastAPI 0.110+
- **Package Manager:** `uv` (recommended), fallback to `pip`
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Database:** PostgreSQL 15+ with SQLAlchemy 2.0 + Alembic migrations
- **Cache:** Redis 7+
- **Container:** Podman (rootless), Podman Compose

## 📜 Coding Standards

### Backend (Python)
- **Style:** Ruff for linting and formatting
- **Typing:** Strict type hints mandatory (Pydantic models, function signatures)
- **Validation:** Use Pydantic v2 schemas, never trust raw input
- **Error Handling:** Custom exceptions in `app/core/exceptions.py`, HTTPException for API errors
- **Docstrings:** Google style for all public functions

### Frontend (React)
- **Style:** ESLint + Prettier (if configured)
- **Typing:** TypeScript strict mode
- **State:** React hooks, avoid prop drilling beyond 2 levels

## 🚀 Quick Start

### Full stack (recommended)
```bash
cd infra && podman-compose up
```
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Backend (local dev)
```bash
cd backend
uv sync  # or: pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (local dev)
```bash
cd frontend && bun install  # or npm install
bun run dev                # or npm run dev
```

## 🏛 Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI entrypoint
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   └── exceptions.py    # Custom exceptions
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic
│   └── utils/               # Helpers (timezone, etc.)
├── alembic/                  # DB migrations
└── Containerfile*

frontend/
├── src/
│   ├── components/          # React components
│   ├── pages/               # Route pages
│   ├── api/                 # API client hooks
│   └── App.tsx
└── Containerfile*
```

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `DEBUG` | Dev | Enable debug mode (default: True) |
| `SECRET_KEY` | Prod | JWT signing key (min 32 chars) |

**Security:** Never commit `.env` files. Use `.env.example` as template.

## 🐳 Container Strategy

- **Dev:** `Containerfile` (mounts source for hot reload)
- **Prod:** `Containerfile.prod` (multi-stage build, non-root user)
- All containers: Podman rootless, no Docker dependency

## 🔄 Workflow & Git

- **VCS:** Jujutsu (jj) preferred, jj git for remote sync
  - `jj describe -m "message"` - Describe local changes
  - `jj new` - Create new change
  - `jj bookmark set main -r @` - Sync with remote main before push
- **Commit Format:** [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Branch Strategy:** Trunk-based (feature branches from `main`)
- **Migrations:** Always create with Alembic before schema changes

## 🚨 Security Best Practices

- Validate all inputs via Pydantic schemas
- Never expose `SECRET_KEY` or credentials in logs
- Use parameterized queries (SQLAlchemy handles this)
- CORS restricted to known origins in production
- JWT tokens with short expiration (15-60 min)

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend type check
cd frontend && npm run typecheck
```