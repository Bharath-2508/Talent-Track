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
from ..models.recruitment import Invitation, Shortlist, AthleteInvitationResponse
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
    age_val = athlete.age if athlete.age is not None else 18
    gender_val = athlete.gender or "Male"
    location_val = athlete.location or "State Training Ground"
    exp_val = f"{athlete.experience_years or 2} yrs"
    pos_val = athlete.position or "Sprinter"
    
    ai_score_val = latest.overall_score if (latest and latest.overall_score) else 65
    posture_val = latest.posture_score if (latest and latest.posture_score) else 65
    arm_val = latest.arm_movement_score if (latest and latest.arm_movement_score) else 60
    leg_val = latest.leg_movement_score if (latest and latest.leg_movement_score) else 75
    align_val = latest.body_alignment_score if (latest and latest.body_alignment_score) else 70
    tech_val = latest.running_technique_score if (latest and latest.running_technique_score) else 65
    sym_val = latest.symmetry_score if (latest and latest.symmetry_score) else 70

    return {
        "id": athlete.id,
        "user_id": athlete.user_id,
        "name": athlete.user.full_name if (athlete.user and athlete.user.full_name) else "Athlete",
        "sport": "Running / Sprinting",
        "age": age_val,
        "gender": gender_val,
        "location": location_val,
        "experience": exp_val,
        "position": pos_val,
        "ai_score": ai_score_val,
        "speed": tech_val,
        "balance": sym_val,
        "technique": posture_val,
        "posture": posture_val,
        "arm_movement": arm_val,
        "leg_movement": leg_val,
        "body_alignment": align_val,
        "running_technique": tech_val,
        "symmetry": sym_val,
        "improvement": 0,
        "skills": [s for s in (_json_load(latest.strengths_json) if latest else []) if isinstance(s, str)] or ["Sprint Acceleration", "Upright Form"],
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
    age_min: int | None = Query(None),
    age_max: int | None = Query(None),
    experience: str | None = Query(None),
    position: str | None = Query(None),
    min_speed: int | None = Query(None),
    min_balance: int | None = Query(None),
    min_technique: int | None = Query(None),
    user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    query_obj = db.query(AthleteProfile)

    if gender and gender.lower() != "all":
        query_obj = query_obj.filter(func.lower(AthleteProfile.gender) == gender.lower())
    if location:
        query_obj = query_obj.filter(AthleteProfile.location.ilike(f"%{location}%"))
    if age_min is not None:
        query_obj = query_obj.filter(AthleteProfile.age >= age_min)
    if age_max is not None:
        query_obj = query_obj.filter(AthleteProfile.age <= age_max)
    if position and position.lower() != "all":
        query_obj = query_obj.filter(func.lower(AthleteProfile.position) == position.lower())

    if experience and experience.lower() != "all":
        exp_lower = experience.lower()
        if exp_lower == "beginner":
            query_obj = query_obj.filter(or_(AthleteProfile.experience_years == None, AthleteProfile.experience_years <= 2))
        elif exp_lower == "intermediate":
            query_obj = query_obj.filter(AthleteProfile.experience_years >= 3, AthleteProfile.experience_years <= 5)
        elif exp_lower == "advanced":
            query_obj = query_obj.filter(AthleteProfile.experience_years >= 6)

    athletes = query_obj.all()

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
            name_match = q.lower() in (athlete.user.full_name if athlete.user else "").lower()
            loc_match = q.lower() in (athlete.location or "").lower()
            pos_match = q.lower() in (athlete.position or "").lower()
            if not (name_match or loc_match or pos_match):
                continue

        card = _athlete_card(athlete, latest, athlete.id in shortlisted_ids)
        result.append(card)

    return result


class CompareRequest(BaseModel):
    athlete_ids: list[int]


@router.post("/compare")
def compare_athletes(body: CompareRequest, user: User = Depends(require_coach), db: Session = Depends(get_db)):
    shortlisted_ids = {
        r.athlete_id
        for r in db.query(Shortlist.athlete_id).filter(Shortlist.coach_id == user.id).all()
    }
    result = []
    for athlete_id in body.athlete_ids:
        athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
        if not athlete:
            continue
        latest = db.query(Analysis).filter(Analysis.athlete_id == athlete.id).order_by(Analysis.id.desc()).first()
        card = _athlete_card(athlete, latest, athlete.id in shortlisted_ids)
        if latest:
            card.update({
                "speed": latest.running_technique_score or 65,
                "balance": latest.symmetry_score or 70,
                "technique": latest.posture_score or 65,
                "posture": latest.posture_score or 65,
                "arm_movement": latest.arm_movement_score or 60,
                "leg_movement": latest.leg_movement_score or 75,
                "body_alignment": latest.body_alignment_score or 70,
                "running_technique": latest.running_technique_score or 65,
                "symmetry": latest.symmetry_score or 70,
                "strengths": _json_load(latest.strengths_json) or ["Sprint Acceleration", "Upright Form"],
                "weaknesses": _json_load(latest.weaknesses_json),
            })
        else:
            card.update({
                "speed": 65, "balance": 70, "technique": 65,
                "posture": 65, "arm_movement": 60, "leg_movement": 75,
                "body_alignment": 70, "running_technique": 65, "symmetry": 70,
                "strengths": ["Sprint Acceleration", "Upright Form"], "weaknesses": []
            })
        result.append(card)
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

    # Notify athlete user for popup animation upon login
    notif = Notification(
        user_id=athlete.user_id,
        icon="🌟",
        title=f"You've been Shortlisted by Coach {user.full_name}!",
        body=f"Coach {user.full_name} has shortlisted your profile for upcoming recruitment evaluations.",
        category="coach",
        is_read=False,
    )
    db.add(notif)
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
    subject: str | None = None
    message: str | None = None
    trial_id: int | None = None


@router.post("/invite/{athlete_id}", status_code=status.HTTP_201_CREATED)
def send_invite(
    athlete_id: int,
    body: InviteBody,
    user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    athlete = (
        db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
        or db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
    )
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found.")

    subject_str = body.subject or "Official Sprint & Track Trial Invitation"
    inv = Invitation(
        coach_id=user.id,
        athlete_id=athlete.id,
        trial_id=body.trial_id,
        subject=subject_str,
        message=body.message or "You're invited to attend an official sprinting trial and recruitment evaluation.",
        status="pending",
    )
    db.add(inv)

    # Notify athlete
    notif = Notification(
        user_id=athlete.user_id,
        icon="📨",
        title=f"Trial invitation from {user.full_name}",
        body=f"{user.full_name} sent you a trial invitation: \"{subject_str}\"",
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

        result.append({
            "id": inv.id,
            "athlete_name": athlete.user.full_name if (athlete and athlete.user) else "Athlete",
            "athlete_email": athlete.user.email if (athlete and athlete.user) else "",
            "athlete_id": inv.athlete_id,
            "subject": inv.subject or "Official Sprint & Track Trial Invitation",
            "message": inv.message or "",
            "status": inv.status or "pending",
            "read_at": inv.read_at.strftime("%b %d, %Y %I:%M %p") if inv.read_at else None,
            "trial_id": inv.trial_id,
            "date": inv.created_at.strftime("%b %d, %Y %I:%M %p") if inv.created_at else "",
            "response": resp_dict,
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
