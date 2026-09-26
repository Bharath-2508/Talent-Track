"""Notification model."""
from __future__ import annotations

import typing
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin

if typing.TYPE_CHECKING:
    from .user import User


class Notification(BaseModel, TimestampMixin):
    """In-app notification for any user."""
    __tablename__ = "notifications"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    icon: Mapped[str] = mapped_column(String(10), default="🔔")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str | None] = mapped_column(Text)
    # report | coach | trial | system
    category: Mapped[str] = mapped_column(String(50), default="system")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User")  # noqa: F821
