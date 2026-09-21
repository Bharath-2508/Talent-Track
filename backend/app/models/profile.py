from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin


class AthleteProfile(BaseModel, TimestampMixin):
    """Player profile. All player-owned data hangs off this row (videos,
    analyses, growth records, portfolio, resume, etc.) keyed by athlete_id.
    """
    __tablename__ = "athletes"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    primary_sport_id: Mapped[int | None] = mapped_column(ForeignKey("sports.id"))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    age: Mapped[int | None] = mapped_column(Integer)
    gender: Mapped[str | None] = mapped_column(String(20))
    location: Mapped[str | None] = mapped_column(String(160))
    position: Mapped[str | None] = mapped_column(String(80))
    experience_years: Mapped[int | None] = mapped_column(Integer)
    bio: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship("User", lazy="joined")  # noqa: F821
    primary_sport: Mapped["Sport"] = relationship("Sport", lazy="joined")  # noqa: F821
    videos: Mapped[list["Video"]] = relationship("Video", back_populates="athlete", cascade="all, delete-orphan")  # noqa: F821



class CoachProfile(BaseModel, TimestampMixin):
    """Coach (recruiter/scout) profile."""
    __tablename__ = "coaches"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    organization: Mapped[str | None] = mapped_column(String(200))
    speciality: Mapped[str | None] = mapped_column(String(200))
    years_experience: Mapped[int | None] = mapped_column(Integer)
    location: Mapped[str | None] = mapped_column(String(160))
    bio: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship("User", lazy="joined")  # noqa: F821


class Academy(BaseModel, TimestampMixin):
    """Academy runs trials and manages applications."""
    __tablename__ = "academies"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str | None] = mapped_column(String(160))
    website: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship("User", lazy="joined")  # noqa: F821
