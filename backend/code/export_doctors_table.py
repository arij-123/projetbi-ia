# export_doctors_table.py
import pandas as pd
from backend.core.database import SessionLocal
from backend.models.models import Doctor

def export_doctors_to_csv():
    """Exporte simplement la table doctors vers un fichier CSV"""
    
    db = SessionLocal()
    
    # Récupérer tous les médecins
    doctors = db.query(Doctor).all()
    
    # Convertir en dictionnaire
    data = []
    for doctor in doctors:
        data.append({
            'id': str(doctor.id),
            'first_name': doctor.first_name,
            'last_name': doctor.last_name,
            'specialty': doctor.specialty,
            'city': doctor.city,
            'location': doctor.location,
            'avg_rating': doctor.avg_rating,
            'rating_count': doctor.rating_count,
            'description': doctor.description,
            'image': doctor.image
        })
    
    # Créer DataFrame et exporter
    df = pd.DataFrame(data)
    df.to_csv('doctors_export.csv', index=False, encoding='utf-8-sig')
    
    print(f"✅ Export terminé!")
    print(f"📊 {len(data)} médecins exportés")
    print(f"📁 Fichier: doctors_export.csv")
    
    db.close()
    return df

if __name__ == "__main__":
    export_doctors_to_csv()