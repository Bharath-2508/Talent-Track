import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(project_root, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.database import SessionLocal, engine, Base
from app.models import User, Role, RoleName
from app.models.profile import AthleteProfile
from app.models.video import Video
from app.models.analysis import Analysis
from app.api.analyze import _run_analysis

def test_integration():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        player_role = db.query(Role).filter(Role.name == "PLAYER").first()
        if not player_role:
            player_role = Role(name="PLAYER")
            db.add(player_role)
            db.commit()

        user = db.query(User).filter(User.email == "test_athlete@example.com").first()
        if not user:
            user = User(
                email="test_athlete@example.com",
                password_hash="fakehash",
                full_name="Test Athlete",
                role_id=player_role.id,
                is_active=True
            )
            db.add(user)
            db.commit()

        athlete = db.query(AthleteProfile).filter(AthleteProfile.user_id == user.id).first()
        if not athlete:
            athlete = AthleteProfile(user_id=user.id)
            db.add(athlete)
            db.commit()

        # Copy a sample video to temp_uploads for testing
        test_video_source = os.path.join(project_root, "assets", "Running Posture Analysis Dataset", "Runner1 - 9km_h - Trim_norm.MOV")
        temp_dir = os.path.join(backend_dir, "temp_uploads")
        os.makedirs(temp_dir, exist_ok=True)
        test_video_dest = os.path.join(temp_dir, "test_sample.mov")
        
        import shutil
        shutil.copyfile(test_video_source, test_video_dest)

        video = Video(
            athlete_id=athlete.id,
            original_filename="Runner1 - 9km_h - Trim_norm.MOV",
            stored_filename="test_sample.mov",
            file_path=test_video_dest,
            file_size_mb=10.0,
            status="pending"
        )
        db.add(video)
        db.commit()

        print(f"Created test video id {video.id} for athlete id {athlete.id}")
        
        # Run background analysis synchronously
        _run_analysis(video.id, athlete.id, user.id)

        # Check analysis in database
        analysis = db.query(Analysis).filter(Analysis.video_id == video.id).first()
        assert analysis is not None, "Analysis record not created!"
        print(f"SUCCESS: Analysis created with id {analysis.id}, score: {analysis.overall_score}/100")
    finally:
        db.close()

if __name__ == "__main__":
    test_integration()
