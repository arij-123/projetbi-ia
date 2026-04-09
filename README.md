# SkinAI - Détection de Maladies de la Peau par IA

Application web moderne pour la détection de maladies de peau utilisant l'intelligence artificielle avec un modèle ResNet50 entraîné sur 9 classes de maladies.

## Fonctionnalités

- **Frontend React** avec interface moderne et responsive
- **Drag & Drop** pour le téléchargement d'images
- **Analyse en temps réel** avec visualisation des résultats
- **9 maladies détectées** avec probabilités détaillées
- **Backend FastAPI** avec validation robuste
- **Gestion d'erreurs** complète et messages utilisateurs

## Architecture

```
projetbi-ia-arij/
|
|-- backend/                 # API FastAPI
|   |-- main.py             # Point d'entrée principal
|   |-- model/              # Modèle PyTorch
|   |-- requirements.txt    # Dépendances Python
|
|-- frontend/               # Application React
|   |-- src/
|   |   |-- components/    # Composants UI
|   |   |-- hooks/         # Hooks personnalisés
|   |   |-- App.tsx        # Composant principal
|   |-- package.json        # Dépendances Node.js
|   |-- tailwind.config.js  # Configuration Tailwind
|
```

## Maladies Détectées

1. **Atopic_Dermatitis** - Dermite atopique
2. **Basal_Cell_Carcinoma** - Carcinome basocellulaire
3. **Eczema** - Eczéma
4. **Keratosis** - Kératose
5. **Melanocytic_Nevi** - Naevus mélanocytaire
6. **Melanoma** - Mélanome
7. **Psoriasis** - Psoriasis
8. **Tinea_Ringworm** - Teigne
9. **Warts_Molluscum** - Verrues et molluscum

## Installation et Démarrage

### Prérequis

- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend

1. **Naviguer vers le dossier backend**
   ```bash
   cd backend
   ```

2. **Créer un environnement virtuel**
   ```bash
   python -m venv venv
   
   # Windows
   venv\\Scripts\\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Démarrer le serveur**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

L'API sera disponible sur `http://localhost:8000`

### Frontend

1. **Naviguer vers le dossier frontend**
   ```bash
   cd frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer l'application**
   ```bash
   npm start
   ```

L'application sera disponible sur `http://localhost:3000`

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