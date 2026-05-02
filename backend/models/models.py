from sqlalchemy import Column, String, Float, Integer, Boolean,ForeignKey, UniqueConstraint, Text,DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from backend.core.database import Base


# ───────────── USERS ─────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    age = Column(Integer)
    phone = Column(String(20))

    city = Column(String(100))
    location = Column(String(100))

    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), default="user")  # user / doctor / admin

    image = Column(String(255))

    # relations
    ratings = relationship("Rating", back_populates="user")
    predictions = relationship("PredictionHistory", back_populates="user")


# ───────────── DOCTORS ─────────────
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    specialty = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)   # ← ajoute ça

    city = Column(String(100))
    location = Column(Text)


    image = Column(String(255))

    avg_rating = Column(Float, default=0)
    rating_count = Column(Integer, default=0)   # NOUVEAU
    scraped_avg_rating = Column(Float, default=0)
    scraped_rating_count = Column(Integer, default=0)
    # relations
    ratings = relationship("Rating", back_populates="doctor")


# ───────────── RATINGS ─────────────
class Rating(Base):
    __tablename__ = "ratings"

    __table_args__ = (
        UniqueConstraint("user_id", "doctor_id", name="unique_user_doctor"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)

    score = Column(Integer, nullable=False)  # 1 → 5 ⭐
    comment = Column(String(255))

    is_external = Column(Boolean, default=False)  # 🔥 AJOUTER CETTE LIGNE

    # relations
    user = relationship("User", back_populates="ratings")
    doctor = relationship("Doctor", back_populates="ratings")


class Maladie(Base):
    __tablename__ = "maladie"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    nom         = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)   # ← ajoute ça

    # relations
    soins = relationship("Soin", back_populates="maladie")
    predictions = relationship("PredictionHistory", back_populates="maladie")  # ← AJOUTER


class Soin(Base):
    __tablename__ = "soin"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    maladie_id   = Column(Integer, ForeignKey("maladie.id"), nullable=False)
    titre        = Column(String(150), nullable=False)
    instructions = Column(Text)
    type         = Column(String(50))   # "hygiène", "traitement", "prévention"

    maladie  = relationship("Maladie", back_populates="soins")
    produits = relationship("SoinProduit", back_populates="soin")


class Produit(Base):
    __tablename__ = "produit"
    id            = Column(Integer, primary_key=True, autoincrement=True)
    nom           = Column(String(150), nullable=False)
    type          = Column(String(50))   # "crème", "pommade", "lotion", "comprimé"
    description   = Column(Text)
    usage_conseil = Column(Text)

    soins = relationship("SoinProduit", back_populates="produit")


class SoinProduit(Base):
    __tablename__ = "soin_produit"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    soin_id    = Column(Integer, ForeignKey("soin.id"), nullable=False)
    produit_id = Column(Integer, ForeignKey("produit.id"), nullable=False)

    soin    = relationship("Soin", back_populates="produits")
    produit = relationship("Produit", back_populates="soins")


class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    maladie_id = Column(Integer, ForeignKey("maladie.id"), nullable=False)  # ← Clé étrangère
    image_path = Column(String(500))
    predicted_disease = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    all_probabilities = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="predictions")
    maladie = relationship("Maladie", back_populates="predictions")  # ← Lien