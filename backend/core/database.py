from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# ───────────── DATABASE URL ─────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:sallamiarij123*@localhost:5432/skin_disease_db"
)

# ───────────── ENGINE ─────────────
engine = create_engine(DATABASE_URL)

# ───────────── SESSION ─────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ───────────── BASE ─────────────
Base = declarative_base()

# ───────────── DEPENDENCY ─────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()