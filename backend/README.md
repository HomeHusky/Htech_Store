# Htech Store Backend

FastAPI + LangGraph backend with PostgreSQL hybrid search (pgvector + full-text + RRF).

## Environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/dbname
GEMINI_API_KEY=your_key
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EMBEDDING_DIMENSION=768
HYBRID_RRF_K=60
HYBRID_LIMIT=8
```

Use one shared `DATABASE_URL` for relational and vector workloads.

## Install and run

```bash
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Keep Supabase active

If you use a Supabase project that can go idle, run the keepalive script every 5 days so the database receives a real query:

```powershell
cd backend
\keep_supabase_alive.ps1
```

Recommended Task Scheduler trigger:

```text
Program/script: powershell.exe
Arguments: -ExecutionPolicy Bypass -File D:\AI\Sale_Agent\Htech_Store\backend\keep_supabase_alive.ps1
Trigger: Every 5 days
```

## Key modules

- `app/models/models.py`: SQLAlchemy schema including `embedding` and `search_vector`.
- `alembic/versions/20260426_0001_init_hybrid_search.py`: migration with pgvector, GIN indexes, and triggers.
- `app/services/hybrid_search.py`: semantic + keyword + RRF ranking.
- `app/services/agent_runtime.py`: LangGraph session flow and tool routing.
