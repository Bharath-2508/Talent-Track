"""Analyze API — trigger AI analysis on an uploaded video and poll status."""
from __future__ import annotations

import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..ai.report_builder import build_report

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "src")))
from inference import InferencePipeline  # type: ignore

pipeline = InferencePipeline(
    model_dir=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")),
    output_dir=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "outputs"))
)

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


def compute_comparison(current_scores: dict, previous_analysis: Analysis | None) -> dict:
    """
    Compare current analysis scores vs previous analysis scores for the SAME authenticated athlete.
    """
    if not previous_analysis:
        return {
            "has_previous": False,
            "message": "This is your first running assessment. Previous comparison is not available yet.",
            "previous_score": None,
            "current_score": current_scores["overall_score"],
            "score_difference": 0,
            "metrics_comparison": [],
            "improvements": [],
            "areas_that_became_weaker": [],
            "progress_summary": "First assessment completed. Upload another video to track your progress!"
        }

    prev_overall = previous_analysis.overall_score
    curr_overall = current_scores["overall_score"]
    score_diff = curr_overall - prev_overall

    prev_metrics = {
        "Posture": previous_analysis.posture_score or 0,
        "Arm Movement": previous_analysis.arm_movement_score or 0,
        "Leg / Knee Movement": previous_analysis.leg_movement_score or 0,
        "Body Alignment": previous_analysis.body_alignment_score or 0,
        "Running Technique": previous_analysis.running_technique_score or 0,
        "Movement Symmetry": previous_analysis.symmetry_score or 0,
    }

    curr_metrics = {
        "Posture": current_scores["posture_score"],
        "Arm Movement": current_scores["arm_movement_score"],
        "Leg / Knee Movement": current_scores["leg_movement_score"],
        "Body Alignment": current_scores["body_alignment_score"],
        "Running Technique": current_scores["running_technique_score"],
        "Movement Symmetry": current_scores["symmetry_score"],
    }

    metrics_comp = []
    improvements = []
    weaker_areas = []

    for name in ["Posture", "Arm Movement", "Leg / Knee Movement", "Body Alignment", "Running Technique", "Movement Symmetry"]:
        p_val = prev_metrics[name]
        c_val = curr_metrics[name]
        diff = c_val - p_val
        metrics_comp.append({
            "metric": name,
            "previous": p_val,
            "current": c_val,
            "difference": diff,
            "status": "improved" if diff > 0 else "declined" if diff < 0 else "maintained"
        })
        if diff > 0:
            improvements.append(f"{name} (+{diff} pts)")
        elif diff < 0:
            weaker_areas.append(f"{name} ({diff} pts)")

    if score_diff > 0:
        summary = f"Overall score improved by +{score_diff} points compared to your previous assessment."
        if improvements:
            summary += f" Key gains in {', '.join(improvements[:2])}."
    elif score_diff < 0:
        summary = f"Overall score dropped by {score_diff} points compared to your previous assessment."
        if weaker_areas:
            summary += f" Areas needing work: {', '.join(weaker_areas[:2])}."
    else:
        summary = "Overall score maintained consistent level compared to your previous assessment."

    return {
        "has_previous": True,
        "previous_score": prev_overall,
        "current_score": curr_overall,
        "score_difference": score_diff,
        "metrics_comparison": metrics_comp,
        "improvements": improvements,
        "areas_that_became_weaker": weaker_areas,
        "progress_summary": summary
    }


from ..ai.video_validator import validate_running_video


def _run_analysis(video_id: int, athlete_id: int, user_id: int) -> None:
    """Background task — run AI analysis on temporary video file, save report, compare with previous, and delete temp file."""
    db: Session = SessionLocal()
    temp_video_path = None
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return

        temp_video_path = video.file_path

        log.info("[PIPELINE] ML inference started")

        # Query PREVIOUS analysis for SAME athlete BEFORE creating new report
        previous_analysis = (
            db.query(Analysis)
            .filter(Analysis.athlete_id == athlete_id)
            .order_by(Analysis.id.desc())
            .first()
        )

        previous_scores = [
            r[0] for r in db.query(Analysis.overall_score)
            .filter(Analysis.athlete_id == athlete_id)
            .order_by(Analysis.id.asc())
            .all()
        ]

        athlete = db.query(AthleteProfile).filter(AthleteProfile.id == athlete_id).first()
        name = athlete.user.full_name if (athlete and athlete.user) else "Athlete"

        # Check temporary video existence
        if not temp_video_path or not os.path.exists(temp_video_path):
            raise Exception(f"Temporary video file not found at {temp_video_path}")

        # Ensure ML models are loaded
        if not hasattr(pipeline, 'reference_features'):
            pipeline.load_models()

        # Run actual ML InferencePipeline on uploaded temporary video
        result = pipeline.analyze_video(temp_video_path)
        if "error" in result:
            raise ValueError(result["error"])

        def _norm(data):
            if not data or not isinstance(data, dict) or data.get("max_score", 1) == 0: return 0
            return int((data.get("score", 0) / data["max_score"]) * 100)

        def _map_weakness(w_obj):
            if isinstance(w_obj, dict):
                w_str = str(w_obj.get("name", "")).lower()
            else:
                w_str = str(w_obj).lower()

            if "posture" in w_str: return "Posture"
            if "arm" in w_str: return "Arm Movement"
            if "leg" in w_str or "knee" in w_str: return "Leg / Knee Movement"
            if "align" in w_str: return "Body Alignment"
            if "tech" in w_str: return "Running Technique"
            if "symm" in w_str: return "Movement Symmetry"
            return "Running Technique"

        posture_val = _norm(result.get("posture"))
        arm_val = _norm(result.get("arm_movement"))
        leg_val = _norm(result.get("leg_movement"))
        align_val = _norm(result.get("body_alignment"))
        tech_val = _norm(result.get("running_technique"))
        sym_val = _norm(result.get("symmetry"))
        overall_val = int(result.get("overall_score", 0))
        mov_sim = float(result.get("movement_similarity", 0.0))
        detection_rate = float(result.get("pose_detection_rate", 100.0))

        if overall_val == 0 or "note" in result or detection_rate < 15.0:
            raise ValueError(
                result.get("note") or f"Invalid practice video: Low pose detection rate ({detection_rate:.1f}%). Human running motion could not be detected. Please upload a clear sprint practice video showing full-body movement in good lighting."
            )

        raw = {
            "overall_score": overall_val,
            "metrics": [
                {"label": "Posture", "value": posture_val},
                {"label": "Arm Movement", "value": arm_val},
                {"label": "Leg / Knee Movement", "value": leg_val},
                {"label": "Body Alignment", "value": align_val},
                {"label": "Running Technique", "value": tech_val},
                {"label": "Movement Symmetry", "value": sym_val},
            ],
            "strengths": [str(s) for s in result.get("strengths", [])],
            "weaknesses": [{"name": _map_weakness(str(w)), "impact": "High impact"} for w in result.get("weaknesses", [])],
        }

        current_scores_dict = {
            "overall_score": overall_val,
            "posture_score": posture_val,
            "arm_movement_score": arm_val,
            "leg_movement_score": leg_val,
            "body_alignment_score": align_val,
            "running_technique_score": tech_val,
            "symmetry_score": sym_val,
        }

        comparison = compute_comparison(current_scores_dict, previous_analysis)
        report = build_report(raw, previous_scores, athlete_name=name)

        analysis_meta = {
            "pose_detection_rate": float(result.get("pose_detection_rate", 100.0)),
            "video_filename": str(video.original_filename),
            "movement_similarity": mov_sim,
        }

        # Save ONLY the analysis report/results to the database
        an = Analysis(
            video_id=video_id,
            athlete_id=athlete_id,
            overall_score=overall_val,
            posture_score=posture_val,
            arm_movement_score=arm_val,
            leg_movement_score=leg_val,
            body_alignment_score=align_val,
            running_technique_score=tech_val,
            symmetry_score=sym_val,
            movement_similarity=mov_sim,
            metrics_json=json.dumps(report["metrics"]),
            strengths_json=json.dumps(report["strengths"]),
            weaknesses_json=json.dumps(report["weaknesses"]),
            recommendations_json=json.dumps(report["recommendations"]),
            comparison_json=json.dumps(comparison),
            analysis_metadata_json=json.dumps(analysis_meta),
            training_plan_json=json.dumps(report["training_plan"]),
            badges_json=json.dumps(report["badges"]),
            growth_json=json.dumps(report["growth"]),
            timeline_json=json.dumps(report["timeline"]),
            injury_json=json.dumps(report["injury"]),
            career_json=json.dumps(report["career_potential"]),
        )
        db.add(an)

        video.status = "done"
        video.file_path = "[deleted after analysis]"
        video.stored_filename = "[deleted]"

        # Create notification for player
        notif = Notification(
            user_id=user_id,
            icon="📊",
            title="Your AI report is ready!",
            body=f"Running analysis complete — Overall score: {overall_val}/100",
            category="report",
            is_read=False,
        )
        db.add(notif)
        db.commit()

        log.info("Analysis complete for video %d — score %d", video_id, overall_val)
    except Exception as exc:
        log.exception("Analysis failed for video %d: %s", video_id, exc)
        try:
            db.rollback()
            video = db.query(Video).filter(Video.id == video_id).first()
            if video:
                video.status = "error"
                video.error_message = str(exc)
                video.file_path = "[deleted after analysis failure]"
                video.stored_filename = "[deleted]"
                db.commit()
        except Exception as rollback_err:
            log.error("Failed to set video status to error: %s", rollback_err)
    finally:
        # ABSOLUTE PRIVACY GUARANTEE: Delete uploaded video file from disk immediately
        if temp_video_path and os.path.exists(temp_video_path):
            try:
                os.remove(temp_video_path)
                log.info("Permanently deleted uploaded video file from disk: %s", temp_video_path)
            except Exception as del_err:
                log.warning("Failed to delete temp video %s: %s", temp_video_path, del_err)
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

    # SYNCHRONOUS PRE-PIPELINE VALIDATION
    validation_result = validate_running_video(video.file_path)

    if not validation_result.is_valid:
        temp_path = video.file_path
        video.status = "error"
        video.error_message = validation_result.rejection_reason
        video.file_path = "[deleted after validation failure]"
        video.stored_filename = "[deleted]"
        db.commit()

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                log.info("Deleted temporary invalid video file: %s", temp_path)
            except Exception as del_err:
                log.warning("Failed to delete temp invalid video %s: %s", temp_path, del_err)

        raise HTTPException(
            status_code=422,
            detail=validation_result.rejection_reason
        )

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
