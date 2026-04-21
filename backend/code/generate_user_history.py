# generate_prediction_history.py
import pandas as pd
import numpy as np
import random
from database import SessionLocal
from models import User, Maladie, PredictionHistory
from datetime import datetime, timedelta
import json

def generate_prediction_history(n_predictions=1000):
    """Génère un historique de prédictions avec liaison Maladie"""
    
    db = SessionLocal()
    
    # Récupérer les utilisateurs
    users = db.query(User).all()
    
    if not users:
        print("❌ Aucun utilisateur trouvé")
        return
    
    # 🔥 Récupérer les maladies UNIQUEMENT depuis la table Maladie
    maladies = db.query(Maladie).all()
    
    if not maladies:
        print("❌ Aucune maladie trouvée dans la table Maladie")
        print("   Veuillez d'abord ajouter des maladies avec seed.py")
        return
    
    print(f"📊 Génération de {n_predictions} prédictions...")
    print(f"   - {len(users)} utilisateurs")
    print(f"   - {len(maladies)} maladies (depuis table Maladie)")
    
    # Afficher les maladies disponibles
    print("\n📋 Maladies disponibles dans la table:")
    for m in maladies:
        print(f"   - {m.nom} (ID: {m.id})")
    
    predictions = []
    
    for i in range(n_predictions):
        user = random.choice(users)
        maladie = random.choice(maladies)  # 🔥 Choix aléatoire parmi les maladies existantes
        confidence = random.uniform(60, 98)
        
        # Générer les probabilités pour toutes les maladies
        probas = {}
        for m in maladies:
            if m.id == maladie.id:
                probas[m.nom] = round(confidence, 1)
            else:
                probas[m.nom] = round(random.uniform(0, 30), 1)
        
        all_probas = json.dumps(probas, ensure_ascii=False)
        
        # Date aléatoire (dernière année)
        days_ago = random.randint(0, 365)
        created_at = datetime.now() - timedelta(days=days_ago)
        
        # Sauvegarder avec liaison à Maladie
        history = PredictionHistory(
            user_id=user.id,
            maladie_id=maladie.id,  # 🔥 Clé étrangère vers Maladie
            predicted_disease=maladie.nom,
            confidence=confidence,
            all_probabilities=all_probas,
            created_at=created_at,
            image_path=f"uploads/pred_{i}.jpg"
        )
        db.add(history)
        
        predictions.append({
            'user_id': str(user.id),
            'user_name': f"{user.first_name} {user.last_name}",
            'maladie_id': maladie.id,
            'maladie_nom': maladie.nom,
            'confidence': confidence,
            'date': created_at.strftime('%Y-%m-%d')
        })
        
        if (i + 1) % 200 == 0:
            print(f"   {i+1} prédictions générées...")
            db.commit()
    
    db.commit()
    db.close()
    
    # Sauvegarder en CSV
    df = pd.DataFrame(predictions)
    df.to_csv('prediction_history.csv', index=False, encoding='utf-8-sig')
    
    print(f"\n✅ {len(predictions)} prédictions générées")
    print(f"\n📊 Statistiques:")
    print(f"   - Utilisateurs uniques: {df['user_id'].nunique()}")
    print(f"   - Maladies uniques: {df['maladie_nom'].nunique()}")
    print(f"   - Confiance moyenne: {df['confidence'].mean():.1f}%")
    
    print(f"\n🏥 Distribution des maladies:")
    disease_counts = df['maladie_nom'].value_counts()
    for disease, count in disease_counts.items():
        print(f"   - {disease}: {count} fois ({count/len(df)*100:.1f}%)")
    
    return df

if __name__ == "__main__":
    generate_prediction_history(1000)