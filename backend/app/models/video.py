"""Video upload model."""
from __future__ import annotations

import typing
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin

if typing.TYPE_CHECKING:
    from .profile import AthleteProfile


class Video(BaseModel, TimestampMixin):
    """One uploaded running video per row."""
    __tablename__ = "videos"

    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_mb: Mapped[float | None] = mapped_column()
    duration_s: Mapped[float | None] = mapped_column()
    # pending | processing | done | error
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text)

    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile", back_populates="videos")  # noqa: F821
