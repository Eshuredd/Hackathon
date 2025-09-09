# Grocery Scout – AI-Powered Smart Grocery Assistant

A multi-agent system that parses natural-language shopping requests, compares prices across providers, and builds the optimal cart for checkout.

## Team

- Team name: Grocery Scout Team
- Members: Alice Smith, Bob Lee, Carol Nguyen

## Hackathon Theme / Challenge

- Theme: AI-Powered Consumer Solutions
- Challenge: Smart Shopping Assistant

## What We Built

- Natural-language to cart: Users type requests like "2kg rice and 3L milk from Instamart" and the system extracts items, quantities, and preferred provider.
- Deal scouting: Agents compare prices across supported providers and recommend the most cost-effective options.
- Cart builder and executor: Builds a ready-to-checkout cart for the chosen provider.
- Dashboard UI: A Next.js frontend with authentication, saved lists, recent searches, and comparison views.

## How to Run

Follow the steps below. These are Windows-friendly and mirror the detailed guide further down this file.

### Backend (FastAPI + Celery)

1. Create venv and install deps

```powershell
cd backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Configure env

Create `backend/.env` (see sample at `backend/README` section below or `env.example`), including:

- `DATABASE_URL` (defaults to SQLite)
- `REDIS_URL` and `BROKER_URL` (Redis)
- `OPENAI_API_KEY`
- Descope keys if using auth in backend

3. Start Redis

Ensure a local Redis server is running and listening on `localhost:6379`.

4. Run API

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

5. (Optional) Start Celery worker

```powershell
celery -A app.celery_app.celery_app worker -l info
```

### Frontend (Next.js)

1. Install deps

```powershell
cd ..\frontend
npm install
```

2. Configure env

Create `frontend/.env.local` containing:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- `NEXT_PUBLIC_DESCOPE_PROJECT_ID`, `NEXT_PUBLIC_DESCOPE_BASE_URL`

3. Start dev server

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Environment files

### Backend `.env`

```env
# Environment Configuration
ENV=development

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
TOKEN_ISSUER=grocery-scout-backend
TOKEN_ALGORITHM=HS256

# Database Configuration
DATABASE_URL=sqlite:///./grocery_scout.db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
BROKER_URL=redis://localhost:6379/1

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123

# Descope Authentication
DESCOPE_PROJECT_ID=your-descope-project-id
DESCOPE_MANAGEMENT_KEY=your-descope-management-key
DESCOPE_PUBLIC_KEY=your-descope-public-key

OPENAI_API_KEY=your-openai-api-key

# Frontend CORS Origins
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

Place this file at `backend/.env`.

### Frontend `.env.local`

```env
# Required: your Descope project ID (from Descope Console → Getting Started)
NEXT_PUBLIC_DESCOPE_PROJECT_ID=your-descope-project-id

# Optional: set only if you use a custom Descope base URL
# Default is https://api.descope.com
NEXT_PUBLIC_DESCOPE_BASE_URL=https://api.descope.com

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Place this file at `frontend/.env.local`.

## Tech Stack

- Backend: FastAPI, Celery, Redis, SQLite (default), SQLAlchemy
- AI/Agents: OpenAI, LangGraph/LangChain-style orchestration (multi-agent flow)
- Auth: Descope (frontend SDK, optional backend verification)
- Frontend: Next.js (React, TypeScript), Tailwind CSS, Radix UI
- Infra/Dev: npm, Python 3.11+

## Demo Video

- Demo video coming soon! We'll add the link once it's ready.

## With More Time

- Expand provider integrations and real checkout flows.
- Add smarter substitution logic when items are unavailable.
- Improve entity extraction with few-shot and structured output.
- Add budgets, dietary preferences, and multi-user shared lists.
- Strengthen observability and tracing for agent steps.

---

## Additional setup notes

- API docs: `http://localhost:8000/docs`
- Ensure Redis is running locally at `localhost:6379` before starting Celery.
- Sample environment variables are shown above; see `env.example` for more.

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

## 5) Useful backend commands

```powershell
# Lint/tests (if configured)
pytest -q
```

## 6) Troubleshooting

- Port already in use:
  - Backend: change `--port` or stop the conflicting process.
  - Frontend: it will prompt for another port or run `set PORT=3001 && npm run dev`.
- CORS errors: ensure `FRONTEND_ORIGINS` in backend `.env` includes your frontend origin.
- Redis connection errors: confirm Redis is running on `localhost:6379`.
- Descope: verify `NEXT_PUBLIC_DESCOPE_PROJECT_ID` and (optional) backend Descope keys.
- OpenAI: set a valid `OPENAI_API_KEY` in `backend/.env`.

## 7) Project structure (high level)

- `backend/`: FastAPI app (`app/`), Celery worker, SQLite DB by default
- `frontend/`: Next.js app

That’s it—after completing steps 1–3, you should have both API and UI running locally.
