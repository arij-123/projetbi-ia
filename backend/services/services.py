# services.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.models import Doctor, Rating, Maladie, Soin, User

# ─────────────────────────────────────
# ⭐ UPDATE DOCTOR RATING
# ─────────────────────────────────────
def update_doctor_rating(db: Session, doctor_id):
    try:
        result = db.query(
            func.avg(Rating.score),
            func.count(Rating.id)
        ).filter(Rating.doctor_id == doctor_id).first()

        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return None

        avg_val = result[0] if result[0] is not None else 0.0
        count_val = result[1] if result[1] is not None else 0

        doctor.avg_rating = round(float(avg_val), 2)
        doctor.rating_count = count_val

        db.commit()
        db.refresh(doctor)
        return doctor
    except Exception as e:
        db.rollback()
        raise e


# ─────────────────────────────────────
# ⭐ ADD / UPDATE RATING
# ─────────────────────────────────────
def add_rating(db: Session, user_id, doctor_id, score: int, comment: str = None):
    # Validation du score
    if not 1 <= score <= 5:
        raise ValueError("Le score doit être entre 1 et 5")
    
    # Vérifier que le docteur existe
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise ValueError(f"Docteur {doctor_id} non trouvé")
    
    # Vérifier si l'utilisateur existe
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"Utilisateur {user_id} non trouvé")
    
    # Vérifier si un avis existe déjà
    existing = db.query(Rating).filter(
        Rating.user_id == user_id,
        Rating.doctor_id == doctor_id
    ).first()
    
    if existing:
        existing.score = score
        existing.comment = comment
        db.commit()
    else:
        rating = Rating(
            user_id=user_id,
            doctor_id=doctor_id,
            score=score,
            comment=comment
        )
        db.add(rating)
        db.commit()
    
    # Mettre à jour la note du docteur
    return update_doctor_rating(db, doctor_id)


# ─────────────────────────────────────
# 🧠 RECOMMEND (doctors + soins)
# ─────────────────────────────────────
# services.py - MODIFIEZ cette fonction
# services.py - REMPLACEZ la fonction recommend

def recommend(db: Session, maladie_nom: str, limit: int = 5):
    """Recommandation avec score pondéré"""
    
    # Nettoyer le nom de la maladie (remplacer _ par espace)
    maladie_nom_clean = maladie_nom.replace('_', ' ')
    
    maladie = db.query(Maladie).filter(Maladie.nom == maladie_nom_clean).first()
    if not maladie:
        print(f"⚠️ Maladie non trouvée: {maladie_nom_clean}")
        return None

    # Utiliser la fonction de score pondéré
    weighted_results = get_weighted_score_recommendations(db, limit=limit)
    
    # Extraire les docteurs
    doctors = [item['doctor'] for item in weighted_results] if weighted_results else []
    
    print(f"👨‍⚕️ {len(doctors)} médecins recommandés (score pondéré)")
    
    # Récupérer les soins
    soins = db.query(Soin).filter(Soin.maladie_id == maladie.id).all()
    
    return {
        "maladie": maladie_nom,
        "medecins": doctors,
        "soins": soins,
    }
# services.py - Ajoutez cette fonction

# services.py - CORRIGEZ cette fonction

def get_weighted_score_recommendations(db: Session, limit: int = 10):
    """
    Recommandation avec score pondéré basé sur le dataset
    - Note moyenne: 70%
    - Popularité (nombre d'avis): 30%
    """
    
    # Récupérer les médecins
    query = db.query(Doctor)
    
   
    
    # ⚠️ NE PAS exclure les notes nulles - gardez tous les médecins
    # query = query.filter(Doctor.avg_rating > 0)  # ← COMMENTEZ ou SUPPRIMEZ cette ligne
    
    doctors = query.all()
    
    print(f"📊 Nombre de médecins trouvés: {len(doctors)}")
    for d in doctors[:5]:
        print(f"   - {d.first_name} {d.last_name}: note={d.avg_rating}, avis={d.rating_count}")
    
    if not doctors:
        return []
    
    # Normaliser les notes
    max_rating = max([d.avg_rating for d in doctors]) if doctors else 1
    max_reviews = max([d.rating_count for d in doctors]) if doctors else 1
    
    print(f"📈 Max note: {max_rating}, Max avis: {max_reviews}")
    
    results = []
    for doctor in doctors:
        # Score normalisé (0-1)
        rating_score = doctor.avg_rating / max_rating if max_rating > 0 else 0
        reviews_score = doctor.rating_count / max_reviews if max_reviews > 0 else 0
        
        # Score pondéré: 70% note + 30% popularité
        weighted_score = (rating_score * 0.7) + (reviews_score * 0.3)
        print(weighted_score)
        
        results.append({
            'doctor': doctor,
            'weighted_score': round(weighted_score, 3),
            'rating_score': round(rating_score, 3),
            'reviews_score': round(reviews_score, 3)
        })
    
    # Trier par score pondéré
    results.sort(key=lambda x: x['weighted_score'], reverse=True)
    
    return results[:limit]