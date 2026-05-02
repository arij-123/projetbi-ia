# services.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.models import Doctor, Rating, Maladie, Soin, User
import uuid

# ─────────────────────────────────────
# ⭐ UPDATE DOCTOR RATING
# ─────────────────────────────────────
def update_doctor_rating(db: Session, doctor_id):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return None

        # Avis réels des users
        real_result = db.query(
            func.avg(Rating.score),
            func.count(Rating.id)
        ).filter(
            Rating.doctor_id == doctor_id,
            Rating.is_external == False
        ).first()

        real_avg   = float(real_result[0]) if real_result[0] is not None else None
        real_count = int(real_result[1])   if real_result[1] is not None else 0

        # Valeurs scrapées Maps — sauvegardées, jamais écrasées
        ext_avg   = doctor.scraped_avg_rating   or 0
        ext_count = doctor.scraped_rating_count or 0

        # Moyenne pondérée : (somme scrapée + somme réelle) / total
        total_count = real_count + ext_count

        if total_count == 0:
            final_avg = 0.0
        else:
            weighted_sum = 0.0
            if real_avg is not None:
                weighted_sum += real_avg * real_count
            if ext_avg:
                weighted_sum += ext_avg * ext_count
            final_avg = weighted_sum / total_count

        print(f"📊 {doctor.first_name}: {real_count} réels + {ext_count} Maps → {final_avg:.2f}")

        doctor.avg_rating   = round(final_avg, 2)
        doctor.rating_count = total_count

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

    # Sécurité UUID
    if isinstance(doctor_id, str):
        doctor_id = uuid.UUID(doctor_id)
    if isinstance(user_id, str):
        user_id = uuid.UUID(user_id)

    # Validation du score
    if not 1 <= score <= 5:
        raise ValueError("Le score doit être entre 1 et 5")

    # Vérifier que le docteur existe
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise ValueError(f"Docteur {doctor_id} non trouvé")

    # Vérifier si CET utilisateur a déjà noté CE docteur (avis réel uniquement)
    existing = db.query(Rating).filter(
        Rating.user_id == user_id,
        Rating.doctor_id == doctor_id,
        Rating.is_external == False     # ← On ne touche JAMAIS aux avis externes
    ).first()

    if existing:
        # Mise à jour de l'avis existant
        existing.score   = score
        existing.comment = comment
    else:
        # ✅ FIX: new_rating est bien DANS le else, et db.add aussi
        new_rating = Rating(
            user_id=user_id,
            doctor_id=doctor_id,
            score=score,
            comment=comment,
            is_external=False
        )
        db.add(new_rating)  # ← était en dehors du else, c'était le bug principal

    db.flush()

    return update_doctor_rating(db, doctor_id)


# ─────────────────────────────────────
# 🧠 RECOMMEND (doctors + soins)
# ─────────────────────────────────────
def recommend(db: Session, maladie_nom: str, limit: int = 5):
    """Recommandation avec score pondéré"""

    maladie_nom_clean = maladie_nom.replace('_', ' ')

    maladie = db.query(Maladie).filter(Maladie.nom == maladie_nom_clean).first()
    if not maladie:
        print(f"⚠️ Maladie non trouvée: {maladie_nom_clean}")
        return None

    weighted_results = get_weighted_score_recommendations(db, limit=limit)
    doctors = [item['doctor'] for item in weighted_results] if weighted_results else []

    print(f"👨‍⚕️ {len(doctors)} médecins recommandés (score pondéré)")

    soins = db.query(Soin).filter(Soin.maladie_id == maladie.id).all()

    return {
        "maladie": maladie_nom,
        "medecins": doctors,
        "soins": soins,
    }


# ─────────────────────────────────────
# 📊 WEIGHTED SCORE RECOMMENDATIONS
# ─────────────────────────────────────
def get_weighted_score_recommendations(db: Session, limit: int = 10):
    """
    Recommandation avec score pondéré :
    - Note moyenne : 70%
    - Popularité (nombre d'avis) : 30%
    """
    doctors = db.query(Doctor).all()

    print(f"📊 Nombre de médecins trouvés: {len(doctors)}")

    if not doctors:
        return []

    max_rating  = max((d.avg_rating  or 0) for d in doctors) or 1
    max_reviews = max((d.rating_count or 0) for d in doctors) or 1

    results = []
    for doctor in doctors:
        rating_score  = (doctor.avg_rating   or 0) / max_rating
        reviews_score = (doctor.rating_count or 0) / max_reviews
        weighted_score = (rating_score * 0.7) + (reviews_score * 0.3)

        results.append({
            'doctor':         doctor,
            'weighted_score': round(weighted_score, 3),
            'rating_score':   round(rating_score, 3),
            'reviews_score':  round(reviews_score, 3),
        })

    results.sort(key=lambda x: x['weighted_score'], reverse=True)
    return results[:limit]


# ─────────────────────────────────────
# 🧮 BAYESIAN RECOMMENDATIONS
# ─────────────────────────────────────
def get_bayesian_recommendations(db: Session, limit: int = 10, m: int = 5):
    doctors = db.query(Doctor).all()

    if not doctors:
        return []

    C = db.query(func.avg(Doctor.avg_rating)).scalar() or 0

    results = []
    for doctor in doctors:
        R = doctor.avg_rating  or 0
        v = doctor.rating_count or 0
        score = ((v / (v + m)) * R) + ((m / (v + m)) * C) if (v + m) > 0 else C

        results.append({
            "doctor": doctor,
            "score":  score,
            "R":      R,
            "v":      v,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]