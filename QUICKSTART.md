# 🚀 H-TECH Full Stack Setup & Startup Guide

## Quick Start (3 bước)

### 1️⃣ Backend Startup

**Option A - PowerShell:**
```powershell
cd d:\AI\Sale_Agent\Htech_Store\backend
.\.venv\Scripts\Activate.ps1
python run_app.py
```

**Option B - Batch File:**
```cmd
d:\AI\Sale_Agent\Htech_Store\backend\start_backend.bat
```

✅ **Backend chạy trên**: http://localhost:8000

---

### 2️⃣ Frontend Startup (in new terminal)

**PowerShell:**
```powershell
cd d:\AI\Sale_Agent\Htech_Store\frontend
pnpm install    # (nếu lần đầu)
pnpm dev
```

✅ **Frontend chạy trên**: http://localhost:3000

---

### 3️⃣ Test AI Chat Integration

**In browser:**
1. Open http://localhost:3000
2. Click **Bot icon** (bottom-right corner)
3. Type: "Giới thiệu sản phẩm laptop"
4. **AI Should respond** with product recommendations

---

## ✅ Verification Checklist

### Backend Ready?
```bash
# Check API health
curl http://localhost:8000/api/health
# Or via browser: http://localhost:8000/docs (Swagger UI)
```

**Expected:** FastAPI running, can see API documentation

### Frontend Ready?
```bash
# Check pnpm is installed
pnpm --version
# Should return: 8.x.x or higher
```

**Expected:** Next.js dev server running on port 3000

### Database Ready?
```bash
# PostgreSQL must be running with pgvector extension
psql -d htech_db -c "SELECT * FROM products LIMIT 1;"
```

**Expected:** Can connect and query products table

---

## 🔧 Troubleshooting

### Error: "Python was not found"
```powershell
# Solution: Explicitly use venv python
& ".\.venv\Scripts\python.exe" run_app.py
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"
```powershell
# Solution: Reinstall dependencies
.\.venv\Scripts\pip.exe install -r requirements.txt --force-reinstall
```

### Error: "pnpm: command not found"
```bash
# Solution: Install pnpm globally
npm install -g pnpm
```

### Error: "Connection refused (localhost:8000)"
- ✅ Ensure backend is running
- ✅ Check port 8000 is not in use: `netstat -an | findstr 8000`

### Error: "Connection refused (localhost:3000)"
- ✅ Ensure frontend is running
- ✅ Check port 3000 is not in use: `netstat -an | findstr 3000`

### Error: "CORS error" in browser console
- ✅ Check `backend/.env` has `CORS_ORIGINS=http://localhost:3000`
- ✅ Restart backend after changing .env

---

## 📁 Project Structure Recap

```
htech_store/
├── backend/
│   ├── .venv/                       ← Python virtual environment
│   ├── app/
│   │   ├── services/
│   │   │   ├── agent_runtime.py    ← LangGraph AI orchestration
│   │   │   ├── chat_models.py      ← Multi-LLM support
│   │   │   ├── embeddings.py       ← Vector embeddings
│   │   │   ├── hybrid_search.py    ← RRF search
│   │   │   └── ... (other services)
│   │   └── api/
│   │       └── chat.py              ← POST /api/chat endpoint
│   ├── run_app.py                   ← Main entry point
│   └── .env                         ← Database & API keys
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               ← Root layout (with AiChatBubble)
│   │   └── page.tsx                 ← Homepage
│   ├── components/
│   │   └── ai-chat-bubble.tsx       ← Chat UI with API integration ✨
│   ├── .env.local                   ← Frontend env vars
│   └── package.json
│
└── (documentation files)
```

---

## 🤖 AI Features Integration

### How It Works:
```
Frontend (ai-chat-bubble.tsx)
    ↓ POST /api/chat
Backend (FastAPI)
    ↓
LangGraph Agent Runtime
    ├─ Intent Detection
    ├─ Hybrid Search (Vector + Keyword)
    ├─ RAG for Policies
    └─ Multi-LLM Support (Gemini, OpenAI, Phi-4, Ollama)
    ↓
Return Response
    ↓
Frontend Displays Answer
```

### API Endpoint:
```
POST http://localhost:8000/api/chat

Request:
{
  "session_id": "unique-session-id",
  "message": "Tư vấn laptop gaming",
  "locale": "vi"
}

Response:
{
  "session_id": "unique-session-id",
  "answer": "Based on your budget and needs...",
  "tool": "search_catalog",
  "payload": {
    "products": [...]
  },
  "created_at": "2026-05-09T..."
}
```

---

## 🔑 Environment Configuration

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# LLM Keys (pick at least one)
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
PHI4_API_KEY=your-key

# Local
OLLAMA_BASE_URL=http://localhost:11434

# Frontend CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 📊 Next Steps After Setup

1. **Test Chat**: Send message → Get AI response
2. **Check Logs**: Monitor backend console for errors
3. **Explore API**: Visit http://localhost:8000/docs
4. **Customize**: Edit system prompts in admin dashboard (when built)
5. **Deploy**: Follow [CLAUDE.md](../CLAUDE.md) & [PROJECT_REQUIREMENTS.md](../PROJECT_REQUIREMENTS.md)

---

## 🆘 Need Help?

- **Backend Logs**: Check terminal running `run_app.py`
- **Frontend Logs**: Check browser DevTools Console (F12)
- **API Docs**: Visit http://localhost:8000/docs
- **Documentation**: See [CLAUDE.md](../CLAUDE.md)

---

**Last Updated:** May 9, 2026  
**Status:** ✅ Ready for Development
