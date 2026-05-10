from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.chat import router as chat_router
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title=settings.app_name)

# Ensure static/uploads exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print(f"CORS origins: {settings.cors_origins_list}")
from app.api.auth import router as auth_router
from app.api.orders import router as orders_router
from app.api.products import router as products_router

app.include_router(chat_router)
app.include_router(orders_router)
app.include_router(products_router)
app.include_router(admin_router)
app.include_router(auth_router, prefix="/api/auth")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
