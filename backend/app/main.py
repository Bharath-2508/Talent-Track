"""SportsVerse AI - FastAPI application entrypoint (PHASE 1 foundation).

Runnable immediately with:  uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.health import router as health_router
from .api.auth import router as auth_router
from .config import settings
from .database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup in development.

    Production uses Alembic migrations (added in a later phase); this hook
    only exists to keep the local dev experience friction-free.
    """
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent athlete discovery, performance analytics and recruitment platform.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} is running",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
