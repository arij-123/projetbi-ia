# 🩺 SkinAI - Détection de Maladies de la Peau par Intelligence Artificielle

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.13+-green)
![React](https://img.shields.io/badge/React-18.0+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-orange)

## 📋 Description

**SkinAI** est une application web innovante qui utilise l'intelligence artificielle pour détecter les maladies de peau à partir d'images. Le projet combine un modèle de deep learning (ResNet50) entraîné sur 9 classes de maladies dermatologiques, un système de recommandation de médecins et de soins, ainsi qu'une interface utilisateur moderne et intuitive.

## 🎯 Fonctionnalités Principales

### 🤖 Intelligence Artificielle
- ✅ **Détection de 9 maladies de peau** avec pourcentage de confiance
- ✅ **Analyse en temps réel** des images (drag & drop)
- ✅ **Historique des prédictions** par utilisateur
- ✅ **Visualisation des probabilités** détaillées pour chaque maladie

### 👨‍⚕️ Gestion des Médecins
- ✅ **Recherche et filtrage** par ville et spécialité
- ✅ **Système de notation** (1 à 5 étoiles) avec commentaires
- ✅ **Top-rated doctors** avec score pondéré (70% note + 30% popularité)
- ✅ **Scraping automatique** des notes depuis Google Maps

### 💊 Système de Recommandation
- ✅ **Recommandation de médecins** basée sur les notes réelles
- ✅ **Soins et traitements** associés à chaque maladie
- ✅ **Produits recommandés** pour chaque soin

### 👤 Gestion Utilisateurs
- ✅ **Authentification sécurisée** (JWT tokens)
- ✅ **Profils utilisateurs** avec historique complet
- ✅ **Rôles différenciés** (Patient, Médecin, Administrateur)

## 🏥 Maladies Détectées

| # | Maladie | Description | Gravité |
|---|---------|-------------|---------|
| 1 | **Atopic_Dermatitis** | Dermite atopique - inflammation chronique de la peau | Modérée |
| 2 | **Basal_Cell_Carcinoma** | Carcinome basocellulaire - cancer cutané fréquent | Élevée |
| 3 | **Eczema** | Eczéma - inflammation avec démangeaisons intenses | Modérée |
| 4 | **Keratosis** | Kératose - épaississement de la couche cornée | Bénigne |
| 5 | **Melanocytic_Nevi** | Naevus mélanocytaire - grains de beauté | Bénigne |
| 6 | **Melanoma** | Mélanome - cancer cutané le plus dangereux | Très élevée |
| 7 | **Psoriasis** | Psoriasis - maladie auto-immune chronique | Modérée |
| 8 | **Tinea_Ringworm** | Teigne - infection fongique | Bénigne |
| 9 | **Warts_Molluscum** | Verrues et molluscum contagiosum | Bénigne |

## 🏗️ Architecture du Projet
SkinAI/
├── backend/ # API FastAPI
│ ├── core/ # Modules centraux
│ │ ├── auth.py # Authentification JWT
│ │ ├── database.py # Connexion PostgreSQL
│ │ ├── security.py # Hash et sécurité
│ │ └── schemas.py # Schémas Pydantic
│ │
│ ├── models/ # Modèles SQLAlchemy
│ │ └── models.py # User, Doctor, Rating, Maladie, Soin, Produit
│ │
│ ├── services/ # Logique métier
│ │ └── services.py # Ratings, recommandations
│ │
│ ├── code/ # Scripts utilitaires
│ │ ├── seed.py # Insertion données initiales
│ │ ├── seed_doctors.py # Insertion médecins
│ │ ├── serper_scraper.py # Scraping Google Maps
│ │ ├── export_doctors_table.py # Export médecins CSV
│ │ ├── generate_user_history.py # Génération historique
│ │ └── eda_doctors.py # Analyse exploratoire
│ │
│ ├── model/ # Modèle IA
│ │ └── final_model3.pth # Poids du modèle ResNet50
│ │
│ ├── data/ # Données
│ │ └── doctors_export.csv # Export des médecins
│ │
│ └── main.py # Point d'entrée de l'API
│
├── frontend/ # Application React
│ ├── src/
│ │ ├── components/
│ │ │ ├── Header.jsx # Barre de navigation
│ │ │ └── RatingModal.jsx # Modal de notation
│ │ ├── pages/
│ │ │ ├── Login.jsx # Page de connexion
│ │ │ ├── Signup.jsx # Page d'inscription
│ │ │ ├── Predict.jsx # Page de prédiction
│ │ │ ├── Doctors.jsx # Page des médecins
│ │ │ └── History.jsx # Page historique
│ │ ├── App.js # Composant principal
│ │ └── index.js # Point d'entrée
│ └── package.json # Dépendances Node.js
│
├── venv/ # Environnement virtuel Python
├── requirements.txt # Dépendances Python
└── .gitignore # Fichiers ignorés par Git



## 🚀 Installation et Démarrage

### Prérequis

- **Python** 3.8 ou supérieur
- **Node.js** 16 ou supérieur
- **PostgreSQL** 14 ou supérieur
- **npm** ou **yarn**

### Backend

```bash
# 1. Accéder au dossier backend
cd backend

# 2. Créer et activer l'environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Créer un fichier .env avec la configuration de la base de données
echo DATABASE_URL=postgresql://postgres:password@localhost/skinia_db > .env

# 5. Créer la base de données PostgreSQL
psql -U postgres -c "CREATE DATABASE skinia_db"

# 6. Initialiser les tables
python -c "from core.database import engine, Base; from models.models import *; Base.metadata.create_all(bind=engine)"

# 7. Peupler la base avec des données initiales
python code/seed.py
python code/seed_doctors.py

# 8. Lancer le serveur
uvicorn main:app --reload --port 8000

### Frontend


# 1. Accéder au dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start





## Endpoints API

### `GET /`
Health check - Vérifie que l'API est fonctionnelle

**Réponse:**
```json
{
  "status": "API en ligne",
  "version": "1.0.0",
  "classes": ["Atopic_Dermatitis", ...],
  "model": "ResNet50",
  "endpoints": {
    "health": "/",
    "predict": "/predict",
    "info": "/info"
  }
}
```

### `POST /predict`
Prédit la maladie de peau à partir d'une image

**Paramètres:**
- `file` (multipart/form-data) - Image à analyser

**Réponse:**
```json
{
  "maladie": "Melanoma",
  "confiance": "85.67%",
  "probabilites": {
    "Melanoma": "85.67%",
    "Basal_Cell_Carcinoma": "8.23%",
    ...
  }
}
```

### `GET /info`
Informations détaillées sur le modèle et les maladies

**Réponse:**
```json
{
  "model": {
    "name": "ResNet50",
    "input_size": "224x224",
    "classes": 9,
    "architecture": "CNN avec Transfer Learning"
  },
  "diseases": {
    "Melanoma": {
      "description": "Mélanome - cancer grave de la peau",
      "severity": "Très élevée"
    },
    ...
  },
  "disclaimer": "Ce diagnostic est généré par IA..."
}
```

## Technologies Utilisées

### Backend
- **FastAPI** - Framework API moderne
- **PyTorch** - Machine Learning
- **Pillow** - Traitement d'images
- **Uvicorn** - Serveur ASGI

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS
- **Framer Motion** - Animations
- **Axios** - Client HTTP
- **React Dropzone** - Upload fichiers

## Avertissement Médical

> **Important:** Cette application utilise l'intelligence artificielle pour fournir un diagnostic préliminaire. Les résultats ne remplacent pas l'avis d'un professionnel de la santé qualifié. Consultez toujours un médecin pour un diagnostic précis et un traitement approprié.

## Développement

### Structure du Code

#### Backend
- `main.py` - API FastAPI avec endpoints
- Validation des images (type, taille, format)
- Logging et gestion d'erreurs
- Documentation automatique avec Swagger

#### Frontend
- `App.tsx` - Composant principal
- `components/` - Composants UI réutilisables
- `hooks/` - Hooks personnalisés pour la logique
- Design responsive avec TailwindCSS

### Tests

Pour tester l'application:

1. **Backend:** Visitez `http://localhost:8000/docs` pour Swagger UI
2. **Frontend:** Uploadez une image de maladie de peau
3. **API:** Utilisez `curl` ou Postman pour tester les endpoints

## Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## Licence

Ce projet est à des fins éducatives et de recherche.
>>>>>>> f0c10c3c60f975c53919c1a023e508c813a9d435
