"""Trial listing and application models."""
from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin


class Trial(BaseModel, TimestampMixin):
    """A trial event posted by a coach or academy."""
    __tablename__ = "trials"

    posted_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    age_group: Mapped[str] = mapped_column(String(50), default="Open")
    location: Mapped[str] = mapped_column(String(160), default="")
    date: Mapped[str] = mapped_column(String(50), default="")
    org: Mapped[str] = mapped_column(String(200), default="")
    eligibility: Mapped[str | None] = mapped_column(Text)
    positions: Mapped[int] = mapped_column(Integer, default=10)
    sport_slug: Mapped[str] = mapped_column(String(80), default="athletics")
    is_active: Mapped[bool] = mapped_column(default=True)

    applications: Mapped[list["TrialApplication"]] = relationship(
        "TrialApplication", back_populates="trial", cascade="all, delete-orphan"
    )
    posted_by: Mapped["User"] = relationship("User")  # noqa: F821


class TrialApplication(BaseModel, TimestampMixin):
    """Athlete applies to a trial."""
    __tablename__ = "trial_applications"

    trial_id: Mapped[int] = mapped_column(
        ForeignKey("trials.id", ondelete="CASCADE"), nullable=False, index=True
    )
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # applied | shortlisted | selected | rejected
    status: Mapped[str] = mapped_column(String(32), default="applied")

    trial: Mapped["Trial"] = relationship("Trial", back_populates="applications")
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")  # noqa: F821
