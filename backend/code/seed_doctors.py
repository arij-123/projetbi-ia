"""
seed_doctors_from_list.py - Ajoute les docteurs de votre liste
Run : python seed_doctors_from_list.py
"""

from backend.core.database import SessionLocal
from backend.models.models import Doctor
import uuid

db = SessionLocal()

def seed_doctors():
    # Liste des docteurs à ajouter
    doctors = [
        {
            "first_name": "Jihen",
            "last_name": "HICHERI",
            "specialty": "Dermatologue",
            "description": """Dermatologie - Maladies Sexuellement Transmissibles - Maladies des ongles et des cheveux
PRP - Mésothérapie - Comblement à l'acide hyaluronique - Botox, Dysport - Peeling - Fils tenseurs
Laser épilatoire - Laser vasculaire - Détourage - Ulthera Hifu
Traitement des cicatrices (acné, post opératoire)
Traitement des rides au laser - Radiofréquences (avec ou sans microneedling)
Cryolipolyse - Peeling superficiel/moyen/profond
Traitement des rougeurs (érythrose/Couperose) au laser""",
            "city": "Ariana",
            "location": "Cité Ennasar 1",
            "avg_rating": 4.9,
            "rating_count": 156,
            "image": None
        },
        {
            "first_name": "Zineb",
            "last_name": "BENNANI",
            "specialty": "Dermatologue",
            "description": """Dermatologie - Maladies des ongles et du cuir chevelu
Maladies sexuellement transmissibles - Dermatologie Esthétique - Lasers dermatologiques
Greffe de cheveux - Dermoscopie (microscopie dermatologique)
Comblement par acide hyaluronique - Cryothérapie
Electrocoagulation - Radiofréquences (avec ou sans microneedling)""",
            "city": "Tunis",
            "location": "La Marsa",
            "avg_rating": 4.8,
            "rating_count": 134,
            "image": None
        },
        {
            "first_name": "Amel",
            "last_name": "JELLOULI ELLOUMI",
            "specialty": "Dermatologue",
            "description": """Spécialiste en Dermatologie - Ancien Médecin Principal des Hôpitaux
Dermatologie Pédiatrique
Traitement des cicatrices d'acné / Post-traumatiques / Post-chirurgicales par injection d'acide hyaluronique
Injection de PRP (Plasma riche en plaquettes) pour les cernes
Traitement du vitiligo - Cryolipolyse""",
            "city": "Tunis",
            "location": "Centre Urbain Nord",
            "avg_rating": 4.9,
            "rating_count": 203,
            "image": None
        },
        {
            "first_name": "Yosra",
            "last_name": "JMOUR",
            "specialty": "Dermatologue",
            "description": """Dermatologie - Maladies de la peau - Maladies des ongles et des cheveux
Maladies sexuellement transmissibles - Dermatologie esthétique et Laser
Dermatologie pédiatrique - Chirurgie dermatologique
Comblement par acide hyaluronique - Electrocoagulation
Traitement des angiomes par laser - Chirurgie des kystes cutanés
Traitement des mycoses du cuir chevelu (Teignes)
Traitement Médical et Chirurgical des Cheveux""",
            "city": "Tunis",
            "location": "Les Berges Du Lac 2",
            "avg_rating": 4.8,
            "rating_count": 178,
            "image": None
        },
        {
            "first_name": "Slim",
            "last_name": "BEN ALI",
            "specialty": "Dermatologue",
            "description": """Diplôme de médecin spécialiste en dermatologie vénérologie
Diplôme universitaire de médecine esthétique et laser - Université de médecine Paris XII
Comblement par acide hyaluronique
Traitement Médical et Chirurgical des Cheveux
Le rajeunissement au laser
Traitement molluscum contagiosum par azote liquide ou curetage
Cryothérapie - Radiofréquences (avec ou sans microneedling)""",
            "city": "Tunis",
            "location": "L'aouina",
            "avg_rating": 4.7,
            "rating_count": 98,
            "image": None
        },
        {
            "first_name": "Hanen",
            "last_name": "HAJ TAIEB MEHDI",
            "specialty": "Dermatologue",
            "description": """Spécialiste en Dermatologie - Maladies Sexuellement Transmissibles
Maladies des Ongles et des Cheveux - Médecine Esthétique - Laser
Comblement par acide hyaluronique
Radiofréquences (avec ou sans microneedling)
Traitement des rougeurs (érythrose/Couperose) au laser
Le rajeunissement au laser - Phénolisation ongle incarné""",
            "city": "Tunis",
            "location": "L'aouina",
            "avg_rating": 4.8,
            "rating_count": 112,
            "image": None
        }
    ]
    
    # Ajouter chaque docteur
    added_count = 0
    existing_count = 0
    
    for doc_data in doctors:
        # Vérifier si le docteur existe déjà
        existing = db.query(Doctor).filter(
            Doctor.first_name == doc_data["first_name"],
            Doctor.last_name == doc_data["last_name"]
        ).first()
        
        if not existing:
            doctor = Doctor(
                id=uuid.uuid4(),
                first_name=doc_data["first_name"],
                last_name=doc_data["last_name"],
                specialty=doc_data["specialty"],
                description=doc_data["description"],
                city=doc_data["city"],
                location=doc_data["location"],
                avg_rating=doc_data["avg_rating"],
                rating_count=doc_data["rating_count"],
                image=doc_data["image"]
            )
            db.add(doctor)
            added_count += 1
            print(f"✅ Ajouté: Dr. {doc_data['first_name']} {doc_data['last_name']} - {doc_data['city']}")
        else:
            existing_count += 1
            print(f"⏭️ Déjà existant: Dr. {doc_data['first_name']} {doc_data['last_name']}")
    
    db.commit()
    print(f"\n🎉 Résumé: {added_count} docteurs ajoutés, {existing_count} déjà existants")

def show_all_doctors():
    """Affiche tous les docteurs dans la base"""
    doctors = db.query(Doctor).all()
    print(f"\n📋 Liste des docteurs dans la base ({len(doctors)}):")
    print("=" * 80)
    for doc in doctors:
        print(f"\n👨‍⚕️ Dr. {doc.first_name} {doc.last_name}")
        print(f"   Spécialité: {doc.specialty}")
        print(f"   📍 {doc.city} - {doc.location}")
        print(f"   ⭐ {doc.avg_rating} ({doc.rating_count} avis)")
        if doc.description:
            # Afficher les 100 premiers caractères de la description
            desc_preview = doc.description[:150] + "..." if len(doc.description) > 150 else doc.description
            print(f"   📝 {desc_preview}")
        print("-" * 40)

if __name__ == "__main__":
    print("🌱 Démarrage du seed des docteurs...")
    print("=" * 50)
    seed_doctors()
    show_all_doctors()
    db.close()
    print("\n✨ Terminé!")