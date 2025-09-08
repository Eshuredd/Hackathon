# Smart Grocery – Full Setup Guide (Windows friendly)

This guide takes you from cloning the repo to running the full product (backend + frontend). It includes environment setup, commands, and common troubleshooting.

## Prerequisites

- Git
- Python 3.11+
- Node.js 18+ and npm
- Docker Desktop (only if you want Redis via Docker or the Docker quickstart)

## 1) Clone the repository

```bash
git clone https://github.com/<your-org-or-user>/<your-repo>.git
cd Hackathon
```

## 2) Backend setup (FastAPI + Celery)

All commands below are run from the `backend/` directory unless noted.

### 2.1 Create and activate virtualenv (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

### 2.2 Install dependencies

```powershell
pip install -r requirements.txt
```

### 2.3 Create `.env` and configure

Create `backend/.env` with the values you shared (edit keys as needed):

```env
ENV=development

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
TOKEN_ISSUER=grocery-scout-backend
TOKEN_ALGORITHM=HS256

# Database Configuration
DATABASE_URL=sqlite:///./grocery_scout.db

# Redis / Celery
REDIS_URL=redis://localhost:6379/0
BROKER_URL=redis://localhost:6379/1

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123

# Descope Authentication
DESCOPE_PROJECT_ID=P3214q4orBBo09emfASGJrh90szB
DESCOPE_MANAGEMENT_KEY=
DESCOPE_PUBLIC_KEY=

OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Frontend CORS Origins
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

### 2.4 Start Redis (option A: Docker)

```powershell
docker run -d --name redis -p 6379:6379 redis:7
```

Option B: Use your local Redis if already installed and listening on `localhost:6379`.

### 2.5 Run the API

```powershell
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### 2.6 (Optional) Run the Celery worker (new terminal)

```powershell
cd backend
. .venv\Scripts\Activate.ps1
celery -A app.celery_app.celery_app worker -l info
```

## 3) Frontend setup (Next.js/React)

All commands below are run from the `frontend/` directory.

### 3.1 Install dependencies

```powershell
cd ..\frontend
npm install
```

### 3.2 Create `.env.local`

Create `frontend/.env.local` with your values:

```env
# Descope
NEXT_PUBLIC_DESCOPE_PROJECT_ID=P3214q4orBBo09emfASGJrh90szB
NEXT_PUBLIC_DESCOPE_BASE_URL=https://api.descope.com

# Backend API base
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3.3 Run the frontend (dev)

```powershell
npm run dev
```

Default dev URL: `http://localhost:3000`

## 4) End‑to‑end sanity checks

- Open the frontend at `http://localhost:3000`.
- Try the natural‑language add to cart box, e.g.:
  - `2 kg of rice and 3 liters of milk from instamart`
- The backend parser returns the platform with items, and the UI shows popups if items or the selected platform are unavailable.

You can also call the backend directly:

```powershell
curl -X POST http://localhost:8000/grocery/cart/parse-add ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: demo" ^
  -d "{\"text\":\"2 kg rice and 3 liters milk from instamart\"}"
```

## 5) Docker quickstart (optional)

If you prefer Docker Compose for everything, see `README-Docker.md`. Minimal flow:

```powershell
# From repo root
copy env.example .env  # update if needed
docker-compose up -d --build
```

- Frontend: `http://localhost:3000` (or `5173` for dev profile)
- Backend: `http://localhost:8000`

## 6) Useful backend commands

```powershell
# Lint/tests (if configured)
pytest -q

# Start only Redis via Docker
docker start redis

# Stop services
docker stop redis
```

## 7) Troubleshooting

- Port already in use:
  - Backend: change `--port` or stop the conflicting process.
  - Frontend: it will prompt for another port or run `set PORT=3001 && npm run dev`.
- CORS errors: ensure `FRONTEND_ORIGINS` in backend `.env` includes your frontend origin.
- Redis connection errors: confirm Redis is running on `localhost:6379`.
- Descope: verify `NEXT_PUBLIC_DESCOPE_PROJECT_ID` and (optional) backend Descope keys.
- OpenAI: set a valid `OPENAI_API_KEY` in `backend/.env`.

## 8) Project structure (high level)

- `backend/`: FastAPI app (`app/`), Celery worker, SQLite DB by default
- `frontend/`: Next.js app
- `README-Docker.md`: Full Docker Compose workflow

That’s it—after completing steps 1–3, you should have both API and UI running locally.
