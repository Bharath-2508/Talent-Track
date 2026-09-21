"""TalentTrack AI - FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api.health import router as health_router
from .api.auth import router as auth_router
from .api.player import router as player_router
from .api.analyze import router as analyze_router
from .api.coach import router as coach_router
from .config import settings
from .database import Base, engine

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="TalentTrack AI API",
    description="AI-powered running performance analysis, talent identification and recruitment platform.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving video files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router,   prefix=settings.API_V1_PREFIX)
app.include_router(player_router, prefix=settings.API_V1_PREFIX)
app.include_router(analyze_router, prefix=settings.API_V1_PREFIX)
app.include_router(coach_router,  prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": "TalentTrack AI API is running",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
        "version": "2.0.0",
    }
