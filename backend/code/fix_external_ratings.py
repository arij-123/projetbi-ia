# fix_external_ratings.py
# Lance ce script UNE SEULE FOIS pour corriger la base
# python fix_external_ratings.py

from backend.core.database import get_db, engine
from backend.models.models import Rating, User
from sqlalchemy.orm import Session

def fix():
    db: Session = next(get_db())

    # Tous les ratings dont le user_id n'existe pas dans la table users
    # = forcément des avis scrapés
    real_user_ids = db.query(User.id).subquery()

    updated = db.query(Rating).filter(
        Rating.user_id.notin_(real_user_ids)
    ).update({"is_external": True}, synchronize_session=False)

    # Aussi corriger les NULL restants
    updated_null = db.query(Rating).filter(
        Rating.is_external == None
    ).update({"is_external": True}, synchronize_session=False)

    db.commit()
    print(f"✅ {updated + updated_null} avis marqués comme externes (is_external=True)")

if __name__ == "__main__":
    fix()
