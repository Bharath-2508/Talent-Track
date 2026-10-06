"""Player API — all player-facing endpoints.

All routes are protected by require_player dependency.
"""
from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..models.analysis import Analysis
from ..models.notification import Notification
from ..models.profile import AthleteProfile, CoachProfile
from ..models.recruitment import Invitation, AthleteInvitationResponse
from ..models.trial import Trial, TrialApplication
from ..models.video import Video
from .deps import require_player

router = APIRouter(prefix="/player", tags=["player"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "temp_uploads"
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

@router.get("/analyses")
def list_analyses(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    analyses = (
        db.query(Analysis)
        .filter(Analysis.athlete_id == athlete.id)
        .order_by(Analysis.id.desc())
        .all()
    )
    return [
        {
            "id": an.id,
            "video_id": an.video_id,
            "overall_score": an.overall_score,
            "posture_score": an.posture_score,
            "arm_movement_score": an.arm_movement_score,
            "leg_movement_score": an.leg_movement_score,
            "body_alignment_score": an.body_alignment_score,
            "running_technique_score": an.running_technique_score,
            "symmetry_score": an.symmetry_score,
            "movement_similarity": an.movement_similarity,
            "metrics": _json_load(an.metrics_json),
            "strengths": _json_load(an.strengths_json),
            "weaknesses": _json_load(an.weaknesses_json),
            "comparison": _json_load(an.comparison_json),
            "created_at": an.created_at.isoformat() if an.created_at else "",
        }
        for an in analyses
    ]


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
        "posture_score": an.posture_score,
        "arm_movement_score": an.arm_movement_score,
        "leg_movement_score": an.leg_movement_score,
        "body_alignment_score": an.body_alignment_score,
        "running_technique_score": an.running_technique_score,
        "symmetry_score": an.symmetry_score,
        "movement_similarity": an.movement_similarity,
        "metrics": _json_load(an.metrics_json),
        "strengths": _json_load(an.strengths_json),
        "weaknesses": _json_load(an.weaknesses_json),
        "recommendations": _json_load(an.recommendations_json),
        "comparison": _json_load(an.comparison_json),
        "analysis_metadata": _json_load(an.analysis_metadata_json),
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
        "posture_score": an.posture_score,
        "arm_movement_score": an.arm_movement_score,
        "leg_movement_score": an.leg_movement_score,
        "body_alignment_score": an.body_alignment_score,
        "running_technique_score": an.running_technique_score,
        "symmetry_score": an.symmetry_score,
        "movement_similarity": an.movement_similarity,
        "metrics": _json_load(an.metrics_json),
        "strengths": _json_load(an.strengths_json),
        "weaknesses": _json_load(an.weaknesses_json),
        "recommendations": _json_load(an.recommendations_json),
        "comparison": _json_load(an.comparison_json),
        "analysis_metadata": _json_load(an.analysis_metadata_json),
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


# ── Player Invitations & Responses ────────────────────────────────────────────

class AthleteInterestedForm(BaseModel):
    athlete_name: str
    athlete_phone: str
    athlete_email: str
    message: str | None = None


def _format_invitation(inv: Invitation, db: Session) -> dict:
    coach_user = db.query(User).filter(User.id == inv.coach_id).first()
    coach_prof = db.query(CoachProfile).filter(CoachProfile.user_id == inv.coach_id).first()
    trial = db.query(Trial).filter(Trial.id == inv.trial_id).first() if inv.trial_id else None
    resp = db.query(AthleteInvitationResponse).filter(AthleteInvitationResponse.invitation_id == inv.id).first()

    resp_dict = None
    if resp:
        resp_dict = {
            "id": resp.id,
            "athlete_name": resp.athlete_name,
            "athlete_email": resp.athlete_email,
            "athlete_phone": resp.athlete_phone,
            "response_type": resp.response_type,
            "message": resp.message or "",
            "created_at": resp.created_at.strftime("%b %d, %Y %I:%M %p") if resp.created_at else "",
        }

    return {
        "id": inv.id,
        "coach_id": inv.coach_id,
        "coach_name": coach_user.full_name if (coach_user and coach_user.full_name) else "Coach",
        "coach_organization": coach_prof.organization if (coach_prof and coach_prof.organization) else "Athletics Federation",
        "coach_speciality": coach_prof.speciality if coach_prof else "Sprint Recruitment",
        "coach_location": coach_prof.location if coach_prof else "State Athletics Center",
        "coach_email": coach_user.email if coach_user else "",
        "subject": inv.subject or "Official Sprint & Track Trial Invitation",
        "message": inv.message or "You're invited to attend an official sprinting trial and recruitment evaluation.",
        "status": inv.status or "pending",
        "read_at": inv.read_at.strftime("%b %d, %Y %I:%M %p") if inv.read_at else None,
        "created_at": inv.created_at.strftime("%b %d, %Y %I:%M %p") if inv.created_at else "",
        "trial_id": inv.trial_id,
        "trial_name": trial.name if trial else "Sprint Trial & Recruitment Selection",
        "trial_location": trial.location if trial else (coach_prof.location if coach_prof else "State Training Ground"),
        "trial_date": trial.date if trial else "Upcoming Trial Evaluation",
        "trial_org": trial.org if trial else (coach_prof.organization if coach_prof else "National Athletics Association"),
        "response": resp_dict,
    }


@router.get("/invitations")
def get_player_invitations(user: User = Depends(require_player), db: Session = Depends(get_db)):
    athlete = _get_athlete(user, db)
    invs = (
        db.query(Invitation)
        .filter(or_(Invitation.athlete_id == athlete.id, Invitation.athlete_id == user.id))
        .order_by(Invitation.id.desc())
        .all()
    )
    return [_format_invitation(inv, db) for inv in invs]


@router.get("/invitations/{invitation_id}")
def get_single_invitation(
    invitation_id: int,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)
    inv = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    # Security check: Only the invited athlete can access
    if inv.athlete_id != athlete.id and inv.athlete_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this invitation.")

    # Mark as read in backend
    if not inv.read_at or inv.status == "pending":
        inv.read_at = datetime.utcnow()
        if inv.status == "pending":
            inv.status = "read"
        db.commit()
        db.refresh(inv)

    return _format_invitation(inv, db)


@router.post("/invitations/{invitation_id}/interested")
def respond_interested(
    invitation_id: int,
    body: AthleteInterestedForm,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)
    inv = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    # Security check
    if inv.athlete_id != athlete.id and inv.athlete_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this invitation.")

    # Phone validation
    phone_clean = (body.athlete_phone or "").strip()
    digits_only = re.sub(r"[^\d]", "", phone_clean)
    if not phone_clean or len(digits_only) < 7:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid phone number (at least 7 digits)."
        )

    # Email validation
    email_clean = (body.athlete_email or "").strip()
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not email_clean or not re.match(email_regex, email_clean):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address."
        )

    # Duplicate response check
    existing_resp = (
        db.query(AthleteInvitationResponse)
        .filter(AthleteInvitationResponse.invitation_id == inv.id)
        .first()
    )
    if existing_resp:
        return {
            "success": False,
            "already_responded": True,
            "message": "You have already responded to this invitation.",
            "response": {
                "athlete_name": existing_resp.athlete_name,
                "athlete_email": existing_resp.athlete_email,
                "athlete_phone": existing_resp.athlete_phone,
                "response_type": existing_resp.response_type,
                "created_at": existing_resp.created_at.strftime("%b %d, %Y %I:%M %p") if existing_resp.created_at else "",
            }
        }

    # Create response linking to the SAME coach
    resp = AthleteInvitationResponse(
        invitation_id=inv.id,
        coach_id=inv.coach_id,
        athlete_id=athlete.id,
        athlete_name=body.athlete_name.strip() or user.full_name,
        athlete_email=email_clean,
        athlete_phone=phone_clean,
        response_type="interested",
        message=body.message or f"{body.athlete_name.strip()} is interested in your trial invitation.",
    )
    db.add(resp)

    # Update invitation status
    inv.status = "interested"

    # Send coach notification
    coach_notif = Notification(
        user_id=inv.coach_id,
        icon="🌟",
        title=f"New response from {body.athlete_name.strip()}",
        body=f"{body.athlete_name.strip()} expressed interest in your trial invitation: \"{inv.subject or 'Trial Invitation'}\". Phone: {phone_clean}, Email: {email_clean}",
        category="invitation_response",
    )
    db.add(coach_notif)

    db.commit()
    db.refresh(resp)

    return {
        "success": True,
        "message": "Your contact details and response have been sent to the coach.",
        "invitation_id": inv.id,
        "status": "interested",
        "response": {
            "id": resp.id,
            "athlete_name": resp.athlete_name,
            "athlete_email": resp.athlete_email,
            "athlete_phone": resp.athlete_phone,
            "response_type": resp.response_type,
            "created_at": resp.created_at.strftime("%b %d, %Y %I:%M %p") if resp.created_at else "",
        }
    }


@router.post("/invitations/{invitation_id}/decline")
def respond_decline(
    invitation_id: int,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    athlete = _get_athlete(user, db)
    inv = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    if inv.athlete_id != athlete.id and inv.athlete_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this invitation.")

    existing_resp = (
        db.query(AthleteInvitationResponse)
        .filter(AthleteInvitationResponse.invitation_id == inv.id)
        .first()
    )
    if existing_resp:
        return {
            "success": False,
            "already_responded": True,
            "message": "You have already responded to this invitation.",
        }

    resp = AthleteInvitationResponse(
        invitation_id=inv.id,
        coach_id=inv.coach_id,
        athlete_id=athlete.id,
        athlete_name=user.full_name or "Athlete",
        athlete_email=user.email or "",
        athlete_phone="N/A",
        response_type="declined",
        message="Athlete declined the invitation.",
    )
    db.add(resp)
    inv.status = "declined"

    coach_notif = Notification(
        user_id=inv.coach_id,
        icon="ℹ️",
        title=f"Invitation response from {user.full_name}",
        body=f"{user.full_name} has declined your trial invitation: \"{inv.subject or 'Trial Invitation'}\".",
        category="invitation_response",
    )
    db.add(coach_notif)

    db.commit()
    return {"success": True, "invitation_id": inv.id, "status": "declined"}


class GenericRespondBody(BaseModel):
    action: str = "interested"  # 'accepted' | 'interested' | 'declined'
    athlete_name: str | None = None
    athlete_phone: str | None = None
    athlete_email: str | None = None
    message: str | None = None


@router.post("/invitations/{invitation_id}/respond")
def respond_generic(
    invitation_id: int,
    body: GenericRespondBody,
    user: User = Depends(require_player),
    db: Session = Depends(get_db),
):
    action_clean = (body.action or "interested").lower()
    if action_clean == "declined":
        return respond_decline(invitation_id, user, db)

    form_body = AthleteInterestedForm(
        athlete_name=body.athlete_name or user.full_name or "Athlete",
        athlete_phone=body.athlete_phone or "Not provided",
        athlete_email=body.athlete_email or user.email or "",
        message=body.message,
    )
    return respond_interested(invitation_id, form_body, user, db)


