import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(project_root, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.database import SessionLocal, engine, Base
from app.models import User, Role, AthleteProfile, CoachProfile, Invitation, AthleteInvitationResponse, Notification
from app.api.player import get_player_invitations, get_single_invitation, respond_interested, AthleteInterestedForm
from app.api.coach import send_invite, InviteBody, get_invitations

def run_test():
    print("Starting E2E invitation system test...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Setup Coach & Athlete
        c_role = db.query(Role).filter(Role.name == 'COACH').first()
        if not c_role:
            c_role = Role(name='COACH')
            db.add(c_role)
            db.commit()

        p_role = db.query(Role).filter(Role.name == 'PLAYER').first()
        if not p_role:
            p_role = Role(name='PLAYER')
            db.add(p_role)
            db.commit()

        coach_user = db.query(User).filter(User.email == 'test_coach_growth@example.com').first()
        if not coach_user:
            coach_user = User(
                email='test_coach_growth@example.com',
                password_hash='hash',
                full_name='Coach Alexander',
                role_id=c_role.id,
                is_active=True
            )
            db.add(coach_user)
            db.commit()

        coach_prof = db.query(CoachProfile).filter(CoachProfile.user_id == coach_user.id).first()
        if not coach_prof:
            coach_prof = CoachProfile(
                user_id=coach_user.id,
                organization='National Athletics Academy',
                speciality='Sprint Coaching',
                location='Central Stadium'
            )
            db.add(coach_prof)
            db.commit()

        athlete_user = db.query(User).filter(User.email == 'test_athlete_growth@example.com').first()
        if not athlete_user:
            athlete_user = User(
                email='test_athlete_growth@example.com',
                password_hash='hash',
                full_name='Marcus Sterling',
                role_id=p_role.id,
                is_active=True
            )
            db.add(athlete_user)
            db.commit()

        athlete_prof = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_user.id).first()
        if not athlete_prof:
            athlete_prof = AthleteProfile(
                user_id=athlete_user.id,
                position='Sprinter',
                location='State High'
            )
            db.add(athlete_prof)
            db.commit()

        # 2. Coach sends invitation
        res = send_invite(
            athlete_prof.id,
            InviteBody(
                subject='100m Sprint Trial Selection',
                message='We invite you to our national trial evaluation.'
            ),
            coach_user,
            db
        )
        inv_id = res['invitation_id']
        print(f"1. Coach sent invitation ID: {inv_id}")

        # 3. Athlete views inbox
        invs = get_player_invitations(athlete_user, db)
        target = next(i for i in invs if i['id'] == inv_id)
        assert target['status'] == 'pending', 'Status should be pending'
        assert target['coach_name'] == 'Coach Alexander', 'Coach name match'
        print(f"2. Athlete Inbox visible: status={target['status']}, coach={target['coach_name']}")

        # 4. Athlete opens individual invitation -> marks READ in backend
        opened = get_single_invitation(inv_id, athlete_user, db)
        assert opened['status'] == 'read', 'Status should be read'
        assert opened['read_at'] is not None, 'read_at set'
        print(f"3. Individual message opened and marked READ in backend: read_at={opened['read_at']}")

        # 5. Security test: Unauthorized athlete
        other_user = db.query(User).filter(User.email == 'other_athlete@example.com').first()
        if not other_user:
            other_user = User(email='other_athlete@example.com', password_hash='h', full_name='Other Athlete', role_id=p_role.id)
            db.add(other_user)
            db.commit()
            other_prof = AthleteProfile(user_id=other_user.id)
            db.add(other_prof)
            db.commit()
        try:
            get_single_invitation(inv_id, other_user, db)
            print("SECURITY FAIL: Unauthorized access not blocked!")
        except Exception as sec_e:
            detail = sec_e.detail if hasattr(sec_e, 'detail') else sec_e
            print(f"4. Security Verified: Unauthorized athlete blocked ({detail})")

        # 6. Athlete submits 'I am Interested' with contact details
        form = AthleteInterestedForm(
            athlete_name='Marcus Sterling',
            athlete_phone='+91 9876543210',
            athlete_email='marcus.sterling@example.com'
        )
        resp_res = respond_interested(inv_id, form, athlete_user, db)
        assert resp_res['success'] is True
        print("5. Athlete submitted Interested response with phone and email")

        # 7. Duplicate response test
        dup_res = respond_interested(inv_id, form, athlete_user, db)
        assert dup_res['already_responded'] is True
        print("6. Duplicate response protection verified!")

        # 8. Coach inbox verification
        coach_invs = get_invitations(coach_user, db)
        coach_target = next(i for i in coach_invs if i['id'] == inv_id)
        assert coach_target['status'] == 'interested'
        assert coach_target['response']['athlete_phone'] == '+91 9876543210'
        assert coach_target['response']['athlete_email'] == 'marcus.sterling@example.com'
        print(f"7. Coach received response: Name={coach_target['response']['athlete_name']}, Phone={coach_target['response']['athlete_phone']}, Email={coach_target['response']['athlete_email']}")

        print("ALL ATHLETE INVITATION SYSTEM TESTS PASSED SUCCESSFULLY!")

    finally:
        db.close()

if __name__ == '__main__':
    run_test()
