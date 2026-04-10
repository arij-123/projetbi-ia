# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn as nn
import io
from torchvision import models
import logging
from typing import Dict, Any

# ── Configuration du logging ─────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkinAI API",
    description="API de détection de maladies de peau par IA",
    version="1.0.0"
)

# ── CORS pour React ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 9 Classes ────────────────────────────────────────────
CLASS_NAMES = [
    "Atopic_Dermatitis",
    "Basal_Cell_Carcinoma",
    "Eczema",
    "Keratosis",
    "Melanocytic_Nevi",
    "Melanoma",
    "Psoriasis",
    "Tinea_Ringworm",
    "Warts_Molluscum"
]

# ── Charger le modèle ────────────────────────────────────
def load_model():
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, 9)  # ← 9 classes
    )
    model.load_state_dict(
        torch.load("model/final_model3.pth",
        map_location=torch.device('cpu'))
    )
    model.eval()
    return model

model = load_model()
print("✅ Modèle chargé avec 9 classes !")

# ── Preprocessing ─────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),   # ← 224 comme l'entraînement
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ── Validation de l'image ───────────────────────────────────
def validate_image(file: UploadFile) -> Image.Image:
    """
    Valide le fichier image et retourne l'image PIL
    """
    # Vérifier le type de fichier
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporté. Types acceptés: {', '.join(allowed_types)}"
        )
    
    # Vérifier la taille (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    contents = file.file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=413,
            detail="Fichier trop volumineux. Taille maximale: 10MB"
        )
    
    # Réinitialiser le pointeur du fichier
    file.file.seek(0)
    
    try:
        image = Image.open(io.BytesIO(contents))
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image
    except Exception as e:
        logger.error(f"Erreur lors du traitement de l'image: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Fichier image invalide ou corrompu"
        )

# ── Endpoint prediction ───────────────────────────────────
@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Prédit la maladie de peau à partir d'une image
    """
    try:
        logger.info(f"Réception d'une image: {file.filename}")
        
        # Validation de l'image
        image = validate_image(file)
        
        # Prétraitement
        tensor = transform(image).unsqueeze(0)
        
        # Prédiction
        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            pred = probs.argmax().item()
            
        confidence = probs[pred].item() * 100
        
        logger.info(f"Prédiction réussie: {CLASS_NAMES[pred]} ({confidence:.2f}%)")
        
        return {
            "maladie": CLASS_NAMES[pred],
            "confiance": f"{confidence:.2f}%",
            "probabilites": {
                CLASS_NAMES[i]: f"{probs[i].item()*100:.2f}%"
                for i in range(9)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erreur interne du serveur lors de l'analyse"
        )

# ── Health check ──────────────────────────────────────────
@app.get("/")
async def root() -> Dict[str, Any]:
    """
    Vérifie que l'API est fonctionnelle
    """
    return {
        "status": "✅ API en ligne",
        "version": "1.0.0",
        "classes": CLASS_NAMES,
        "model": "ResNet50",
        "endpoints": {
            "health": "/",
            "predict": "/predict",
            "info": "/info"
        }
    }

# ── Informations sur le modèle ───────────────────────────────
@app.get("/info")
async def model_info() -> Dict[str, Any]:
    """
    Retourne des informations détaillées sur le modèle
    """
    disease_info = {
        "Atopic_Dermatitis": {
            "description": "Dermite atopique - inflammation chronique de la peau",
            "severity": "Modérée"
        },
        "Basal_Cell_Carcinoma": {
            "description": "Carcinome basocellulaire - type de cancer de la peau",
            "severity": "Élevée"
        },
        "Eczema": {
            "description": "Eczéma - inflammation de la peau",
            "severity": "Légère à modérée"
        },
        "Keratosis": {
            "description": "Kératose - épaississement de la couche externe de la peau",
            "severity": "Légère"
        },
        "Melanocytic_Nevi": {
            "description": "Nævus mélanocytaire - grain de beauté",
            "severity": "Légère"
        },
        "Melanoma": {
            "description": "Mélanome - cancer grave de la peau",
            "severity": "Très élevée"
        },
        "Psoriasis": {
            "description": "Psoriasis - maladie auto-immune de la peau",
            "severity": "Modérée"
        },
        "Tinea_Ringworm": {
            "description": "Teigne - infection fongique de la peau",
            "severity": "Légère à modérée"
        },
        "Warts_Molluscum": {
            "description": "Verrues et molluscum contagiosum - infections virales",
            "severity": "Légère"
        }
    }
    
    return {
        "model": {
            "name": "ResNet50",
            "input_size": "224x224",
            "classes": len(CLASS_NAMES),
            "architecture": "CNN avec Transfer Learning"
        },
        "diseases": disease_info,
        "disclaimer": "Ce diagnostic est généré par IA et ne remplace pas un avis médical professionnel."
    }

# ── Gestionnaire d'erreurs global ─────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erreur non gérée: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur"}
    )