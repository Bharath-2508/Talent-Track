"""Recruitment models — shortlists and invitations."""
from __future__ import annotations

import typing
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin

if typing.TYPE_CHECKING:
    from .user import User
    from .profile import AthleteProfile
    from .trial import Trial


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
    subject: Mapped[str | None] = mapped_column(String(200), default="Official Sprint & Track Trial Invitation")
    message: Mapped[str | None] = mapped_column(Text)
    # pending | read | interested | declined
    status: Mapped[str] = mapped_column(String(32), default="pending")
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    coach: Mapped["User"] = relationship("User", foreign_keys=[coach_id])      # noqa: F821
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")          # noqa: F821
    trial: Mapped["Trial | None"] = relationship("Trial")                       # noqa: F821


class AthleteInvitationResponse(BaseModel, TimestampMixin):
    """Athlete response to a coach invitation with confirmed contact details."""
    __tablename__ = "athlete_invitation_responses"

    invitation_id: Mapped[int] = mapped_column(
        ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    coach_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    athlete_name: Mapped[str] = mapped_column(String(160), nullable=False)
    athlete_email: Mapped[str] = mapped_column(String(160), nullable=False)
    athlete_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    # interested | declined
    response_type: Mapped[str] = mapped_column(String(32), default="interested")
    message: Mapped[str | None] = mapped_column(Text)

    invitation: Mapped["Invitation"] = relationship("Invitation")
    coach: Mapped["User"] = relationship("User", foreign_keys=[coach_id])
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")

