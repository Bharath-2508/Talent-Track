"""Seed data catalog for the database-driven sport system.

This is the single source of truth for the sport catalog. It is loaded into
the `sports` table by `backend/scripts/init_db.py`. The frontend never
hardcodes sports - it reads them from the API.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class SportSeed:
    slug: str
    name: str
    category: str
    description: str
    icon_key: str
    ai_analysis_available: bool


SPORTS: list[SportSeed] = [
    SportSeed("athletics", "Athletics (Running/Sprinting)", "athletics", "Sprint speed, stride length, arm swing and posture analysis.", "athletics", True),
]
