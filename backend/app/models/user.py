from __future__ import annotations

from enum import Enum

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin


class RoleName(str, Enum):
    """The roles supported by the platform.

    PLAYER  -> can only see their own data (no search, no recruitment)
    COACH   -> recruiter/scout: search, compare, shortlist, invite, run trials
    ADMIN   -> platform administration
    """
    PLAYER = "PLAYER"
    COACH = "COACH"
    ADMIN = "ADMIN"


class Role(BaseModel):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255))


class User(BaseModel, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    role: Mapped[Role] = relationship("Role", lazy="joined")
