"""Database migration script for invitation updates."""
from sqlalchemy import text, inspect
from app.database import engine, Base
import app.models  # load models

def sync():
    with engine.connect() as conn:
        inspector = inspect(engine)
        cols = [c['name'] for c in inspector.get_columns('invitations')]
        if 'subject' not in cols:
            conn.execute(text("ALTER TABLE invitations ADD COLUMN subject VARCHAR(200) DEFAULT 'Official Sprint & Track Trial Invitation'"))
            print("Added subject column to invitations")
        if 'read_at' not in cols:
            conn.execute(text("ALTER TABLE invitations ADD COLUMN read_at DATETIME"))
            print("Added read_at column to invitations")
        conn.commit()

    Base.metadata.create_all(bind=engine)
    print("Database synced successfully.")

if __name__ == "__main__":
    sync()
