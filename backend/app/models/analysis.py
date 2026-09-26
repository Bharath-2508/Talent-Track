"""AI analysis result model."""
from __future__ import annotations

import typing
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel, TimestampMixin

if typing.TYPE_CHECKING:
    from .video import Video
    from .profile import AthleteProfile


class Analysis(BaseModel, TimestampMixin):
    """One AI analysis report per video."""
    __tablename__ = "analyses"

    video_id: Mapped[int] = mapped_column(
        ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    posture_score: Mapped[int | None] = mapped_column(Integer, default=0)
    arm_movement_score: Mapped[int | None] = mapped_column(Integer, default=0)
    leg_movement_score: Mapped[int | None] = mapped_column(Integer, default=0)
    body_alignment_score: Mapped[int | None] = mapped_column(Integer, default=0)
    running_technique_score: Mapped[int | None] = mapped_column(Integer, default=0)
    symmetry_score: Mapped[int | None] = mapped_column(Integer, default=0)
    movement_similarity: Mapped[float | None] = mapped_column(default=0.0)

    # All structured data is stored as JSON strings for flexibility
    metrics_json: Mapped[str | None] = mapped_column(Text)          # [{"label": str, "value": int}]
    strengths_json: Mapped[str | None] = mapped_column(Text)        # ["str", ...]
    weaknesses_json: Mapped[str | None] = mapped_column(Text)       # [{"name": str, "impact": str}]
    recommendations_json: Mapped[str | None] = mapped_column(Text)  # [{id, title, desc, tag, icon, cta}]
    comparison_json: Mapped[str | None] = mapped_column(Text)       # Comparison against previous report
    analysis_metadata_json: Mapped[str | None] = mapped_column(Text)# Pose detection rate, feature details
    training_plan_json: Mapped[str | None] = mapped_column(Text)    # [{day, focus, type, emoji, intensity}]
    injury_json: Mapped[str | None] = mapped_column(Text)           # {risk, areas, tips}
    career_json: Mapped[str | None] = mapped_column(Text)           # [{level, value, color}]
    badges_json: Mapped[str | None] = mapped_column(Text)           # [{icon, name, desc, earned, date}]
    growth_json: Mapped[str | None] = mapped_column(Text)           # [{month, score}]
    timeline_json: Mapped[str | None] = mapped_column(Text)         # [{month, score, skills, milestone}]

    video: Mapped["Video"] = relationship("Video")                          # noqa: F821
    athlete: Mapped["AthleteProfile"] = relationship("AthleteProfile")      # noqa: F821
