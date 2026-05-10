---
title: HTech Store Backend
sdk: docker
app_port: 7860
---

# H-TECH Store Deployment

This repo is prepared for:

- Frontend on Vercel from the `frontend` directory.
- Backend on Hugging Face Spaces with Docker from the repository root.

## Frontend: Vercel

Create a Vercel project with Root Directory set to `frontend`.

Environment variables:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-space-name.hf.space
NEXT_PUBLIC_API_BASE_URL=https://your-space-name.hf.space/api
```

Vercel uses `frontend/vercel.json`, `frontend/package.json`, and `frontend/pnpm-lock.yaml`.

## Backend: Hugging Face Spaces

Create a Space with SDK `Docker`, then push this repository root. The root `Dockerfile` runs the FastAPI backend on port `7860`.

Required environment variables / secrets:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=change-me-to-a-long-random-secret
CORS_ORIGINS=https://your-frontend.vercel.app
BACKEND_PUBLIC_URL=https://your-space-name.hf.space
FRONTEND_PUBLIC_URL=https://your-frontend.vercel.app
APP_ENV=production
APP_DEBUG=false
```

Optional environment variables:

```bash
GEMINI_API_KEY=
OPENAI_API_KEY=
OPENAI_TEXT_EMBED_3_SMALL=
PHI4_API_KEY=
PHI4_REASONING_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
CLIENT_ID=
CLIENT_SECRET=
EMBEDDING_DIMENSION=768
HYBRID_RRF_K=60
HYBRID_LIMIT=8
RUN_MIGRATIONS=true
STATIC_DIR=/data/static
UPLOAD_DIR=/data/static/uploads
```

For Google OAuth, add this authorized redirect URI in Google Cloud:

```text
https://your-space-name.hf.space/api/auth/google/callback
```

For Telegram notifications, you can either set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as Space secrets, or edit them later in Admin -> Notifications.

Uploads are served from `/static`. The Docker image defaults to `/data/static/uploads`, so uploaded images can persist when Hugging Face persistent storage is enabled.

## Local Docker Smoke Test

```bash
docker build -t htech-backend .
docker run --rm -p 7860:7860 --env-file backend/.env htech-backend
```

Open:

```text
http://localhost:7860/health
```
