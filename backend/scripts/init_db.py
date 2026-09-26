"""Initialize the database schema and seed essential data.

Idempotent - safe to run multiple times.

Usage (from backend/):
    python scripts/init_db.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.data.sports import SPORTS
from app.models import Role, RoleName, Sport
from app.models.trial import Trial


def seed_roles(db: Session) -> None:
    for role in RoleName:
        existing = db.query(Role).filter(Role.name == role.value).first()
        if not existing:
            db.add(Role(name=role.value, description=f"{role.value} role"))
    db.commit()


def seed_sports(db: Session) -> None:
    count = 0
    for s in SPORTS:
        existing = db.query(Sport).filter(Sport.slug == s.slug).first()
        if not existing:
            db.add(
                Sport(
                    name=s.name,
                    slug=s.slug,
                    category=s.category,
                    description=s.description,
                    icon_key=s.icon_key,
                    ai_analysis_available=s.ai_analysis_available,
                )
            )
            count += 1
    db.commit()
    print(f"Sports seeded: {count} new, {len(SPORTS)} in catalog.")


def seed_trials(db: Session) -> None:
    """Seed 4 demo running trials if none exist yet."""
    if db.query(Trial).count() > 0:
        print("Trials already seeded.")
        return

    from app.models import User
    # Use first admin/coach user if available, else skip
    admin_user = db.query(User).first()
    if not admin_user:
        print("No users yet — trials will be seeded on first coach registration.")
        return

    demo_trials = [
        Trial(posted_by_id=admin_user.id, name="District 100m Sprinter Trials",   age_group="U-19",  location="Chennai",      date="Aug 22, 2027", org="SDAT",                        eligibility="District level, AI score 75+", positions=12, sport_slug="athletics"),
        Trial(posted_by_id=admin_user.id, name="State Sprint Camp – U-19",         age_group="U-19",  location="Coimbatore",   date="Sep 05, 2027", org="Sports Development Authority", eligibility="Any district, AI score 70+",   positions=20, sport_slug="athletics"),
        Trial(posted_by_id=admin_user.id, name="U-20 Sprint Combine",              age_group="U-20",  location="Patiala",      date="Oct 20, 2027", org="AFI",                         eligibility="100m under 11.2s",             positions=30, sport_slug="athletics"),
        Trial(posted_by_id=admin_user.id, name="Club Track & Field Selection",     age_group="Open",  location="Delhi",        date="Oct 02, 2027", org="Delhi Athletics Club",        eligibility="District level",               positions=15, sport_slug="athletics"),
    ]
    db.add_all(demo_trials)
    db.commit()
    print(f"Seeded {len(demo_trials)} demo trials.")


def main() -> None:
    print("Recreating database tables with updated schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db: Session = SessionLocal()
    try:
        seed_roles(db)
        seed_sports(db)
        seed_trials(db)
    finally:
        db.close()

    print("Database initialization complete.")


if __name__ == "__main__":
    main()
