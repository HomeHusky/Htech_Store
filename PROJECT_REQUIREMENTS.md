# H-TECH Project Reconstruction Requirements

Complete specification for rebuilding the H-TECH e-commerce platform with AI sales agent.

---

## Project Overview

**H-TECH** is an AI-powered e-commerce platform for electronics retail (laptops, PCs, smartphones, tablets, accessories) with:
- Multi-LLM support (Gemini, OpenAI, Phi-4, Ollama)
- Hybrid search (semantic + keyword) with RRF fusion
- LangGraph-based intent routing agent
- RAG for store policies
- Next.js modern frontend with Minimal design system (black/white/gray)
- PostgreSQL with pgvector for embeddings
- Admin dashboard for AI configuration

---

## 1. Project Structure

```
htech_store/
├── backend/                           # FastAPI + SQLAlchemy backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app
│   │   ├── api/                      # API routes
│   │   │   ├── chat.py              # Chat endpoint
│   │   │   ├── products.py          # Product endpoints
│   │   │   ├── orders.py            # Order endpoints
│   │   │   └── admin.py             # Admin settings
│   │   ├── services/                # Business logic
│   │   │   ├── agent_runtime.py     # LangGraph orchestration
│   │   │   ├── chat_models.py       # Multi-LLM abstraction
│   │   │   ├── embeddings.py        # Embedding clients
│   │   │   ├── hybrid_search.py     # RRF search
│   │   │   ├── policy_vector_store.py  # RAG store
│   │   │   ├── system_prompt.py     # Prompt builder
│   │   │   ├── booking.py           # Booking management
│   │   │   ├── vouchers.py          # Voucher validation
│   │   │   ├── admin_service.py     # AI settings CRUD
│   │   │   └── telegram.py          # Support notifications
│   │   ├── core/
│   │   │   └── config.py            # Settings & environment
│   │   ├── db/
│   │   │   ├── session.py           # Database session
│   │   │   └── migrations/          # Alembic migrations
│   │   ├── models/                  # SQLAlchemy models
│   │   │   └── models.py
│   │   └── schemas/                 # Pydantic DTOs
│   │       └── dto.py
│   ├── alembic/                     # Database migrations
│   │   ├── env.py
│   │   ├── alembic.ini
│   │   └── versions/
│   ├── run_app.py                   # Main entry point
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables (not in git)
│
├── frontend_v2/                      # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   ├── globals.css              # Design system CSS
│   │   ├── catalog/                 # Product catalog pages
│   │   ├── category/                # Category pages
│   │   ├── product/                 # Product detail pages
│   │   ├── checkout/                # Checkout flow
│   │   ├── account/                 # User account
│   │   └── admin/                   # Admin panel
│   ├── components/
│   │   ├── site-header.tsx          # Navigation
│   │   ├── site-footer.tsx          # Footer
│   │   ├── product-card.tsx         # Product grid card
│   │   ├── ai-chat-bubble.tsx       # Chat interface
│   │   ├── category-hub.tsx         # Category sections
│   │   ├── hero-slider.tsx          # Hero banner
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/
│   │   ├── useCart.tsx              # Shopping cart state
│   │   └── use-*.ts                 # Custom hooks
│   ├── lib/
│   │   ├── products.ts              # Product utils
│   │   ├── utils.ts                 # Helper functions
│   │   └── api-client.ts            # API calls
│   ├── tailwind.config.js           # Design system colors
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── README.md
│   └── DESIGN_SYSTEM.md
│
├── database_schema/                 # Documentation
│   ├── db_schema.md
│   └── db_schema_v2.md
│
├── CLAUDE.md                        # This file - complete project spec
└── README.md
```

---

## 2. Backend Requirements

### 2.1 Python & Core Dependencies

```
Python 3.12+

# Web Framework
fastapi>=0.100.0
uvicorn>=0.23.0

# Database
sqlalchemy>=2.0.0
psycopg>=3.1.18
psycopg-binary>=3.1.18
psycopg-pool>=3.1.0
alembic>=1.12.0
asyncpg>=0.28.0

# Pydantic & Config
pydantic>=2.0.0
pydantic-core>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0

# AI & Search
langchain>=0.1.0
langchain-core>=0.1.0
langchain-community>=0.0.1
langchain-postgres>=0.0.1
langgraph>=0.0.1
pgvector>=0.2.0

# LLM Providers
google-genai>=0.3.0
langchain-google-genai>=0.0.1
langchain-openai>=0.0.1

# HTTP & Utilities
httpx>=0.24.0
python-multipart>=0.0.6
requests>=2.31.0
requests-oauthlib>=1.3.0
beautifulsoup4>=4.12.0

# Security
pyjwt>=2.8.0
bcrypt>=4.0.0
oauthlib>=3.2.0
```

### 2.2 Database Setup

**PostgreSQL 14+ Requirements:**
```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- For ILIKE
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Database
CREATE DATABASE htech_db OWNER htech_user;

-- Run migrations
alembic upgrade head
```

**Key Tables:**
1. `products` — Product catalog with embeddings & search vectors
2. `categories` — Product categories with parent_id for hierarchy
3. `orders` — Customer orders with status tracking
4. `vouchers` — Discount codes with min_order_value, max_discount
5. `reviews` — Product reviews & ratings
6. `chat_history` — Chat messages & AI responses
7. `store_policies` — Store policies (VAT, warranty, etc.) with embeddings
8. `ai_settings` — AI provider/model configuration
9. `users` — Customer accounts with JWT auth
10. `product_variants` — Product size/color variants with pricing

### 2.3 Environment Variables

**`.env` file for backend:**
```bash
# Database (required)
DATABASE_URL=postgresql://htech_user:password@localhost:5432/htech_db

# LLM API Keys (pick at least one provider)
GEMINI_API_KEY=your-gemini-api-key                  # Google Gemini (free)
OPENAI_API_KEY=your-openai-key-or-github-pat        # OpenAI or GitHub Models
OPENAI_TEXT_EMBED_3_SMALL=your-embed-3-small-key    # (optional, separate key)
PHI4_API_KEY=your-phi4-api-key                       # Microsoft Phi-4 (Azure)
PHI4_REASONING_API_KEY=your-phi4-reasoning-key      # Phi-4 reasoning (Azure)

# Local Ollama (optional, for self-hosted LLMs)
OLLAMA_BASE_URL=http://localhost:11434

# Support Notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token          # (optional)
TELEGRAM_CHAT_ID=your-telegram-chat-id              # (optional)

# CORS & Frontend
CORS_ORIGINS=http://localhost:3000,https://htech.store

# Search Configuration
EMBEDDING_DIMENSION=768                             # For pgvector
HYBRID_RRF_K=60                                     # RRF fusion weight
HYBRID_LIMIT=8                                      # Results per search

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080                            # 1 week

# App Mode
APP_ENV=development                                 # or production
APP_DEBUG=true                                      # or false
```

---

## 3. Frontend Requirements

### 3.1 Node & Package Manager

```
Node.js 18+
pnpm 8+ (or npm 10+)
```

### 3.2 Frontend Dependencies

```json
{
  "dependencies": {
    "next": "16.2.4",
    "react": "^19",
    "react-dom": "^19",
    "typescript": "5.7.3",
    
    "tailwindcss": "^4.2.0",
    "@tailwindcss/postcss": "^4.2.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5",
    
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    
    "lucide-react": "^0.564.0",
    "next-themes": "^0.4.6",
    "sonner": "^1.7.1",
    
    "@radix-ui/react-*": "latest",  # All radix components
    "@hookform/resolvers": "^3.9.1",
    "react-hook-form": "^7.54.1",
    "zod": "^3.24.1",
    
    "embla-carousel-react": "8.6.0",
    "react-day-picker": "9.13.2",
    "recharts": "2.15.0",
    "date-fns": "4.1.0",
    
    "@vercel/analytics": "1.6.1",
    "cmdk": "1.1.1",
    "vaul": "^1.1.2",
    "react-resizable-panels": "^2.1.7"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "latest"
  }
}
```

### 3.3 Environment Variables

**`frontend_v2/.env.local`:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 4. AI Features Specification

### 4.1 Intent Detection

Automatically route user messages to appropriate tools:

```
User Message
    ↓
Intent Detector (regex + LLM)
    ├─ "voucher" / "code" → verify_voucher
    ├─ "human" / "support" → human_support
    ├─ "book" / "order" → manage_booking
    ├─ "policy" / "warranty" → query_policy_rag
    └─ (default) → search_catalog
    ↓
Tool Handler → LLM Response
    ↓
Answer + Metadata (tool, payload, debug)
```

### 4.2 Hybrid Search (RRF)

Combines semantic + keyword search:

```
User Query
    ↓
Split into Semantic + Keyword branches (parallel)
    ├─ Semantic: Vector embedding → pgvector similarity
    └─ Keyword: Full-text search → PostgreSQL tsvector
    ↓
Reciprocal Rank Fusion (RRF)
    score = 1/(k+semantic_rank) + 1/(k+keyword_rank)
    ↓
Rerank by composite score
    ↓
Top-N results
```

**Example:**
```sql
WITH semantic AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> query_vec) as rank
  FROM products WHERE embedding IS NOT NULL
),
keyword AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(...) DESC) as rank
  FROM products WHERE search_vector @@ query
),
fused AS (
  SELECT id,
    1.0/(60 + s.rank) + 1.0/(60 + k.rank) as score
  FROM semantic s FULL OUTER JOIN keyword k ON s.id = k.id
)
SELECT * FROM fused ORDER BY score DESC LIMIT 8;
```

### 4.3 RAG for Store Policies

```
Store Policies (VAT, warranty, delivery, deposit)
    ↓
Split by markdown headers (h1-h4)
    ↓
Recursive chunk splitting (1000 chars, 200 overlap)
    ↓
Embed chunks → pgvector store
    ↓
User Question
    ↓
Hybrid search on policies
    ↓
Pass top-3 snippets to LLM context
    ↓
LLM synthesizes answer
```

### 4.4 Multi-LLM Support

**Configuration per session:**
1. Admin selects provider/model in dashboard
2. Stored in `ai_settings` table
3. Runtime lookup during chat
4. Fallback to Gemini if provider unavailable

**Supported Combinations:**

| Provider | Models | Features |
|----------|--------|----------|
| Gemini | 2.0-flash, 2.5-flash, 2.5-pro | Free tier, fast |
| OpenAI | gpt-4o-mini, gpt-4o, 4.1-mini | Paid, high quality |
| Phi-4 | phi-4, phi-4-reasoning | Azure, specialized |
| Ollama | qwen2.5, llama3.2, custom | Local, free, offline |

---

## 5. Frontend Design System

### 5.1 Color Palette (Minimal)

```
Primary:        #0C0C09  (deep black)
Secondary:      #312C85  (deep purple)
Surface:        #F4F4F1  (off-white)
Neutral 50:     #F9F9F8
Neutral 100:    #F4F4F1
Neutral 200:    #E8E8E3
Neutral 500:    #9F9F8F
Neutral 800:    #1F1F1A
Neutral 900:    #0C0C09

Success:        #16A34A  (green)
Warning:        #D97706  (amber)
Danger:         #DC2626  (red)
```

### 5.2 Typography

```
Font Families:
  Body:         Open Sans (300-800)
  Display:      Inter (400-700)
  Mono:         Inconsolata

Scale (Desktop-first):
  h1:           3rem,    bold
  h2:           2.25rem, bold
  h3:           1.875rem,semibold
  Body:         1rem,    regular
  Caption:      0.75rem, uppercase
```

### 5.3 Spacing Grid

```
4px, 8px, 12px, 16px, 24px, 32px
(tailwind: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32)
```

### 5.4 Key Components

```
SiteHeader          Navigation + mega menu + search + cart
SiteFooter          Links + social + newsletter
ProductCard         Image, specs, price, add-to-cart
HeroSlider          Hero banner with CTA
CategoryHub         Category section with products
AiChatBubble        Floating chat interface
SearchBar           AI-powered product search
Cart                Shopping cart sidebar
Checkout            Payment flow
```

---

## 6. API Specification

### 6.1 Chat Endpoint

```
POST /api/chat

Request:
{
  "session_id": "user-123",
  "message": "Recommend a laptop under 20 million dong",
  "locale": "vi"
}

Response:
{
  "session_id": "user-123",
  "answer": "I recommend the [product name]...",
  "tool": "search_catalog",
  "payload": {
    "products": [
      {
        "id": "p-123",
        "slug": "dell-xps-13",
        "name": "Dell XPS 13",
        "price": 19_990_000,
        "image": "/images/dell-xps.jpg",
        ...
      }
    ]
  },
  "debug": {
    "search_results": [...]
  },
  "created_at": "2026-05-09T10:30:00Z"
}
```

### 6.2 Product Endpoints

```
GET  /api/products                  List all products
POST /api/products                  Create product (admin)
GET  /api/products/{id}             Get product detail
PATCH /api/products/{id}            Update product (admin)
DELETE /api/products/{id}           Delete product (admin)

Query params:
  ?category=laptop
  ?skip=0&limit=20
  ?sort=price&order=asc
  ?search=gaming
```

### 6.3 Order Endpoints

```
POST /api/orders                    Create order
GET  /api/orders/{id}               Get order detail
PATCH /api/orders/{id}/status       Update status
POST /api/orders/{id}/payment       Record payment
GET  /api/orders                    List user orders
```

### 6.4 Admin Endpoints

```
GET  /api/admin/ai-settings         Get AI config
PUT  /api/admin/ai-settings         Update AI config
GET  /api/admin/models              List available models
POST /api/admin/sync-policies       Re-embed policies
POST /api/admin/settings            Update store settings
```

---

## 7. Database Migrations

**Alembic-based schema versioning:**

```
alembic/
├── env.py
├── alembic.ini
└── versions/
    ├── 20260426_0001_init_hybrid_search.py
    ├── 20260426_0002_ai_settings.py
    ├── 20260501_0003_chat_history.py
    └── ...

Commands:
  alembic upgrade head            # Apply all
  alembic downgrade -1            # Rollback one
  alembic revision --autogenerate # Generate from models
```

---

## 8. Testing Strategy

### 8.1 Backend (pytest)

```
tests/
├── test_hybrid_search.py           # RRF, semantic, keyword
├── test_chat_models.py             # LLM integrations
├── test_embeddings.py              # Embedding clients
├── test_agent_runtime.py           # Intent routing
├── test_api_chat.py                # Chat endpoint
├── test_api_products.py            # Product CRUD
└── conftest.py                     # Fixtures

Run:
  pytest tests/
  pytest --cov=app tests/
```

### 8.2 Frontend (Jest + Vitest)

```
__tests__/
├── components/
│   ├── ProductCard.test.tsx
│   ├── SiteHeader.test.tsx
│   └── AiChatBubble.test.tsx
├── hooks/
│   └── useCart.test.tsx
└── lib/
    └── api-client.test.ts

Run:
  pnpm test
  pnpm test --coverage
```

---

## 9. Deployment Checklist

### 9.1 Backend Deployment

```
☐ Set environment variables in hosting platform
  ☐ DATABASE_URL
  ☐ GEMINI_API_KEY (or other LLM key)
  ☐ CORS_ORIGINS (add production domain)
  ☐ JWT_SECRET (use strong key)
  ☐ APP_ENV=production

☐ Run database migrations
  alembic upgrade head

☐ Seed initial data (optional)
  python seed_htech.py

☐ Test endpoints
  curl http://localhost:8000/api/health

☐ Monitor logs & error tracking
  Sentry, LogRocket, etc.
```

### 9.2 Frontend Deployment

```
☐ Update environment variables
  NEXT_PUBLIC_BACKEND_URL=https://api.htech.store

☐ Build for production
  pnpm build

☐ Test locally
  pnpm start

☐ Deploy to Vercel
  vercel --prod

☐ Setup custom domain
  vercel env add NEXT_PUBLIC_DOMAIN=htech.store

☐ Monitor performance
  Vercel Analytics, Google PageSpeed
```

---

## 10. Maintenance & Support

### 10.1 Regular Tasks

```
Daily:
  ☐ Monitor error logs
  ☐ Check LLM API quotas

Weekly:
  ☐ Review chat logs for new intents
  ☐ Update store policies if needed
  ☐ Sync policy embeddings (if content changed)
  ☐ Check database backups

Monthly:
  ☐ Analyze user search patterns
  ☐ Fine-tune system prompts
  ☐ Review LLM provider performance
  ☐ Optimize hybrid search RRF weights
```

### 10.2 Scaling Considerations

```
Database:
  • Add read replicas for heavy traffic
  • Partition products table by category
  • Increase pgvector index precision

LLM:
  • Implement rate limiting per user
  • Add request queuing for high load
  • Cache common queries (Redis)

Search:
  • Increase HYBRID_LIMIT if results too few
  • Fine-tune HYBRID_RRF_K for better ranking
  • Add faceted search by category/brand

Frontend:
  • Enable CDN for images (Cloudflare, Vercel)
  • Implement infinite scroll
  • Cache product data locally (Next.js ISR)
```

---

## 11. Known Limitations & TODOs

```
Current:
  • Intent detection is regex-based (no LLM)
  • No multi-language support in LLM (English/Vietnamese only)
  • Booking flow is simplified (no real slot collection)
  • No user authentication yet
  • No payment gateway integration

Future:
  ☐ Fine-tune LLM on domain-specific data
  ☐ Add voice chat support
  ☐ Implement real-time inventory sync
  ☐ Add recommendation engine (collaborative filtering)
  ☐ Support more languages
  ☐ Implement advanced analytics dashboard
  ☐ Add A/B testing for prompts
  ☐ Integrate with CRM (Salesforce, HubSpot)
```

---

## 12. Quick Reference Commands

```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python run_app.py

# Frontend
cd frontend_v2
pnpm install
pnpm dev

# Database (psql)
psql -U postgres -d htech_db
CREATE EXTENSION pgvector;
SELECT COUNT(*) FROM products;

# Deployment
git push heroku main              # Backend
vercel --prod                     # Frontend

# Testing
pytest tests/                     # Backend
pnpm test                         # Frontend

# Monitoring
tail -f backend.log               # Backend logs
vercel logs                       # Frontend logs
```

---

## Document Version

**Last Updated:** May 9, 2026  
**Version:** 1.0.0-alpha  
**Status:** Active Development

---

## Contact & Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** support@htech.store
- **Telegram:** @htech_support_bot
