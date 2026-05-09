# H-TECH Store: AI-Powered Sales Agent for E-Commerce

> Multi-LLM Retail Sales Agent with Hybrid Search, RAG, and LangGraph Orchestration

## Overview

H-TECH is a full-stack e-commerce platform for electronics retail (laptops, PCs, smartphones, tablets, accessories) with an integrated **AI Sales Concierge** that leverages:

- **LangGraph State Machine** — Intent routing and multi-tool orchestration
- **Hybrid Search** — Semantic (vector) + keyword search for products and policies
- **Multi-LLM Support** — Google Gemini, OpenAI (GitHub Models, Azure), Phi-4, local Ollama
- **RAG (Retrieval-Augmented Generation)** — Vector store for store policies and product catalogs
- **Admin Dashboard** — Runtime AI configuration (provider/model selection, system prompts)

---

## Architecture

### Backend Stack
```
FastAPI + SQLAlchemy + PostgreSQL + pgvector + LangGraph + LangChain
```

**Key Services:**

| Service | Purpose |
|---------|---------|
| `agent_runtime.py` | LangGraph state machine for intent detection and tool routing |
| `chat_models.py` | Multi-provider LLM abstraction (Gemini, OpenAI, Phi-4, Ollama) |
| `embeddings.py` | Vector embedding clients (Gemini, OpenAI, Ollama) |
| `hybrid_search.py` | Reciprocal Rank Fusion (RRF) combining semantic + keyword search |
| `policy_vector_store.py` | LangChain PGVector store for store policies |
| `system_prompt.py` | Dynamic system prompt builder with admin overrides |
| `booking.py` | Order/booking management with deposit tracking |
| `vouchers.py` | Voucher verification and discount application |
| `admin_service.py` | AI settings CRUD (provider, model, prompts) |

### Frontend Stack
```
Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
```

**Design System:** Minimal (black/white/gray tone)

**Key Components:**
- `ai-chat-bubble.tsx` — Floating chat interface for AI sales concierge
- `product-card.tsx` — Grid card with specs, pricing, add-to-cart
- `site-header.tsx` — Navigation with mega menu, search, cart
- `category-hub.tsx` — Product collections by category

---

## AI Features

### 1. Intent Detection & Routing

Incoming messages are classified into:

```
├─ query_policy_rag
│  └─ Vector search + RAG answer for store policies (VAT, deposit, warranty, etc.)
├─ search_catalog
│  └─ Hybrid search for products + LLM synthesis
├─ verify_voucher
│  └─ Validate discount codes
├─ manage_booking
│  └─ Order creation with deposit calculation
└─ human_support
   └─ Escalate to Telegram support
```

### 2. Hybrid Search (RRF)

Combines semantic and keyword search:

```sql
-- Semantic: Vector distance (<=>)
-- Keyword: Full-text search (@@)
-- Fusion: Reciprocal Rank Fusion with weight k=60
SELECT ... FROM products
WHERE embedding <=> query_vector UNION
  ... AND search_vector @@ websearch_to_tsquery(query)
ORDER BY (1.0/(60+semantic_rank) + 1.0/(60+keyword_rank)) DESC
```

**Supports:**
- Category filtering
- Pagination
- Ranking by composite score

### 3. Policy RAG

Store policies (VAT, payment, warranty, delivery) are:
- Chunked by markdown headers + recursive splitting (1000 chars, 200 overlap)
- Embedded and stored in PGVector
- Retrieved via hybrid search
- Passed as context to LLM for Q&A

### 4. Multi-LLM Support

**Providers & Models:**

```python
# Google Gemini (free tier available)
Provider: "gemini"
Models: gemini-2.0-flash, gemini-2.5-flash, gemini-2.5-pro
Embedding: gemini-embedding-001, gemini-embedding-2

# OpenAI (+ GitHub Models PAT compatibility)
Provider: "openai"
Models: gpt-4o-mini, gpt-4o, gpt-4.1-mini
Embedding: text-embedding-3-small, text-embedding-3-large
Base URL: https://models.inference.ai.azure.com (GitHub PAT)

# Microsoft Phi-4 (Azure Models)
Provider: "phi4"
Models: phi-4, phi-4-reasoning
Base URL: https://models.inference.ai.azure.com

# Local Ollama (self-hosted)
Provider: "ollama"
Models: qwen2.5, llama3.2, (auto-detected from /api/tags)
Base URL: http://localhost:11434
```

**Runtime Selection:** Admin dashboard allows switching providers/models without code changes.

### 5. System Prompt Builder

Base system prompt + dynamic language hints:

```
"You are the AI sales concierge for Htech Store.
Role: Help customers choose laptops, PCs, mobile devices, and accessories.
Rules:
- Be tech-savvy, concise, sales-focused.
- Never invent prices/policies.
- Only use provided context.
- Summarize next steps (deposit, reservation) to close sales."
```

Admin can override via database.

---

## Database Schema

### Core Tables

```sql
-- Products with hybrid search
CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  slug VARCHAR UNIQUE,
  name JSONB (en/vi),
  category ENUM (laptop, pc, smartphone, tablet),
  price INTEGER,
  image VARCHAR,
  embedding vector(768),        -- pgvector
  search_vector tsvector,       -- Full-text search
  specs JSONB,
  details JSONB,
  available BOOLEAN,
  stock INTEGER,
  discount INTEGER,
  rating DECIMAL,
  ...
);

-- Store Policies (for RAG)
CREATE TABLE store_policies (
  id VARCHAR PRIMARY KEY,
  title VARCHAR,
  content TEXT (markdown),
  category VARCHAR,
  embedding vector(768),
  created_at TIMESTAMP,
  ...
);

-- Orders & Bookings
CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  customer_id VARCHAR,
  status ENUM (AWAITING_DEPOSIT, PAID, SERVICE_ONGOING, COMPLETED, CANCELLED),
  total_amount INTEGER,
  deposit_amount INTEGER,
  voucher_id VARCHAR,
  created_at TIMESTAMP,
  ...
);

-- AI Settings (admin-configurable)
CREATE TABLE ai_settings (
  id INTEGER PRIMARY KEY,
  chat_provider VARCHAR,        -- gemini | openai | phi4 | ollama
  chat_model VARCHAR,
  embedding_provider VARCHAR,
  embedding_model VARCHAR,
  system_prompt TEXT,
  updated_at TIMESTAMP,
  ...
);

-- Chat History
CREATE TABLE chat_history (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR,
  message TEXT,
  response TEXT,
  tool_used VARCHAR,
  payload JSONB,
  metadata JSONB,
  created_at TIMESTAMP,
  ...
);
```

---

## API Endpoints

### Chat (AI Agent)
```
POST /api/chat
{
  "session_id": "user-123",
  "message": "Recommend a laptop under 20 million dong",
  "locale": "vi"
}

Response:
{
  "session_id": "user-123",
  "answer": "I recommend the [product name] - specifications, price, next steps",
  "tool": "search_catalog",
  "payload": {
    "products": [...]
  },
  "debug": {
    "search_results": [...]
  },
  "created_at": "2026-05-09T..."
}
```

### Products
```
GET /api/products                        -- List all
GET /api/products/{id}                   -- Detail
POST /api/products                       -- Create (admin)
PATCH /api/products/{id}                 -- Update (admin)

Query Parameters:
  ?category=laptop
  ?skip=0&limit=20
  ?sort=price&order=asc
```

### Orders/Bookings
```
POST /api/orders                         -- Create order
GET /api/orders/{id}                     -- Get order details
PATCH /api/orders/{id}/status            -- Update status
POST /api/orders/{id}/payment            -- Record payment
```

### Admin: AI Settings
```
GET /api/admin/ai-settings               -- Fetch current config
PUT /api/admin/ai-settings               -- Update provider/model
GET /api/admin/models                    -- List available models
POST /api/admin/sync-policies            -- Re-embed policies
```

### Vouchers
```
POST /api/vouchers/verify
{
  "code": "SAVE20"
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/htech_db

# LLMs & Embeddings
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-key-or-github-pat
OPENAI_TEXT_EMBED_3_SMALL=your-embed-key-optional
PHI4_API_KEY=your-phi4-key
PHI4_REASONING_API_KEY=your-phi4-reasoning-key
OLLAMA_BASE_URL=http://localhost:11434

# Support Notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# CORS
CORS_ORIGINS=http://localhost:3000,https://htech.store

# Search
EMBEDDING_DIMENSION=768
HYBRID_RRF_K=60
HYBRID_LIMIT=8

# Security
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# App
APP_ENV=development
APP_DEBUG=true
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## Running the Project

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+ (with pgvector extension)
- Git

### Quick Start

**1. Backend Setup**
```bash
cd backend

# Create & activate venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed data (optional)
python seed_htech.py

# Start server
python run_app.py
# Runs on http://localhost:8000
```

**2. Frontend Setup**
```bash
cd frontend_v2

# Install dependencies
pnpm install

# Start dev server
pnpm dev
# Runs on http://localhost:3000
```

**3. Database Setup**
```bash
# Create extension
psql -U postgres -d htech_db -c "CREATE EXTENSION IF NOT EXISTS pgvector"

# Run migrations (automatic via alembic)
alembic upgrade head
```

---

## Development Workflow

### Adding a New Tool to Agent

1. **Create handler** in `app/services/your_tool.py`:
   ```python
   def handle_your_tool(db: Session, payload: dict) -> dict:
       # Implementation
       return {"result": "..."}
   ```

2. **Update intent detector** in `agent_runtime.py`:
   ```python
   def _detect_intent(message: str) -> str:
       if "keyword" in text:
           return "your_tool"
   ```

3. **Add tool node** in graph builder:
   ```python
   async def your_tool_node(state: AgentState) -> AgentState:
       result = handle_your_tool(db, state["payload"])
       return {"answer": result}
   ```

### Switching LLM Provider

**Option 1:** Via Admin Dashboard
- Navigate to `/admin` → AI Settings
- Select Provider (Gemini, OpenAI, Phi-4, Ollama)
- Choose Model from dropdown
- Click Save

**Option 2:** Environment Variables
```bash
# .env
CHAT_PROVIDER=openai
CHAT_MODEL=gpt-4o-mini
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

### Fine-tuning System Prompt

Admin dashboard → AI Settings → Edit System Prompt

Example overrides:
```
"You are the Htech Store AI. 
Focus on [specific market segment].
Always mention [promotion].
..."
```

---

## Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Heroku / Railway (Backend)
```bash
# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set GEMINI_API_KEY=...

# Deploy
git push heroku main
```

### Docker (Full Stack)
```dockerfile
# Backend
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run_app.py"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## Testing

### Backend
```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=app tests/
```

### Frontend
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

---

## Performance & Scaling

### Search Optimization
- Indexes on `products.embedding`, `products.search_vector`, `products.category`
- Hybrid search with RRF balances semantic + keyword accuracy
- Configurable `HYBRID_LIMIT` (default 8) and `HYBRID_RRF_K` (default 60)

### LLM Response Time
- **Gemini 2.0 Flash**: ~500ms (fast, free tier)
- **OpenAI GPT-4o Mini**: ~300ms (paid)
- **Ollama local**: ~1-5s (free, no API calls)

### Caching
- LLM embedding clients cached via `@lru_cache`
- Policy vector store singleton
- Chat history stored for context

---

## Troubleshooting

### "No module named 'pydantic_core._pydantic_core'"
```bash
pip install --upgrade --force-reinstall pydantic pydantic-core
```

### "pgvector extension not found"
```sql
CREATE EXTENSION IF NOT EXISTS pgvector;
```

### "CORS error" between frontend and backend
```bash
# Check CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

### Ollama timeout
```bash
# Ensure Ollama is running
ollama serve

# Or check base URL
OLLAMA_BASE_URL=http://localhost:11434
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

Apache 2.0

---

## Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, SQLAlchemy, LangGraph, LangChain |
| Database | PostgreSQL 14+, pgvector, LangChain PGVector |
| LLMs | Gemini, OpenAI, Phi-4, Ollama |
| Search | Hybrid (Vector + Full-text), RRF Fusion |
| Auth | JWT (HMAC-256) |
| Deployment | Docker, Vercel (frontend), Heroku/Railway (backend) |

---

**Last Updated**: May 9, 2026  
**Current Version**: 1.0.0-alpha

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Htech_Store** (2366 symbols, 3849 relationships, 25 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Htech_Store/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Htech_Store/clusters` | All functional areas |
| `gitnexus://repo/Htech_Store/processes` | All execution flows |
| `gitnexus://repo/Htech_Store/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
