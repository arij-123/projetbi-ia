# backend/api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import User, Doctor
from backend.core.auth import get_current_user
from backend.core.security import hash_password
from sqlalchemy import func
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])

def is_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé - Admin requis")
    return True

# ─────────────────────────────────────
# 📋 LISTE DES UTILISATEURS
# ─────────────────────────────────────
@router.get("/users")
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin(current_user)
    users = db.query(User).filter(User.role == "user").all()
    return {
        "total": len(users),
        "users": [
            {
                "id": str(u.id),
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "role": u.role,
                "age": u.age,
                "phone": u.phone,
                "city": u.city
            }
            for u in users
        ]
    }

# ─────────────────────────────────────
# ➕ AJOUTER UN UTILISATEUR (POST)
# ─────────────────────────────────────
@router.post("/users")  # ← Assurez-vous que c'est bien POST
async def create_user(
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin(current_user)
    
    # Vérifier si l'email existe déjà
    existing = db.query(User).filter(User.email == user_data["email"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Créer le nouvel utilisateur
    new_user = User(
        id=uuid.uuid4(),
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        email=user_data["email"],
        password_hash=hash_password(user_data["password"]),
        role=user_data.get("role", "user"),
        age=user_data.get("age"),
        phone=user_data.get("phone"),
        city=user_data.get("city"),
        location=user_data.get("location")
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Utilisateur créé avec succès",
        "user": {
            "id": str(new_user.id),
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

# ─────────────────────────────────────
# 🗑️ SUPPRIMER UN UTILISATEUR
# ─────────────────────────────────────
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin(current_user)
    
    from uuid import UUID
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.delete(user)
    db.commit()
    
    return {"message": "Utilisateur supprimé"}

# ─────────────────────────────────────
# 📊 STATISTIQUES
# ─────────────────────────────────────
@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin(current_user)
    
    total_users = db.query(User).filter(User.role == "user").count()
    total_doctors = db.query(Doctor).count()
    
    return {
        "total_users": total_users,
        "total_doctors": total_doctors
    }

@router.put("/users/{user_id}")  # Note: removed "/admin" prefix
async def update_user(
    user_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_admin(current_user)
    
    from uuid import UUID
    try:
        user = db.query(User).filter(User.id == UUID(user_id)).first()
    except ValueError:
        raise HTTPException(400, "Invalid user ID format")
    
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    
    # Update fields
    user.first_name = data.get("first_name", user.first_name)
    user.last_name  = data.get("last_name",  user.last_name)
    user.age        = data.get("age",         user.age)
    user.phone      = data.get("phone",       user.phone)
    user.city       = data.get("city",        user.city)
    user.location   = data.get("location",    user.location)
    user.email      = data.get("email",       user.email)
    user.role       = data.get("role",        user.role)
    
    if data.get("password"):
        user.password_hash = hash_password(data["password"])
    
    db.commit()
    db.refresh(user)  # Good practice to refresh after commit
    
    return {
        "message": "Utilisateur mis à jour",
        "user": {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role
        }
    }