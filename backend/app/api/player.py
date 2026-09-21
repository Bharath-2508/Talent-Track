"""Player API — all player-facing endpoints.

All routes are protected by require_player dependency.
"""
from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..models.analysis import Analysis
from ..models.notification import Notification
from ..models.profile import AthleteProfile
from ..models.trial import Trial, TrialApplication
from ..models.video import Video
from .deps import require_player

router = APIRouter(prefix="/player", tags=["player"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
MAX_SIZE_MB = 500


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_athlete(user: User, db: Session) -> AthleteProfile:
    athlete = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete profile not found.")
    return athlete


def _json_load(val: str | None) -> Any:
    if not val:
        return []
    try:
        return json.loads(val)
    except Exception:
        return []


def _latest_analysis(athlete_id: int, db: Session) -> Analysis | None:
    return (
        db.query(Analysis)
        .filter(Analysis.athlete_id == athlete_id)
        .order_by(Analysis.id.desc())
        .first()
    )


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/profile")
def get_profile(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    latest = _latest_analysis(athlete.id, db)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "gender": athlete.gender or "",
        "location": athlete.location or "",
        "position": athlete.position or "",
        "age": athlete.age,
        "experience_years": athlete.experience_years or 0,
        "bio": athlete.bio or "",
        "overall_score": latest.overall_score if latest else 0,
        "sport": "Running / Sprinting",
    }


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    gender: str | None = None
    location: str | None = None
    position: str | None = None
    age: int | None = None
    experience_years: int | None = None
    bio: str | None = None


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)
    if data.full_name:
        user.full_name = data.full_name
    if data.gender is not None:
        athlete.gender = data.gender
    if data.location is not None:
        athlete.location = data.location
    if data.position is not None:
        athlete.position = data.position
    if data.age is not None:
        athlete.age = data.age
    if data.experience_years is not None:
        athlete.experience_years = data.experience_years
    if data.bio is not None:
        athlete.bio = data.bio
    db.commit()
    return {"success": True, "message": "Profile updated."}


# ── Videos ────────────────────────────────────────────────────────────────────

@router.get("/videos")
def list_videos(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    videos = db.query(Video).filter(Video.athlete_id == athlete.id).order_by(Video.id.desc()).all()
    return [
        {
            "id": v.id,
            "name": v.original_filename,
            "date": v.created_at.date().isoformat() if v.created_at else "",
            "size": f"{v.file_size_mb:.1f} MB" if v.file_size_mb else "",
            "status": v.status,
        }
        for v in videos
    ]


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported. Use MP4, MOV or WEBM.")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / stored_name

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"File too large ({size_mb:.1f} MB). Max {MAX_SIZE_MB} MB.")

    dest.write_bytes(contents)

    video = Video(
        athlete_id=athlete.id,
        original_filename=file.filename or stored_name,
        stored_filename=stored_name,
        file_path=str(dest),
        file_size_mb=round(size_mb, 2),
        status="pending",
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    return {"success": True, "video_id": video.id, "filename": video.original_filename, "status": "pending"}


# ── Analysis ──────────────────────────────────────────────────────────────────

@router.get("/analysis/latest")
def latest_analysis(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    an = _latest_analysis(athlete.id, db)
    if not an:
        return {"has_analysis": False}
    return {
        "has_analysis": True,
        "id": an.id,
        "video_id": an.video_id,
        "overall_score": an.overall_score,
        "metrics": _json_load(an.metrics_json),
        "strengths": _json_load(an.strengths_json),
        "weaknesses": _json_load(an.weaknesses_json),
        "recommendations": _json_load(an.recommendations_json),
        "training_plan": _json_load(an.training_plan_json),
        "badges": _json_load(an.badges_json),
        "growth": _json_load(an.growth_json),
        "timeline": _json_load(an.timeline_json),
        "injury": _json_load(an.injury_json),
        "career_potential": _json_load(an.career_json),
        "created_at": an.created_at.isoformat() if an.created_at else "",
    }


@router.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: int,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)
    an = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.athlete_id == athlete.id).first()
    if not an:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {
        "id": an.id,
        "video_id": an.video_id,
        "overall_score": an.overall_score,
        "metrics": _json_load(an.metrics_json),
        "strengths": _json_load(an.strengths_json),
        "weaknesses": _json_load(an.weaknesses_json),
        "recommendations": _json_load(an.recommendations_json),
        "training_plan": _json_load(an.training_plan_json),
        "badges": _json_load(an.badges_json),
        "growth": _json_load(an.growth_json),
        "timeline": _json_load(an.timeline_json),
        "injury": _json_load(an.injury_json),
        "career_potential": _json_load(an.career_json),
        "created_at": an.created_at.isoformat() if an.created_at else "",
    }


@router.get("/growth")
def growth_data(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    analyses = (
        db.query(Analysis)
        .filter(Analysis.athlete_id == athlete.id)
        .order_by(Analysis.id.asc())
        .all()
    )
    return [
        {
            "month": an.created_at.strftime("%b") if an.created_at else f"Report {i+1}",
            "score": an.overall_score,
        }
        for i, an in enumerate(analyses)
    ]


@router.get("/training-plan")
def training_plan(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    an = _latest_analysis(athlete.id, db)
    return _json_load(an.training_plan_json) if an else []


@router.get("/badges")
def badges(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    an = _latest_analysis(athlete.id, db)
    return _json_load(an.badges_json) if an else []


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/notifications")
def notifications(user: User = Depends(require_player), db: Session = Depends(get_db)):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.id.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": n.id,
            "icon": n.icon,
            "title": n.title,
            "desc": n.body or "",
            "time": n.created_at.strftime("%b %d") if n.created_at else "",
            "read": n.is_read,
            "category": n.category,
        }
        for n in notifs
    ]


@router.put("/notifications/read")
def mark_all_read(user: User = Depends(require_player), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True}


# ── Trials ────────────────────────────────────────────────────────────────────

@router.get("/trials")
def list_trials(user: User = Depends(require_player), db: Session = Depends(get_db)):
    trials = (
        db.query(Trial)
        .filter(Trial.sport_slug == "athletics", Trial.is_active == True)
        .order_by(Trial.id.desc())
        .all()
    )
    return [
        {
            "id": t.id,
            "name": t.name,
            "age_group": t.age_group,
            "location": t.location,
            "date": t.date,
            "org": t.org,
            "eligibility": t.eligibility or "",
            "positions": t.positions,
            "sport": "Running / Sprinting",
        }
        for t in trials
    ]


# ── Scholarships (static seed) ────────────────────────────────────────────────

SCHOLARSHIPS = [
    {"id": 1, "name": "State Athletics Excellence Scholarship", "org": "Sports Authority of India",    "type": "Government",  "amount": "₹50,000 / year",  "eligibility": "U-19, District level or above", "deadline": "Aug 30, 2027"},
    {"id": 2, "name": "AFI Sprint Talent Fund",                 "org": "Athletics Federation of India","type": "Private",     "amount": "₹1,20,000 / year","eligibility": "Top 10% AI score in State",      "deadline": "Sep 15, 2027"},
    {"id": 3, "name": "Academy Scholarship – Sprinters",        "org": "National Sprint Academy",      "type": "Academy",     "amount": "Full fee waiver", "eligibility": "AI technique score above 85",    "deadline": "Oct 01, 2027"},
    {"id": 4, "name": "University Sports Quota",                "org": "Anna University",              "type": "Sports Quota","amount": "Admission + stipend","eligibility": "State-level participation",    "deadline": "Nov 10, 2027"},
    {"id": 5, "name": "Run India Athlete Fund",                 "org": "Run India / AFI",              "type": "Government",  "amount": "₹75,000 / year",  "eligibility": "Under 20, sprint events",        "deadline": "Sep 28, 2027"},
]


@router.get("/scholarships")
def scholarships(_: User = Depends(require_player)):
    return SCHOLARSHIPS
