from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn as nn
from torchvision import models
import io
import logging
from backend.core.schemas import UserRegister, UserLogin
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.models import User, Doctor, Maladie, Soin, Produit, SoinProduit, Rating, PredictionHistory
from backend.services.services import add_rating, update_doctor_rating, recommend, get_weighted_score_recommendations,get_bayesian_recommendations
from backend.core.security import hash_password, verify_password
from backend.core.auth import create_token, get_current_user
from backend.api.admin import router as admin_router
import json
from datetime import datetime

# ─────────────────────────────
# APP SETUP
# ─────────────────────────────
app = FastAPI(title="SkinAI API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLURE LES ROUTES ADMIN
app.include_router(admin_router)

# ROUTEUR PRINCIPAL
router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────
# CLASSES
# ─────────────────────────────
CLASS_NAMES = [
    "Atopic_Dermatitis", "Basal_Cell_Carcinoma", "Eczema", "Keratosis",
    "Melanocytic_Nevi", "Melanoma", "Psoriasis", "Tinea_Ringworm", "Warts_Molluscum"
]

# ─────────────────────────────
# MODEL
# ─────────────────────────────
def load_model():
    model = models.resnet50(weights=None)
    model.fc = nn.Sequential(nn.Dropout(0.4), nn.Linear(model.fc.in_features, 9))
    model.load_state_dict(torch.load("backend/model/final_model3.pth", map_location="cpu"))
    model.eval()
    return model

model = load_model()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ─────────────────────────────
# AUTH
# ─────────────────────────────
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"user_id": str(db_user.id)})   
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user.id), "first_name": db_user.first_name, "last_name": db_user.last_name,
            "email": db_user.email, "role": db_user.role, "age": db_user.age,
            "phone": db_user.phone, "city": db_user.city, "location": db_user.location, "image": db_user.image
        }
    }

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    new_user = User(
        first_name=user.first_name, last_name=user.last_name, age=user.age, phone=user.phone,
        city=user.city, location=user.location, email=user.email,
        password_hash=hash_password(user.password), role=user.role, image=user.image
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_token({"user_id": str(new_user.id)})
    return {"message": "User created successfully", "access_token": token, "token_type": "bearer"}

# ─────────────────────────────
# PREDICT
# ─────────────────────────────
@router.post("/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Le fichier doit être une image")
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        tensor = transform(image).unsqueeze(0)
        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            pred = int(torch.argmax(probs).item())
        probabilites = {CLASS_NAMES[i]: f"{float(probs[i]) * 100:.2f}%" for i in range(len(CLASS_NAMES))}
        probabilites = dict(sorted(probabilites.items(), key=lambda x: float(x[1][:-1]), reverse=True))
        predicted_disease = CLASS_NAMES[pred]
        confidence = float(probs[pred]) * 100
        try:
            maladie = db.query(Maladie).filter(Maladie.nom == predicted_disease).first()
            if not maladie:
                maladie = Maladie(nom=predicted_disease)
                db.add(maladie)
                db.flush()
            history = PredictionHistory(
                user_id=current_user.id, maladie_id=maladie.id, predicted_disease=predicted_disease,
                confidence=confidence, all_probabilities=json.dumps(probabilites, ensure_ascii=False),
                created_at=datetime.utcnow()
            )
            db.add(history)
            db.commit()
            print(f"✅ [HISTORIQUE] {current_user.email} a prédit: {predicted_disease} ({confidence:.1f}%)")
        except Exception as e:
            print(f"⚠️ [ERREUR] Sauvegarde historique: {e}")
            db.rollback()
        return {"success": True, "maladie": predicted_disease, "confiance": f"{confidence:.2f}%",
                "probabilites": probabilites, "maladie_id": pred, "maladie_nom": predicted_disease}
    except Exception as e:
        print(f"❌ Erreur prédiction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────
# HISTORIQUE
# ─────────────────────────────
@router.get("/predict/history")
async def get_prediction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    history = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id).order_by(PredictionHistory.created_at.desc()).all()
    result = []
    for h in history:
        result.append({
            "id": h.id, "maladie": h.predicted_disease, "confidence": h.confidence,
            "date": h.created_at.isoformat() if h.created_at else None,
            "all_probabilities": json.loads(h.all_probabilities) if h.all_probabilities else None
        })
    return {"user": f"{current_user.first_name} {current_user.last_name}", "total_predictions": len(result), "history": result}

@router.get("/predict/stats")
async def get_prediction_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    stats = db.query(PredictionHistory.predicted_disease, func.count(PredictionHistory.id).label('count'),
                     func.avg(PredictionHistory.confidence).label('avg_confidence')
    ).filter(PredictionHistory.user_id == current_user.id).group_by(PredictionHistory.predicted_disease).all()
    return {
        "user": f"{current_user.first_name} {current_user.last_name}",
        "total": sum(s.count for s in stats),
        "by_disease": [{"maladie": s.predicted_disease, "count": s.count, "avg_confidence": round(s.avg_confidence, 1)} for s in stats]
    }

# ─────────────────────────────
# RATINGS
# ─────────────────────────────
import uuid

@router.post("/ratings")
async def create_or_update_rating(
    rating_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        doctor_id = uuid.UUID(rating_data.get("doctor_id"))  # ✅ FIX
        score = rating_data.get("score")
        comment = rating_data.get("comment", "")

        if not score or not 1 <= score <= 5:
            raise HTTPException(status_code=400, detail="Score doit être entre 1 et 5")

        updated_doctor = add_rating(
            db=db,
            user_id=current_user.id,  # déjà UUID ✅
            doctor_id=doctor_id,
            score=score,
            comment=comment
        )

        return {
            "success": True,
            "doctor": {
                "id": str(updated_doctor.id),
                "avg_rating": updated_doctor.avg_rating,
                "rating_count": updated_doctor.rating_count
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────
# RECOMMENDATIONS
# ─────────────────────────────
@router.get("/recommend/{maladie_nom}")
async def get_recommendations(maladie_nom: str, limit: int = 5, db: Session = Depends(get_db)):

    # ───── DOCTEURS (Bayesian) ─────
    weighted_results = get_bayesian_recommendations(db=db, limit=limit)

    result_doctors = []

    for idx, item in enumerate(weighted_results, 1):
        doctor = item["doctor"]

        result_doctors.append({
            "id": str(doctor.id),
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "specialty": doctor.specialty,
            "city": doctor.city,
            "avg_rating": doctor.avg_rating or 0,
            "rating_count": doctor.rating_count or 0,
            "score": item.get("score"),
            "rank": idx
        })

    # ───── MALADIE (IMPORTANT) ─────
    maladie = db.query(Maladie).filter(Maladie.nom == maladie_nom).first()

    result_soins = []

    if maladie:
        soins = db.query(Soin).filter(Soin.maladie_id == maladie.id).all()

        for soin in soins:
            produits = db.query(Produit)\
                .join(SoinProduit, Produit.id == SoinProduit.produit_id)\
                .filter(SoinProduit.soin_id == soin.id)\
                .all()

            result_soins.append({
                "id": soin.id,
                "titre": soin.titre,
                "instructions": soin.instructions,
                "type": soin.type,
                "produits": [
                    {"id": p.id, "nom": p.nom, "type": p.type}
                    for p in produits
                ]
            })

    # ───── RETURN UNIQUE ─────
    return {
        "maladie": maladie_nom,
        "medecins": result_doctors,
        "soins": result_soins,
        "total_medecins": len(result_doctors),
        "total_soins": len(result_soins),
        "recommendation_method": "Bayesian Weighted Recommendation"
    }
# ─────────────────────────────
# DOCTORS
# ─────────────────────────────
@router.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()
# ─────────────────────────────
# liste rate
# ─────────────────────────────

@router.get("/ratings/{doctor_id}")
def get_doctor_ratings(doctor_id: str, db: Session = Depends(get_db)):
    import uuid
    doctor_uuid = uuid.UUID(doctor_id)

    ratings = db.query(Rating).filter(Rating.doctor_id == doctor_uuid).all()

    return [
        {
            "user_id": str(r.user_id),
            "score": r.score,
            "comment": r.comment
        }
        for r in ratings
    ]
# ─────────────────────────────
# INCLUDE ROUTER
# ─────────────────────────────
app.include_router(router)

# ─────────────────────────────
# GLOBAL ERROR HANDLER
# ─────────────────────────────
@app.exception_handler(Exception)
async def global_error(request, exc):
    logger.error(str(exc))
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})