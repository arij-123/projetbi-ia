# serper_scraper_advanced.py
import requests
import time
from database import SessionLocal
from models import Doctor
import uuid

# ============================================================
# 🔑 VOTRE CLÉ API SERPER (récupérée sur https://serper.dev/)
# ============================================================
SERPER_API_KEY = "d87c3f67952b5b163b1cd9726120533ff32ad0c8"  # ← Remplacez par votre vraie clé





def search_doctors_on_google_maps(city="Tunis", specialty="dermatologue", limit=50):
    """
    Recherche des médecins sur Google Maps
    Retourne une liste de médecins trouvés
    """
    
    url = "https://google.serper.dev/maps"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    
    all_doctors = []
    
    # Recherche dans plusieurs zones pour avoir plus de résultats
    search_queries = [
        f"{specialty} {city}",
        f"dermatologue {city}",
        f"skin doctor {city}",
        f"meilleur dermatologue {city}"
    ]
    
    for query in search_queries:
        print(f"\n🔍 Recherche: {query}")
        
        payload = {
            "q": query,
            "gl": "tn",
            "hl": "fr",
            "num": limit  # Nombre de résultats par recherche
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            
            if 'places' in data:
                for place in data['places']:
                    doctor = {
                        'first_name': extract_first_name(place.get('title', '')),
                        'last_name': extract_last_name(place.get('title', '')),
                        'full_name': place.get('title', ''),
                        'specialty': 'Dermatologue',
                        'city': city,
                        'location': place.get('address', ''),
                        'avg_rating': place.get('rating', 0),
                        'rating_count': place.get('ratingCount', 0),
                        'phone': place.get('phone', ''),
                        'place_id': place.get('place_id', '')
                    }
                    
                    # Éviter les doublons
                    if not any(d['full_name'] == doctor['full_name'] for d in all_doctors):
                        all_doctors.append(doctor)
            
            time.sleep(0.5)  # Pause entre les requêtes
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
    
    return all_doctors

def extract_first_name(full_name):
    """Extrait le prénom d'un nom complet"""
    if not full_name:
        return "Inconnu"
    # Enlever "Dr." ou "Dr"
    name = full_name.replace("Dr.", "").replace("Dr", "").strip()
    parts = name.split()
    return parts[0] if parts else "Inconnu"

def extract_last_name(full_name):
    """Extrait le nom de famille"""
    if not full_name:
        return "Inconnu"
    name = full_name.replace("Dr.", "").replace("Dr", "").strip()
    parts = name.split()
    return " ".join(parts[1:]) if len(parts) > 1 else parts[0]

def save_doctors_to_db(doctors):
    """Sauvegarde les médecins dans la base de données"""
    
    db = SessionLocal()
    added = 0
    updated = 0
    
    for doctor_data in doctors:
        # Vérifier si le médecin existe déjà
        existing = db.query(Doctor).filter(
            Doctor.first_name == doctor_data['first_name'],
            Doctor.last_name == doctor_data['last_name']
        ).first()
        
        if existing:
            # Mettre à jour les notes
            existing.avg_rating = doctor_data['avg_rating']
            existing.rating_count = doctor_data['rating_count']
            existing.location = doctor_data['location']
            updated += 1
            print(f"   🔄 Mis à jour: Dr. {doctor_data['first_name']} {doctor_data['last_name']}")
        else:
            # Ajouter nouveau médecin
            new_doctor = Doctor(
                id=uuid.uuid4(),
                first_name=doctor_data['first_name'],
                last_name=doctor_data['last_name'],
                specialty=doctor_data['specialty'],
                city=doctor_data['city'],
                location=doctor_data['location'],
                avg_rating=doctor_data['avg_rating'],
                rating_count=doctor_data['rating_count']
            )
            db.add(new_doctor)
            added += 1
            print(f"   ➕ Ajouté: Dr. {doctor_data['first_name']} {doctor_data['last_name']}")
    
    db.commit()
    db.close()
    
    return added, updated

def scrape_multiple_cities(cities=["Tunis", "Ariana", "Ben Arous", "Manouba",
    "Nabeul", "Zaghouan", "Bizerte", "Béja", "Jendouba", "Le Kef",
    "Siliana", "Kairouan", "Kasserine", "Sidi Bouzid",
    "Sousse", "Monastir", "Mahdia", "Sfax",
    "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili"], limit_per_city=20):
    """
    Scraper des médecins dans plusieurs villes
    """
    
    all_doctors = []
    
    print("=" * 70)
    print("🚀 SCRAPING DE MÉDECINS DANS PLUSIEURS VILLES")
    print("=" * 70)
    
    for city in cities:
        print(f"\n📍 Ville: {city}")
        print("-" * 40)
        
        doctors = search_doctors_on_google_maps(city, "dermatologue", limit_per_city)
        
        for doctor in doctors:
            if not any(d['full_name'] == doctor['full_name'] for d in all_doctors):
                all_doctors.append(doctor)
                print(f"   ✅ {doctor['full_name']}: {doctor['avg_rating']}⭐ ({doctor['rating_count']} avis)")
        
        time.sleep(1)
    
    return all_doctors

def scrape_by_location_center(lat, lng, radius=5000, specialty="dermatologue"):
    """
    Scraper par centre géographique (plus précis)
    """
    
    url = "https://google.serper.dev/maps"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    
    query = f"{specialty} près de moi"
    
    payload = {
        "q": query,
        "gl": "tn",
        "hl": "fr",
        "ll": f"@{lat},{lng},{radius}z",
        "num": 50
    }
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    
    doctors = []
    for place in data.get('places', []):
        doctors.append({
            'first_name': extract_first_name(place.get('title', '')),
            'last_name': extract_last_name(place.get('title', '')),
            'full_name': place.get('title', ''),
            'specialty': 'Dermatologue',
            'city': extract_city_from_address(place.get('address', '')),
            'location': place.get('address', ''),
            'avg_rating': place.get('rating', 0),
            'rating_count': place.get('ratingCount', 0),
            'phone': place.get('phone', '')
        })
    
    return doctors

def extract_city_from_address(address):
    """Extrait la ville d'une adresse"""
    cities = ["Tunis", "Ariana", "Sousse", "Sfax", "La Marsa", "Nabeul", "Bizerte"]
    for city in cities:
        if city in address:
            return city
    return "Tunis"

def show_statistics(doctors):
    """Affiche les statistiques"""
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    
    if not doctors:
        print("Aucun médecin trouvé")
        return
    
    total_doctors = len(doctors)
    avg_rating = sum(d['avg_rating'] for d in doctors) / total_doctors
    total_reviews = sum(d['rating_count'] for d in doctors)
    
    # Compter par ville
    cities_count = {}
    for d in doctors:
        city = d['city']
        cities_count[city] = cities_count.get(city, 0) + 1
    
    print(f"\n👨‍⚕️ Total médecins trouvés: {total_doctors}")
    print(f"⭐ Note moyenne: {avg_rating:.2f}")
    print(f"📝 Total avis: {total_reviews}")
    
    print("\n📍 Répartition par ville:")
    for city, count in sorted(cities_count.items(), key=lambda x: x[1], reverse=True):
        print(f"   - {city}: {count} médecins")
    
    # Top 10 meilleurs médecins
    print("\n🏆 Top 10 meilleurs médecins:")
    top_doctors = sorted(doctors, key=lambda x: x['avg_rating'], reverse=True)[:10]
    for i, doc in enumerate(top_doctors, 1):
        print(f"   {i}. Dr. {doc['first_name']} {doc['last_name']}: {doc['avg_rating']}⭐ ({doc['rating_count']} avis) - {doc['city']}")

def main():
    print("=" * 70)
    print("🔧 SCRAPING AVANCÉ DE MÉDECINS - SERPER")
    print("=" * 70)
    
    # Choix de la méthode
    print("\nChoisissez une méthode:")
    print("1. Scraper dans plusieurs villes (Tunis, Sousse, Sfax, Ariana, La Marsa)")
    print("2. Scraper dans une ville spécifique")
    print("3. Scraper par centre géographique")
    
    choice = input("\nVotre choix (1-3): ")
    
    doctors = []
    
    if choice == "1":
        # Scraper dans plusieurs villes
        cities = ["Tunis", "Sousse", "Sfax", "Ariana", "La Marsa", "Nabeul", "Bizerte"]
        doctors = scrape_multiple_cities(cities, limit_per_city=30)
        
    elif choice == "2":
        city = input("Nom de la ville: ")
        limit = int(input("Nombre de médecins à chercher (max 50): "))
        doctors = search_doctors_on_google_maps(city, "dermatologue", limit)
        
    elif choice == "3":
        print("\nExemple: Centre de Tunis (36.8065, 10.1815)")
        lat = float(input("Latitude: "))
        lng = float(input("Longitude: "))
        doctors = scrape_by_location_center(lat, lng, 5000)
    
    else:
        print("Choix invalide")
        return
    
    # Afficher les statistiques
    show_statistics(doctors)
    
    # Demander confirmation pour sauvegarder
    print("\n" + "=" * 70)
    confirm = input("💾 Voulez-vous sauvegarder ces médecins dans la base de données ? (o/n): ")
    
    if confirm.lower() == 'o':
        added, updated = save_doctors_to_db(doctors)
        print(f"\n✅ Résultat:")
        print(f"   - {added} nouveaux médecins ajoutés")
        print(f"   - {updated} médecins mis à jour")
    else:
        print("❌ Sauvegarde annulée")
    
    print("\n✨ Terminé!")

if __name__ == "__main__":
    main()