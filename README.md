# TalentTrack AI

AI-powered sports talent identification, athlete performance analysis, and recruitment platform.

> **Vision:** Many talented athletes from villages, schools and small communities
> never get opportunities because there aren't enough scouts and coaches.
> TalentTrack AI helps athletes **Analyze → Learn → Improve → Track → Showcase → Get Recruited**,
> and helps coaches discover, evaluate and recruit them.

## Core Product Principle

The platform is **sport-aware**. If an athlete plays Cricket, they see Cricket
analysis, Cricket training, Cricket videos, Cricket trials and Cricket coaches —
never unrelated sports. The sport catalog is **database-driven**; the frontend
never hardcodes the sport list.

Not every sport has an AI module yet. The DB marks `ai_analysis_available`
per sport. Sports without an AI module show **"AI analysis for this sport is
coming soon"** — the system never fabricates analysis.

## Features (by portal)

### Player portal (`/player/*`)
- Register, login, create profile, select primary sport
- Upload practice videos with drag & drop and a step-by-step processing UI
- Sport detection + sport-specific AI performance report (metrics, strengths, weaknesses) 
- Injury risk estimate (clearly labelled as training-awareness, not medical diagnosis)
- Growth timeline, own-video comparison, training plan
- Sport-filtered learning recommendations + reference video library
- Athlete portfolio, AI resume generator, skill badges
- Relevant trials & scholarships, notifications

### Coach portal (`/coach/*`)
- Recruitment dashboard with a recruitment funnel
- All athletes, search & filters (sport, age, gender, location, score…)
- AI talent recommendation engine (match % vs. a recruitment requirement)
- Full athlete reports, multi-athlete comparison, shortlist, invitations
- Recruitment analytics

### Academy (`/academy/*`)
- Create & publish trials, manage applications, shortlist/select/reject

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React, Vite, TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts |
| Backend   | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Database  | PostgreSQL (Neon in deployment; SQLite for zero-setup local dev) |
| AI        | Python, OpenCV, MediaPipe Pose, Scikit-Learn |
| Storage   | Cloudinary |
| Deploy    | Vercel (frontend), Render (backend), Neon (DB) |


## Repository Structure

```
talenttrack/
├── frontend/            # React + Vite + TypeScript app
│   ├── src/
│   │   ├── components/  # shared UI kit (Card, Ring, Progress, Layout…)
│   │   ├── pages/       # player/, coach/, auth, landing, settings
│   │   ├── data/        # demo mock data (will be replaced by API calls)
│   │   ├── context/     # AthleteContext (sport personalization)
│   │   └── styles/
│   └── ...
└── backend/             # FastAPI + SQLAlchemy + Alembic
    ├── app/
    │   ├── api/         # routers (health, auth, sports, athletes, …)
    │   ├── models/      # SQLAlchemy ORM models
    │   ├── data/        # seed catalogs (sport catalog source of truth)
    │   └── config.py    # pydantic-settings (env-driven)
    ├── scripts/
    │   └── init_db.py   # create tables + seed roles & sports (idempotent)
    ├── requirements.txt
    ├── .env.example
    └── .venv/           # Python virtual environment
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (optional for local dev — SQLite is the default)

---

## 💻 How to Run in VS Code (Visual Studio Code)

Follow these simple steps to run both the Backend and Frontend servers in VS Code:

### Option 1: Using VS Code Integrated Terminals (Recommended)

1. **Open VS Code** in the project root directory (`TalentTrack-AI`).

2. **Start Backend Server (Terminal 1)**:
   - Open a terminal in VS Code: `Ctrl + ~` (or **Terminal** → **New Terminal**).
   - Run the following commands:
     ```bash
     cd backend
     ..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
     ```
   - *Backend server runs live at:* `http://127.0.0.1:8000` (Swagger API Docs at `http://127.0.0.1:8000/docs`).

3. **Start Frontend Server (Terminal 2)**:
   - Click the `+` button in the VS Code terminal panel to open a **Second Terminal**.
   - Run the following commands:
     ```bash
     cd frontend
     npm run dev
     ```
   - *Frontend web app runs live at:* `http://localhost:5173` (or `http://localhost:3000`).

4. **Open Application in Browser**:
   - Navigate to `http://localhost:5173` in your web browser.

---

### Option 2: Using VS Code Tasks

1. Press `Ctrl + Shift + P` in VS Code to open the Command Palette.
2. Type `Tasks: Run Task` and press `Enter`.
3. Select **Start Backend (FastAPI)**.
4. Press `Ctrl + Shift + P` again, select `Tasks: Run Task`, and choose **Start Frontend (Vite)**.

---

### Manual Setup Steps

### 1. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc --noEmit && vite build
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

cp .env.example .env            # then edit DATABASE_URL / secrets
python scripts/init_db.py       # create tables + seed roles & 53 sports
uvicorn main:app --host 127.0.0.1 --port 8000 --reload   # http://127.0.0.1:8000
```

The backend runs out of the box on SQLite. To use PostgreSQL, set
`DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname` in `.env`
(works with Neon by adding `?sslmode=require`).

### 3. Environment variables (backend `.env`)

```
DATABASE_URL=sqlite:///./talenttrack.db
JWT_SECRET=<generate with: openssl rand -hex 32>
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit real secrets. `.env` is git-ignored; `.env.example` documents them.

## Development Phases

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | ✅ done | Repo structure, backend foundation (FastAPI + DB + config), sport catalog seed, health API |
| 2 | ⏭ next | Auth — register, login, JWT, roles, protected routes |
| 3 | pending | Sport system API (list, filters, sport-specific config) |
| 4 | pending | Player portal (profile, upload, analysis, growth, training, learning, portfolio, resume, trials) |
| 5 | pending | Coach portal (dashboard, all players, search, filters, reports, compare, shortlist, invitations) |
| 6 | pending | Academy portal (trials, applications, selection) |
| 7 | pending | AI MVP (frame extraction, pose landmarks, sport-specific metrics, report) |
| 8 | pending | Recommendation engine (weakness → reference videos, sport filtering) |
| 9 | pending | Analytics (growth charts, recruitment analytics, comparisons) |
| 10 | pending | Testing & security (auth, authorization, ownership, validation) |
| 11 | pending | Deployment (Vercel + Render + Neon + Cloudinary) |

## AI Development Strategy

Built in phases — starting with an MVP, not a huge model trained from scratch:

1. Video upload → frame extraction → pose landmarks → rule-based metrics → report
2. Sport-specific analysis modules (cricket, football, kabaddi, basketball, volleyball, athletics…)
3. ML models (scikit-learn) on collected data
4. Improvement prediction
5. Recommendation ranking
6. Advanced sport recognition

### AI honesty rules
- If a metric cannot be reliably computed, return `"Not enough data"` — never fabricate.
- Injury risk is a prototype risk-assistance feature: *"for training-awareness
  purposes only and is not a medical diagnosis."*
- Career level predictions are labelled *"AI-based performance estimate."*
- Seed/demo AI reports are clearly marked as demo data.

## Security Model

- JWT auth + role-based authorization enforced in the **backend**, never only in the UI.
- Ownership checks on every endpoint: a player can only ever read their own
  analyses/videos/portfolio; changing an ID in the URL cannot leak another
  athlete's private data.

## Testing

Backend: `pytest` suites for auth, authorization, ownership, sport filtering,
trial applications, shortlisting and analytics (Phase 10).

## Deployment

- Frontend → Vercel (`frontend/`)
- Backend → Render (`backend/`, serves FastAPI via uvicorn)
- Database → Neon PostgreSQL
- Media → Cloudinary (videos stored by URL/public id, never blobs in Postgres)
