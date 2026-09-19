from typing import Optional, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..services.excel_storage import save_user_to_excel, get_user_by_email, get_all_users

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterSchema(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "PLAYER"
    primary_sport: Optional[str] = "Running / Sprinting"
    gender: Optional[str] = ""
    dob: Optional[str] = ""
    location: Optional[str] = ""
    experience: Optional[str] = ""
    position: Optional[str] = ""


class LoginSchema(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema):
    if not data.email or not data.password or not data.full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, password, and full name are required.",
        )
    
    try:
        user_info = save_user_to_excel(data.model_dump())
        return {
            "success": True,
            "message": "User registered successfully and saved to Excel.",
            "user": user_info,
            "token": f"excel_jwt_{user_info['id']}_{user_info['email']}",
        }
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error writing to Excel: {str(err)}",
        )


@router.post("/login")
def login(data: LoginSchema):
    if not data.email or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )
        
    user = get_user_by_email(data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
        
    if user.get("Password") != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
        
    user_role = user.get("Role", "PLAYER").upper()
    if data.role and data.role.upper() != user_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is registered as {user_role}, not {data.role.upper()}.",
        )

    user_info = {
        "id": user.get("ID"),
        "role": user_role,
        "full_name": user.get("Full Name"),
        "email": user.get("Email"),
        "primary_sport": user.get("Primary Sport"),
        "gender": user.get("Gender"),
        "dob": user.get("Date of Birth"),
        "location": user.get("Location"),
        "experience": user.get("Experience Level"),
        "position": user.get("Playing Position"),
        "created_at": user.get("Created At"),
    }

    return {
        "success": True,
        "message": "Login successful.",
        "user": user_info,
        "token": f"excel_jwt_{user_info['id']}_{user_info['email']}",
    }


@router.get("/users")
def list_registered_users():
    raw_users = get_all_users()
    sanitized = []
    for u in raw_users:
        user_copy = dict(u)
        user_copy.pop("Password", None)
        sanitized.append(user_copy)
    return {"count": len(sanitized), "users": sanitized}
