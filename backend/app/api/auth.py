"""Auth API — register, login, get current user.

Uses SQLAlchemy for user storage, bcrypt for password hashing,
and python-jose for JWT signing.  Passwords are NEVER stored plain-text.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Role, RoleName, User
from ..models.profile import AthleteProfile, CoachProfile
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Schemas ──────────────────────────────────────────────────────────────────

class RegisterSchema(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "PLAYER"
    primary_sport: Optional[str] = "Running / Sprinting"
    gender: Optional[str] = ""
    dob: Optional[str] = ""
    location: Optional[str] = ""
    experience: Optional[str] = "Beginner"
    position: Optional[str] = ""


class LoginSchema(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _hash(plain: str) -> str:
    return pwd_ctx.hash(plain)


def _verify(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def _make_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _user_dict(user: User, token: str) -> dict:
    profile = getattr(user, "_profile", None)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.name,
        "primary_sport": getattr(profile, "primary_sport_slug", "athletics") if profile else "athletics",
        "gender": getattr(profile, "gender", "") if profile else "",
        "location": getattr(profile, "location", "") if profile else "",
        "experience": f"{getattr(profile, 'experience_years', 0)} years" if profile else "",
        "position": getattr(profile, "position", "") if profile else "",
        "token": token,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if not data.email or not data.password or not data.full_name:
        raise HTTPException(status_code=400, detail="Email, password and full name are required.")

    existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    role_name = (data.role or "PLAYER").upper()
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{role_name}' not found.")

    user = User(
        email=data.email.strip().lower(),
        password_hash=_hash(data.password),
        full_name=data.full_name.strip(),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.flush()  # get user.id before committing

    if role_name == "PLAYER":
        profile = AthleteProfile(
            user_id=user.id,
            gender=data.gender or "",
            location=data.location or "",
            position=data.position or "",
            experience_years=0,
            bio="",
        )
        db.add(profile)
    elif role_name in ("COACH", "ACADEMY", "ADMIN"):
        profile = CoachProfile(
            user_id=user.id,
            location=data.location or "",
            bio="",
        )
        db.add(profile)

    db.commit()
    db.refresh(user)

    token = _make_token(user.id)
    return {
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": role_name,
            "primary_sport": data.primary_sport or "Running / Sprinting",
            "gender": data.gender or "",
            "location": data.location or "",
            "experience": data.experience or "Beginner",
            "position": data.position or "",
            "token": token,
        },
    }


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    user = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if not user or not _verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    if data.role:
        required = data.role.upper()
        if user.role.name != required:
            # Allow coaches to also login via ACADEMY/ADMIN
            if not (required == "COACH" and user.role.name in ("ACADEMY", "ADMIN")):
                raise HTTPException(
                    status_code=403,
                    detail=f"Account is registered as {user.role.name}, not {required}.",
                )

    token = _make_token(user.id)

    # Load profile for extra fields
    if user.role.name == "PLAYER":
        profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
    else:
        profile = db.query(CoachProfile).filter(CoachProfile.user_id == user.id).first()

    return {
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.name,
            "primary_sport": "Running / Sprinting",
            "gender": getattr(profile, "gender", "") if profile else "",
            "location": getattr(profile, "location", "") if profile else "",
            "experience": f"{getattr(profile, 'experience_years', 0)} yrs" if profile else "",
            "position": getattr(profile, "position", "") if profile else "",
            "token": token,
        },
    }


@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.name == "PLAYER":
        profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
    else:
        profile = db.query(CoachProfile).filter(CoachProfile.user_id == user.id).first()
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.name,
        "gender": getattr(profile, "gender", "") if profile else "",
        "location": getattr(profile, "location", "") if profile else "",
        "position": getattr(profile, "position", "") if profile else "",
    }
