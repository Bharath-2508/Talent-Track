"""Report builder — converts raw analyzer output into the full structured report.

Generates:
- 7-day training plan (based on weakest metrics)
- Learning video recommendations
- Injury risk estimate (training-awareness only — not medical diagnosis)
- Career potential levels
- Skill badges
- Growth timeline entry
"""
from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Any

# ── Training drills mapped to metrics ─────────────────────────────────────────

DRILLS: dict[str, list[dict]] = {
    "Posture": [
        {"day": "Monday",    "focus": "Upright sprint posture",   "type": "Technique",  "emoji": "🏃", "intensity": "Medium"},
        {"day": "Thursday",  "focus": "Core and posture strength", "type": "Strength",   "emoji": "💪", "intensity": "High"},
    ],
    "Arm Movement": [
        {"day": "Tuesday",   "focus": "Arm drive mechanics",      "type": "Drill",      "emoji": "💪", "intensity": "Medium"},
        {"day": "Friday",    "focus": "Resistance arm swings",    "type": "Strength",   "emoji": "⚡", "intensity": "High"},
    ],
    "Leg / Knee Movement": [
        {"day": "Wednesday", "focus": "Knee drive wall drills",   "type": "Drill",      "emoji": "🦵", "intensity": "High"},
        {"day": "Saturday",  "focus": "High-knee plyometrics",    "type": "Plyometric", "emoji": "🚀", "intensity": "High"},
    ],
    "Body Alignment": [
        {"day": "Monday",    "focus": "Single-leg balance drills","type": "Balance",    "emoji": "⚖️", "intensity": "Low"},
        {"day": "Wednesday", "focus": "Core alignment work",      "type": "Strength",   "emoji": "🎯", "intensity": "Medium"},
    ],
    "Running Technique": [
        {"day": "Tuesday",   "focus": "Cadence ladder drills",    "type": "Technique",  "emoji": "🏃", "intensity": "Medium"},
        {"day": "Friday",    "focus": "Acceleration sprints",     "type": "Speed",      "emoji": "⚡", "intensity": "High"},
    ],
    "Movement Symmetry": [
        {"day": "Thursday",  "focus": "Left-right symmetry work", "type": "Drill",      "emoji": "⚖️", "intensity": "Medium"},
        {"day": "Saturday",  "focus": "Unilateral leg press",     "type": "Strength",   "emoji": "💪", "intensity": "High"},
    ],
}

DEFAULT_DAYS = [
    {"day": "Monday",    "focus": "Easy jog + technique",         "type": "Recovery",   "emoji": "🏃", "intensity": "Low"},
    {"day": "Sunday",    "focus": "Rest and mobility",            "type": "Rest",       "emoji": "😴", "intensity": "Low"},
]

RECS: dict[str, dict] = {
    "Posture": {
        "id": 1, "title": "Sprinting Front-Side Mechanics", "tag": "Technique",
        "desc": "Covers rail-to-front-side mechanics for stride and knee drive.",
        "icon": "🏃", "cta": "Watch now",
    },
    "Arm Movement": {
        "id": 2, "title": "Arm Drive & Posture Masterclass", "tag": "Posture",
        "desc": "Improves arm swing and torso posture for a stable sprint.",
        "icon": "💪", "cta": "Watch now",
    },
    "Leg / Knee Movement": {
        "id": 5, "title": "Knee Drive & Leg Recovery", "tag": "Leg / Knee",
        "desc": "Strengthens knee drive for longer, safer strides.",
        "icon": "🦵", "cta": "Watch now",
    },
    "Body Alignment": {
        "id": 6, "title": "Movement Symmetry & Form Correction", "tag": "Symmetry",
        "desc": "Improves left-right balance and reduces overstriding.",
        "icon": "⚖️", "cta": "Watch now",
    },
    "Running Technique": {
        "id": 4, "title": "Cadence & Stride Length Drills", "tag": "Cadence",
        "desc": "Increases step rate and optimal stride length.",
        "icon": "🏃", "cta": "Watch now",
    },
    "Movement Symmetry": {
        "id": 6, "title": "Movement Symmetry & Form Correction", "tag": "Symmetry",
        "desc": "Improves left-right balance and reduces overstriding.",
        "icon": "⚖️", "cta": "Watch now",
    },
}

BADGE_DEFS = [
    {"icon": "🏆", "name": "Rising Star",          "desc": "Overall score above 80",         "threshold_key": "overall", "threshold": 80},
    {"icon": "⚡", "name": "Speed Master",          "desc": "Running Technique score above 85","threshold_key": "Running Technique", "threshold": 85},
    {"icon": "🎯", "name": "Precision Expert",     "desc": "Technique above 85",              "threshold_key": "Posture", "threshold": 85},
    {"icon": "💪", "name": "Balance Expert",       "desc": "Symmetry score above 80",         "threshold_key": "Movement Symmetry", "threshold": 80},
    {"icon": "🦵", "name": "Knee Drive Champion",  "desc": "Knee score above 80",             "threshold_key": "Leg / Knee Movement", "threshold": 80},
    {"icon": "🚀", "name": "Pro Sprinter",         "desc": "Overall score above 90",          "threshold_key": "overall", "threshold": 90},
]


def build_report(
    analyzer_result: dict[str, Any],
    previous_scores: list[int],
    athlete_name: str = "Athlete",
) -> dict[str, Any]:
    """Build the complete assessment report from analyzer output.

    Args:
        analyzer_result: Output dict from running_analyzer.analyze_video()
        previous_scores: List of past overall scores (for growth chart)
        athlete_name: Athlete's display name

    Returns:
        Complete assessment dict matching AthleteStore.Assessment shape
    """
    overall = analyzer_result["overall_score"]
    metrics = analyzer_result["metrics"]
    strengths = analyzer_result["strengths"]
    weaknesses = analyzer_result["weaknesses"]

    metric_map = {m["label"]: m["value"] for m in metrics}

    # ── Training plan (7 days) ────────────────────────────────────────────────
    weak_keys = [w["name"] for w in weaknesses][:3]  # top 3 weakest
    plan_days: dict[str, dict] = {}
    for key in weak_keys:
        for drill in DRILLS.get(key, []):
            if drill["day"] not in plan_days:
                plan_days[drill["day"]] = drill
    for d in DEFAULT_DAYS:
        if d["day"] not in plan_days:
            plan_days[d["day"]] = d
    # Fill remaining days
    all_days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    for day in all_days:
        if day not in plan_days:
            plan_days[day] = {"day": day, "focus": "Active recovery", "type": "Recovery", "emoji": "🏃", "intensity": "Low"}
    training_plan = [plan_days[d] for d in all_days]

    # ── Learning recommendations ──────────────────────────────────────────────
    recommendations = []
    seen_ids = set()
    for key in weak_keys:
        rec = RECS.get(key)
        if rec and rec["id"] not in seen_ids:
            recommendations.append(rec)
            seen_ids.add(rec["id"])
    if not recommendations:
        recommendations = [RECS["Running Technique"]]

    # ── Badges ───────────────────────────────────────────────────────────────
    today = date.today().isoformat()
    badges = []
    for b in BADGE_DEFS:
        key = b["threshold_key"]
        value = overall if key == "overall" else metric_map.get(key, 0)
        earned = value >= b["threshold"]
        badges.append({
            "icon": b["icon"],
            "name": b["name"],
            "desc": b["desc"],
            "earned": earned,
            "date": today if earned else None,
        })

    # ── Growth chart ─────────────────────────────────────────────────────────
    all_scores = previous_scores + [overall]
    growth = []
    base_date = date.today()
    for i, score in enumerate(all_scores[-6:]):  # last 6 assessments
        month_date = base_date - timedelta(days=30 * (len(all_scores[-6:]) - 1 - i))
        growth.append({"month": month_date.strftime("%b"), "score": score})

    # ── Timeline ─────────────────────────────────────────────────────────────
    level = _career_level_label(overall)
    timeline = [{
        "month": date.today().strftime("%b %Y"),
        "score": overall,
        "skills": strengths[:3],
        "milestone": f"Reached {level} level",
    }]

    # ── Injury risk (training-awareness only) ────────────────────────────────
    asym = metric_map.get("Movement Symmetry", 80)
    knee = metric_map.get("Leg / Knee Movement", 80)
    risk = "Low"
    if asym < 55 or knee < 50:
        risk = "High"
    elif asym < 70 or knee < 65:
        risk = "Medium"

    injury = {
        "risk": risk,
        "areas": [
            {"name": "Hamstring", "level": "Low" if knee > 70 else "Medium", "dot": "#22d3ee"},
            {"name": "Knee",      "level": "Low" if knee > 75 else "High",   "dot": "#f59e0b"},
            {"name": "Achilles",  "level": "Low" if asym > 70 else "Medium", "dot": "#34d399"},
        ],
        "tips": [
            "Always warm up 10 min before sprinting",
            "Strengthen hip flexors to reduce knee stress",
            "Stretch hamstrings and calves post-session",
        ],
        "disclaimer": "This is an AI-based training-awareness estimate only and is not a medical diagnosis.",
    }

    # ── Career potential ──────────────────────────────────────────────────────
    career_potential = [
        {"level": "District",     "value": min(100, overall + 5),    "color": "#22d3ee"},
        {"level": "State",        "value": max(0, overall - 10),     "color": "#3d8bff"},
        {"level": "National",     "value": max(0, overall - 25),     "color": "#a855f7"},
        {"level": "International","value": max(0, overall - 40),     "color": "#f59e0b"},
    ]

    return {
        "overall_score": overall,
        "metrics": metrics,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "training_plan": training_plan,
        "badges": badges,
        "growth": growth,
        "timeline": timeline,
        "injury": injury,
        "career_potential": career_potential,
        "note": analyzer_result.get("note", ""),
    }


def _career_level_label(score: int) -> str:
    if score >= 85:
        return "National"
    if score >= 70:
        return "State"
    if score >= 55:
        return "District"
    return "Club"
