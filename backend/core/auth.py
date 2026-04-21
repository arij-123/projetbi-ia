from datetime import datetime, timedelta
from jose import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import User

SECRET_KEY = "secret123"
ALGORITHM = "HS256"

oauth2_scheme = HTTPBearer()

def create_token(data: dict):
    to_encode = data.copy()
    to_encode.update({
        "user_id": data["user_id"],
        "exp": datetime.utcnow() + timedelta(hours=2)
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("user_id")
        
        if not user_email:
            raise HTTPException(401, "Invalid token")
        
        # 🔥 Récupérer l'utilisateur complet depuis la base
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(401, "User not found")
        
        return user  # ← Retourne l'objet User complet
        
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(401, "Invalid token")