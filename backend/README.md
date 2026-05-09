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

## Key modules

- `app/models/models.py`: SQLAlchemy schema including `embedding` and `search_vector`.
- `alembic/versions/20260426_0001_init_hybrid_search.py`: migration with pgvector, GIN indexes, and triggers.
- `app/services/hybrid_search.py`: semantic + keyword + RRF ranking.
- `app/services/agent_runtime.py`: LangGraph session flow and tool routing.
