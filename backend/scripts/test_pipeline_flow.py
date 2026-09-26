"""Test End-To-End Video Upload, AI Analysis, Temporary Video Cleanup, and Comparison Flow."""
import os
import sys
import shutil
import tempfile
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))
sys.path.append(str(backend_dir.parent / "src"))

from app.database import SessionLocal, engine, Base
from app.models.user import User, Role
from app.models.profile import AthleteProfile
from app.models.video import Video
from app.models.analysis import Analysis
from app.api.analyze import _run_analysis

# Re-create database tables
Base.metadata.create_all(bind=engine)

def main():
    db = SessionLocal()
    try:
        # Create test user & athlete profile if not exists
        player_role = db.query(Role).filter(Role.name == "PLAYER").first()
        if not player_role:
            player_role = Role(name="PLAYER", description="Player Role")
            db.add(player_role)
            db.commit()
            db.refresh(player_role)

        user = db.query(User).filter(User.email == "test_athlete@talenttrack.ai").first()
        if not user:
            user = User(
                email="test_athlete@talenttrack.ai",
                password_hash="hashedpassword123",
                full_name="Test Athlete Runner",
                role_id=player_role.id,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        athlete = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
        if not athlete:
            athlete = AthleteProfile(
                user_id=user.id,
                gender="Male",
                location="Bengaluru",
                position="Sprinter",
                age=20,
                experience_years=3
            )
            db.add(athlete)
            db.commit()
            db.refresh(athlete)

        print(f"=== TEST ATHLETE ID: {athlete.id} (User: {user.full_name}) ===")

        # Clean existing test data for clean verification
        db.query(Analysis).filter(Analysis.athlete_id == athlete.id).delete()
        db.query(Video).filter(Video.athlete_id == athlete.id).delete()
        db.commit()

        dataset_dir = backend_dir.parent / "assets" / "Running Posture Analysis Dataset"
        sample_videos = [
            dataset_dir / "Axl-8kmh - Trim_norm.MOV",
            dataset_dir / "Axl-10kmh - Trim_norm.MOV",
            dataset_dir / "Axl-12kmh - Trim_norm.MOV"
        ]

        temp_dir = backend_dir / "temp_uploads"
        temp_dir.mkdir(parents=True, exist_ok=True)

        for idx, src_video in enumerate(sample_videos, 1):
            print(f"\n------------------------------------------------------------")
            print(f"STEP {idx}: Uploading Video {idx} ({src_video.name})")
            print(f"------------------------------------------------------------")

            # 1. Copy sample video into temporary upload path
            temp_filename = f"test_temp_v{idx}_{src_video.name}"
            temp_filepath = temp_dir / temp_filename
            shutil.copy(src_video, temp_filepath)

            print(f"Temporary file created: {temp_filepath}")
            print(f"Temporary file exists before analysis: {os.path.exists(temp_filepath)}")

            # 2. Record video in DB
            video = Video(
                athlete_id=athlete.id,
                original_filename=src_video.name,
                stored_filename=temp_filename,
                file_path=str(temp_filepath),
                file_size_mb=round(os.path.getsize(temp_filepath) / (1024 * 1024), 2),
                status="pending"
            )
            db.add(video)
            db.commit()
            db.refresh(video)

            video_id = video.id
            print(f"Video recorded in DB with ID: {video_id}")

            # 3. Run Analysis & Cleanup Pipeline
            print(f"Running AI analysis pipeline for Video ID {video_id}...")
            _run_analysis(video_id, athlete.id, user.id)

            # 4. Verify temporary video deletion
            exists_after = os.path.exists(temp_filepath)
            print(f"Temporary file exists after analysis: {exists_after}")
            assert not exists_after, f"FAILURE: Temporary file {temp_filepath} was not deleted!"
            print(f"[SUCCESS] Temporary video file successfully deleted!")

            # 5. Retrieve saved analysis report from DB
            analysis = db.query(Analysis).filter(Analysis.video_id == video_id).first()
            assert analysis is not None, f"FAILURE: Analysis for video {video_id} was not saved!"

            import json
            comp = json.loads(analysis.comparison_json) if analysis.comparison_json else {}

            print(f"\n--- REPORT RESULT FOR VIDEO {idx} ---")
            print(f"Overall Score: {analysis.overall_score}/100")
            print(f"Posture Score: {analysis.posture_score}")
            print(f"Arm Movement Score: {analysis.arm_movement_score}")
            print(f"Leg Movement Score: {analysis.leg_movement_score}")
            print(f"Body Alignment Score: {analysis.body_alignment_score}")
            print(f"Technique Score: {analysis.running_technique_score}")
            print(f"Symmetry Score: {analysis.symmetry_score}")
            print(f"Movement Similarity: {analysis.movement_similarity}")

            print(f"\n--- COMPARISON RESULT ---")
            print(f"Has Previous: {comp.get('has_previous')}")
            if comp.get('has_previous'):
                print(f"Previous Score: {comp.get('previous_score')}")
                print(f"Current Score: {comp.get('current_score')}")
                print(f"Score Difference: {comp.get('score_difference')}")
                print(f"Improvements: {comp.get('improvements')}")
                print(f"Weaker Areas: {comp.get('areas_that_became_weaker')}")
                print(f"Summary: {comp.get('progress_summary')}")
            else:
                print(f"Message: {comp.get('message')}")

            # Verify comparison rules
            if idx == 1:
                assert comp.get('has_previous') is False, "Video 1 should have no previous report!"
                print("[SUCCESS] Video 1 correctly identified as first assessment (has_previous = False).")
            elif idx == 2:
                assert comp.get('has_previous') is True, "Video 2 must compare against Video 1!"
                print(f"[SUCCESS] Video 2 correctly compared against Video 1 report!")
            elif idx == 3:
                assert comp.get('has_previous') is True, "Video 3 must compare against Video 2!"
                print(f"[SUCCESS] Video 3 correctly compared against Video 2 report!")

        print("\n============================================================")
        print("[SUCCESS] ALL END-TO-END PIPELINE VERIFICATIONS PASSED SUCCESSFULLY!")
        print("============================================================")

    finally:
        db.close()

if __name__ == "__main__":
    main()
