"""Recruitment models — shortlists and invitations."""
from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin


class Shortlist(BaseModel, TimestampMixin):
    """Coach saves an athlete to their shortlist."""
    __tablename__ = "shortlists"
    __table_args__ = (UniqueConstraint("coach_id", "athlete_id", name="uq_shortlist"),)

    coach_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )

    coach: Mapped["User"] = relationship("User", foreign_keys=[coach_id])      # noqa: F821
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")          # noqa: F821


class Invitation(BaseModel, TimestampMixin):
    """Coach sends a trial invitation to an athlete."""
    __tablename__ = "invitations"

    coach_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    trial_id: Mapped[int | None] = mapped_column(ForeignKey("trials.id", ondelete="SET NULL"))
    message: Mapped[str | None] = mapped_column(Text)
    # pending | accepted | declined
    status: Mapped[str] = mapped_column(String(32), default="pending")

    coach: Mapped["User"] = relationship("User", foreign_keys=[coach_id])      # noqa: F821
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")          # noqa: F821
    trial: Mapped["Trial | None"] = relationship("Trial")                       # noqa: F821
