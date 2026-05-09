from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import httpx
import jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.admin_service import get_or_create_ai_settings, get_password_hash
from app.models.models import User, UserRole, UserPermission
from app.schemas.admin import LoginRequestDTO, UserDTO
from app.core.config import settings
from sqlalchemy import select
import os
import uuid

router = APIRouter()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

@router.post("/login")
def login(payload: LoginRequestDTO, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(
            (User.email == payload.identifier) | (User.username == payload.identifier)
        )
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check password
    if user.hashed_password != get_password_hash(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role.value,
        "permission": user.permission.value
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role.value,
            "permission": user.permission.value
        }
    }

@router.get("/google/login")
def google_login(request: Request, db: Session = Depends(get_db)):
    settings_ai = get_or_create_ai_settings(db)
    client_id = settings_ai.google_client_id or os.getenv("CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    
    redirect_uri = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000") + "/api/auth/google/callback"
    
    url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&response_type=code&scope=openid%20email%20profile&redirect_uri={redirect_uri}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    settings_ai = get_or_create_ai_settings(db)
    client_id = settings_ai.google_client_id or os.getenv("CLIENT_ID")
    client_secret = settings_ai.google_client_secret or os.getenv("CLIENT_SECRET")
    redirect_uri = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000") + "/api/auth/google/callback"
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        })
        token_data = token_res.json()
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")
            
        user_res = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
            "Authorization": f"Bearer {token_data['access_token']}"
        })
        user_data = user_res.json()
        
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email from Google")
        
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        from app.services.admin_service import upsert_user
        name = user_data.get("name", email.split('@')[0])
        payload = UserDTO(
            email=email, 
            full_name=name, 
            role=UserRole.USER, 
            permission=UserPermission.NONE, 
            username=email
        )
        user = upsert_user(db, payload)
        
    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role.value,
        "permission": user.permission.value
    })
    
    frontend_url = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")[0]
    return RedirectResponse(f"{frontend_url}/login?token={token}")


@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(404, "User not found")
            
        return {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role.value,
            "permission": user.permission.value
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
