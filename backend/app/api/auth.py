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
from urllib.parse import urlencode

router = APIRouter()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "username": user.username,
        "role": user.role.value,
        "permission": user.permission.value,
    }


def _token_payload(user: User) -> dict:
    return {
        "sub": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role.value,
        "permission": user.permission.value,
    }


def _public_backend_url() -> str:
    return (os.getenv("BACKEND_PUBLIC_URL") or os.getenv("NEXT_PUBLIC_BACKEND_URL") or "http://localhost:8000").rstrip("/")


def _public_frontend_url() -> str:
    return (os.getenv("FRONTEND_PUBLIC_URL") or os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")[0]).rstrip("/")


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin_access(user: User = Depends(get_current_user)) -> User:
    if user.role not in {UserRole.ADMIN, UserRole.STAFF} or user.permission == UserPermission.NONE:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_full_admin(user: User = Depends(require_admin_access)) -> User:
    if user.role != UserRole.ADMIN or user.permission != UserPermission.FULL:
        raise HTTPException(status_code=403, detail="Full admin permission required")
    return user

@router.post("/login")
def login(payload: LoginRequestDTO, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(
            (User.email == payload.identifier) | (User.username == payload.identifier)
        )
    )
    
    if not user:
        bootstrap_password = os.getenv("ADMIN_PASSWORD", "admin123")
        admin_exists = db.scalar(select(User).where(User.role == UserRole.ADMIN))
        if (
            settings.app_env == "development"
            and not admin_exists
            and payload.identifier in {"admin", "admin@htech.vn"}
            and payload.password == bootstrap_password
        ):
            user = User(
                id=str(uuid.uuid4()),
                email=os.getenv("ADMIN_EMAIL", "admin@htech.vn"),
                username=os.getenv("ADMIN_USERNAME", "admin"),
                hashed_password=get_password_hash(bootstrap_password),
                full_name="Quản trị viên",
                role=UserRole.ADMIN,
                permission=UserPermission.FULL,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check password
    if not user.hashed_password or user.hashed_password != get_password_hash(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token(_token_payload(user))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_payload(user)
    }

@router.get("/google/login")
def google_login(request: Request, db: Session = Depends(get_db)):
    settings_ai = get_or_create_ai_settings(db)
    client_id = settings_ai.google_client_id or os.getenv("CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    
    redirect_uri = f"{_public_backend_url()}/api/auth/google/callback"

    params = {
        "client_id": client_id,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": redirect_uri,
        "prompt": "select_account",
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    settings_ai = get_or_create_ai_settings(db)
    client_id = settings_ai.google_client_id or os.getenv("CLIENT_ID")
    client_secret = settings_ai.google_client_secret or os.getenv("CLIENT_SECRET")
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth credentials not configured")
    redirect_uri = f"{_public_backend_url()}/api/auth/google/callback"
    
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
    google_id = user_data.get("id")
    if google_id and user.google_id != google_id:
        user.google_id = google_id
        db.commit()
        db.refresh(user)
        
    token = create_access_token(_token_payload(user))
    
    return RedirectResponse(f"{_public_frontend_url()}/login?{urlencode({'token': token})}")


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return _user_payload(user)
