# import_doctors.py
import pandas as pd
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.core.database import SessionLocal
from backend.models.models import Doctor

def clean_name(name):
    """Nettoie les noms (enlever les espaces, mettre en titre)"""
    if pd.isna(name):
        return ""
    return str(name).strip().title()

def import_doctors_from_csv(csv_path="backend/data/doctors_export.csv"):
    """
    Importe les médecins depuis un CSV vers la base de données
    """
    db = SessionLocal()
    
    try:
        # Lire le CSV
        df = pd.read_csv(csv_path)
        print(f"📂 Lecture de {len(df)} médecins depuis {csv_path}")
        
        # Compter les imports
        imported = 0
        skipped = 0
        
        for idx, row in df.iterrows():
            # Vérifier si le médecin existe déjà (par email ou nom complet)
            first_name = clean_name(row.get('first_name', ''))
            last_name = clean_name(row.get('last_name', ''))
            
            existing = db.query(Doctor).filter(
                Doctor.first_name == first_name,
                Doctor.last_name == last_name
            ).first()
            
            if existing:
                print(f"⏭️ Déjà existant: {first_name} {last_name}")
                skipped += 1
                continue
            
            # Créer un nouvel UUID pour le médecin
            doctor_id = row.get('id')
            if pd.isna(doctor_id) or not doctor_id:
                doctor_id = str(uuid.uuid4())
            
            # Créer l'objet Doctor
            doctor = Doctor(
                id=doctor_id,
                first_name=first_name,
                last_name=clean_name(row.get('last_name', '')),
                specialty=row.get('specialty', 'Dermatologue'),
                city=row.get('city', ''),
                location=row.get('location', ''),
                avg_rating=float(row.get('avg_rating', 0)) if pd.notna(row.get('avg_rating')) else 0,
                rating_count=int(row.get('rating_count', 0)) if pd.notna(row.get('rating_count')) else 0,
                description=row.get('description', '') if pd.notna(row.get('description')) else None,
                image=row.get('image', None) if pd.notna(row.get('image')) else None
            )
            
            db.add(doctor)
            imported += 1
            
            if imported % 10 == 0:
                print(f"📥 Importé {imported} médecins...")
        
        # Commit tous les changements
        db.commit()
        
        print(f"\n✅ Import terminé !")
        print(f"   - Importés: {imported}")
        print(f"   - Ignorés (déjà existants): {skipped}")
        print(f"   - Total dans la base: {db.query(Doctor).count()}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_doctors_from_csv()