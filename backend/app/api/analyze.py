"""Analyze API — trigger AI analysis on an uploaded video and poll status."""
from __future__ import annotations

import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..ai.report_builder import build_report
from ..ai.running_analyzer import analyze_video
from ..database import SessionLocal, get_db
from ..models import User
from ..models.analysis import Analysis
from ..models.notification import Notification
from ..models.profile import AthleteProfile
from ..models.video import Video
from .deps import require_player

log = logging.getLogger(__name__)
router = APIRouter(prefix="/analyze", tags=["analyze"])


def _get_athlete(user: User, db: Session) -> AthleteProfile:
    athlete = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete profile not found.")
    return athlete


def _run_analysis(video_id: int, athlete_id: int, user_id: int) -> None:
    """Background task — run AI analysis and save result to DB."""
    db: Session = SessionLocal()
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return

        video.status = "processing"
        db.commit()

        # Previous scores for growth chart
        prev = (
            db.query(Analysis.overall_score)
            .filter(Analysis.athlete_id == athlete_id)
            .order_by(Analysis.id.asc())
            .all()
        )
        previous_scores = [r[0] for r in prev]

        # Run AI pipeline
        athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
        name = athlete.user.full_name if athlete else "Athlete"

        raw = analyze_video(video.file_path)
        report = build_report(raw, previous_scores, athlete_name=name)

        # Save to analyses table
        an = Analysis(
            video_id=video_id,
            athlete_id=athlete_id,
            overall_score=report["overall_score"],
            metrics_json=json.dumps(report["metrics"]),
            strengths_json=json.dumps(report["strengths"]),
            weaknesses_json=json.dumps(report["weaknesses"]),
            recommendations_json=json.dumps(report["recommendations"]),
            training_plan_json=json.dumps(report["training_plan"]),
            badges_json=json.dumps(report["badges"]),
            growth_json=json.dumps(report["growth"]),
            timeline_json=json.dumps(report["timeline"]),
            injury_json=json.dumps(report["injury"]),
            career_json=json.dumps(report["career_potential"]),
        )
        db.add(an)

        video.status = "done"

        # Create notification for player
        notif = Notification(
            user_id=user_id,
            icon="📊",
            title="Your AI report is ready!",
            body=f"Running analysis complete — Overall score: {report['overall_score']}/100",
            category="report",
            is_read=False,
        )
        db.add(notif)
        db.commit()

        log.info("Analysis complete for video %d — score %d", video_id, report["overall_score"])
    except Exception as exc:
        log.exception("Analysis failed for video %d: %s", video_id, exc)
        try:
            video = db.query(Video).filter(Video.id == video_id).first()
            if video:
                video.status = "error"
                video.error_message = str(exc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/{video_id}")
def trigger_analysis(
    video_id: int,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    """Trigger AI analysis for a specific uploaded video."""
    athlete = _get_athlete(user, db)
    video = db.query(Video).filter(Video.id == video_id, Video.athlete_id == athlete.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found.")
    if video.status == "processing":
        return {"message": "Analysis already in progress.", "status": "processing"}
    if video.status == "done":
        return {"message": "Analysis already complete.", "status": "done"}

    video.status = "processing"
    db.commit()

    background_tasks.add_task(_run_analysis, video_id, athlete.id, user.id)

    return {"success": True, "video_id": video_id, "status": "processing"}


@router.get("/status/{video_id}")
def analysis_status(
    video_id: int,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    """Poll analysis status. Returns status and analysis_id when done."""
    athlete = _get_athlete(user, db)
    video = db.query(Video).filter(Video.id == video_id, Video.athlete_id == athlete.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found.")

    analysis_id = None
    if video.status == "done":
        an = db.query(Analysis).filter(Analysis.video_id == video_id).first()
        analysis_id = an.id if an else None

    return {
        "video_id": video_id,
        "status": video.status,
        "analysis_id": analysis_id,
        "error": video.error_message,
    }
