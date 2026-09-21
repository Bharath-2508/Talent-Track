"""Coach API — all coach-facing recruitment endpoints."""
from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..models.analysis import Analysis
from ..models.notification import Notification
from ..models.profile import AthleteProfile, CoachProfile
from ..models.recruitment import Invitation, Shortlist
from ..models.trial import Trial
from .deps import require_coach

router = APIRouter(prefix="/coach", tags=["coach"])


def _get_coach(user: User, db: Session) -> CoachProfile:
    coach = db.query(CoachProfile).filter(CoachProfile.user_id == user.id).first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach profile not found.")
    return coach


def _json_load(val: str | None) -> Any:
    if not val:
        return []
    try:
        return json.loads(val)
    except Exception:
        return []


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/profile")
def get_profile(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    coach = _get_coach(user, db)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "organization": coach.organization or "",
        "speciality": coach.speciality or "",
        "years_experience": coach.years_experience or 0,
        "location": coach.location or "",
        "bio": coach.bio or "",
    }


class CoachProfileUpdate(BaseModel):
    full_name: str | None = None
    organization: str | None = None
    speciality: str | None = None
    years_experience: int | None = None
    location: str | None = None
    bio: str | None = None


@router.put("/profile")
def update_profile(data: CoachProfileUpdate, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    coach = _get_coach(user, db)
    if data.full_name:
        user.full_name = data.full_name
    if data.organization is not None:
        coach.organization = data.organization
    if data.speciality is not None:
        coach.speciality = data.speciality
    if data.years_experience is not None:
        coach.years_experience = data.years_experience
    if data.location is not None:
        coach.location = data.location
    if data.bio is not None:
        coach.bio = data.bio
    db.commit()
    return {"success": True}


# ── Athlete discovery ─────────────────────────────────────────────────────────

def _athlete_card(athlete: AthleteProfile, latest: Analysis | None, shortlisted: bool = False) -> dict:
    return {
        "id": athlete.id,
        "user_id": athlete.user_id,
        "name": athlete.user.full_name,
        "sport": "Running / Sprinting",
        "age": athlete.age,
        "gender": athlete.gender or "",
        "location": athlete.location or "",
        "experience": f"{athlete.experience_years or 0} yrs",
        "position": athlete.position or "Sprinter",
        "ai_score": latest.overall_score if latest else None,
        "metrics": _json_load(latest.metrics_json) if latest else [],
        "shortlisted": shortlisted,
    }


@router.get("/athletes")
def all_athletes(
    q: str | None = Query(None),
    min_score: int | None = Query(None),
    max_score: int | None = Query(None),
    gender: str | None = Query(None),
    location: str | None = Query(None),
    user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    query = db.query(AthleteProfile)
    if gender:
        query = query.filter(AthleteProfile.gender == gender)
    if location:
        query = query.filter(AthleteProfile.location.ilike(f"%{location}%"))

    athletes = query.all()

    # Get shortlisted athlete ids for this coach
    shortlisted_ids = {
        r.athlete_id
        for r in db.query(Shortlist.athlete_id).filter(Shortlist.coach_id == user.id).all()
    }

    result = []
    for athlete in athletes:
        latest = (
            db.query(Analysis)
            .filter(Analysis.athlete_id == athlete.id)
            .order_by(Analysis.id.desc())
            .first()
        )
        if q:
            name_match = q.lower() in athlete.user.full_name.lower()
            loc_match = q.lower() in (athlete.location or "").lower()
            if not (name_match or loc_match):
                continue
        if min_score is not None and (not latest or latest.overall_score < min_score):
            continue
        if max_score is not None and (latest and latest.overall_score > max_score):
            continue
        result.append(_athlete_card(athlete, latest, athlete.id in shortlisted_ids))

    return result


@router.get("/athlete/{athlete_id}")
def get_athlete(athlete_id: int, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found.")
    latest = db.query(Analysis).filter(Analysis.athlete_id == athlete_id).order_by(Analysis.id.desc()).first()
    shortlisted = db.query(Shortlist).filter(Shortlist.coach_id == user.id, Shortlist.athlete_id == athlete_id).first() is not None

    card = _athlete_card(athlete, latest, shortlisted)
    if latest:
        card.update({
            "strengths": _json_load(latest.strengths_json),
            "weaknesses": _json_load(latest.weaknesses_json),
            "training_plan": _json_load(latest.training_plan_json),
            "growth": _json_load(latest.growth_json),
            "badges": _json_load(latest.badges_json),
            "career_potential": _json_load(latest.career_json),
            "injury": _json_load(latest.injury_json),
        })
    return card


# ── Shortlist ─────────────────────────────────────────────────────────────────

@router.post("/shortlist/{athlete_id}", status_code=status.HTTP_201_CREATED)
def add_shortlist(athlete_id: int, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    existing = db.query(Shortlist).filter(Shortlist.coach_id == user.id, Shortlist.athlete_id == athlete_id).first()
    if existing:
        return {"message": "Already shortlisted."}
    athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found.")
    db.add(Shortlist(coach_id=user.id, athlete_id=athlete_id))
    db.commit()
    return {"success": True, "message": "Athlete shortlisted."}


@router.delete("/shortlist/{athlete_id}")
def remove_shortlist(athlete_id: int, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    db.query(Shortlist).filter(Shortlist.coach_id == user.id, Shortlist.athlete_id == athlete_id).delete()
    db.commit()
    return {"success": True}


@router.get("/shortlisted")
def get_shortlisted(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    shortlists = db.query(Shortlist).filter(Shortlist.coach_id == user.id).all()
    result = []
    for s in shortlists:
        athlete = db.query(AthleteProfile).filter(AthleteProfile.id == s.athlete_id).first()
        if athlete:
            latest = db.query(Analysis).filter(Analysis.athlete_id == athlete.id).order_by(Analysis.id.desc()).first()
            result.append(_athlete_card(athlete, latest, shortlisted=True))
    return result


# ── Invitations ───────────────────────────────────────────────────────────────

class InviteBody(BaseModel):
    message: str | None = None
    trial_id: int | None = None


@router.post("/invite/{athlete_id}", status_code=status.HTTP_201_CREATED)
def send_invite(
    athlete_id: int,
    body: InviteBody,
    user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found.")

    inv = Invitation(
        coach_id=user.id,
        athlete_id=athlete_id,
        trial_id=body.trial_id,
        message=body.message or "",
        status="pending",
    )
    db.add(inv)

    # Notify athlete
    notif = Notification(
        user_id=athlete.user_id,
        icon="📨",
        title=f"Trial invitation from {user.full_name}",
        body=body.message or "A coach has invited you to a trial.",
        category="coach",
    )
    db.add(notif)
    db.commit()
    return {"success": True, "invitation_id": inv.id}


@router.get("/invitations")
def get_invitations(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    invs = db.query(Invitation).filter(Invitation.coach_id == user.id).order_by(Invitation.id.desc()).all()
    result = []
    for inv in invs:
        athlete = db.query(AthleteProfile).filter(AthleteProfile.id == inv.athlete_id).first()
        result.append({
            "id": inv.id,
            "athlete_name": athlete.user.full_name if athlete else "Unknown",
            "athlete_id": inv.athlete_id,
            "message": inv.message or "",
            "status": inv.status,
            "trial_id": inv.trial_id,
            "date": inv.created_at.isoformat() if inv.created_at else "",
        })
    return result


# ── Trials ────────────────────────────────────────────────────────────────────

class TrialBody(BaseModel):
    name: str
    age_group: str = "Open"
    location: str = ""
    date: str = ""
    org: str = ""
    eligibility: str = ""
    positions: int = 10


@router.get("/trials")
def list_trials(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    trials = db.query(Trial).filter(Trial.posted_by_id == user.id).order_by(Trial.id.desc()).all()
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
            "applicants": len(t.applications),
            "is_active": t.is_active,
        }
        for t in trials
    ]


@router.post("/trials", status_code=status.HTTP_201_CREATED)
def create_trial(body: TrialBody, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    trial = Trial(
        posted_by_id=user.id,
        name=body.name,
        age_group=body.age_group,
        location=body.location,
        date=body.date,
        org=body.org,
        eligibility=body.eligibility,
        positions=body.positions,
        sport_slug="athletics",
    )
    db.add(trial)
    db.commit()
    db.refresh(trial)
    return {"success": True, "trial_id": trial.id}


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
def analytics(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    total_athletes = db.query(AthleteProfile).count()
    shortlisted_count = db.query(Shortlist).filter(Shortlist.coach_id == user.id).count()
    invited_count = db.query(Invitation).filter(Invitation.coach_id == user.id).count()
    trials_hosted = db.query(Trial).filter(Trial.posted_by_id == user.id).count()

    success_rate = round((invited_count / max(shortlisted_count, 1)) * 100, 1) if shortlisted_count else 0

    return {
        "players_tracked": total_athletes,
        "shortlisted": shortlisted_count,
        "invitations_sent": invited_count,
        "trials_hosted": trials_hosted,
        "success_rate": success_rate,
        "funnel": [
            {"stage": "Viewed",      "value": total_athletes},
            {"stage": "Shortlisted", "value": shortlisted_count},
            {"stage": "Invited",     "value": invited_count},
        ],
        "sport_wise": [{"name": "Running / Sprinting", "value": total_athletes}],
    }


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/notifications")
def notifications(user: User = Depends(require_coach), db: Session = Depends(get_db)):
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
def mark_read(user: User = Depends(require_coach), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True}
