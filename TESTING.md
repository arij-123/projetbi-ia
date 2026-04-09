# Guide de Test - SkinAI

## 1. Prérequis

Assurez-vous d'avoir installé :
- Python 3.8+
- Node.js 16+
- npm ou yarn

## 2. Installation

### Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux  
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## 3. Démarrage

### Option A: Script Automatique
```bash
# Windows
start.bat

# macOS/Linux
./start.sh
```

### Option B: Manuel

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 4. Tests

### Test 1: Vérification API
Ouvrez `http://localhost:8000` dans votre navigateur.

**Résultat attendu:**
```json
{
  "status": "API en ligne",
  "version": "1.0.0",
  "classes": ["Atopic_Dermatitis", ...],
  "model": "ResNet50"
}
```

### Test 2: Documentation API
Visitez `http://localhost:8000/docs` pour Swagger UI.

### Test 3: Interface Frontend
Ouvrez `http://localhost:3000`.

**Vérifications:**
- [ ] Page se charge correctement
- [ ] Interface responsive
- [ ] Animations fonctionnelles
- [ ] Header affiche "SkinAI"

### Test 4: Upload d'Image

1. **Glissez-déposez** une image dans la zone prévue
2. **Ou cliquez** pour sélectionner un fichier

**Formats acceptés:** JPG, PNG, GIF, BMP, WebP
**Taille max:** 10MB

### Test 5: Analyse d'Image

1. Téléchargez une image de maladie de peau
2. Attendez l'analyse (indicateur de chargement)
3. Vérifiez les résultats affichés

**Résultats attendus:**
- Diagnostic principal avec confiance
- Liste des 9 probabilités
- Barres de progression animées
- Message d'avertissement médical

## 5. Tests d'Erreur

### Test 5.1: Fichier invalide
- Essayez d'uploader un fichier non-image (.txt, .pdf)
- **Résultat:** Message d'erreur "Type de fichier non supporté"

### Test 5.2: Fichier trop volumineux
- Essayez d'uploader une image > 10MB
- **Résultat:** Message d'erreur "Fichier trop volumineux"

### Test 5.3: Backend arrêté
- Arrêtez le backend (Ctrl+C)
- Essayez d'analyser une image
- **Résultat:** Message d'erreur de connexion

## 6. Tests API avec curl

### Health Check
```bash
curl http://localhost:8000
```

### Informations Modèle
```bash
curl http://localhost:8000/info
```

### Prédiction (avec image)
```bash
curl -X POST -F "file=@votre_image.jpg" http://localhost:8000/predict
```

## 7. Validation des Résultats

### Composants Frontend
- [ ] Header avec logo et informations
- [ ] Zone d'upload fonctionnelle
- [ ] Aperçu de l'image
- [ ] Indicateur de chargement
- [ ] Affichage des résultats
- [ ] Messages d'erreur

### Backend
- [ ] API répond correctement
- [ ] Validation des fichiers
- [ ] Logging fonctionnel
- [ ] Gestion d'erreurs
- [ ] Documentation Swagger

## 8. Dépannage

### Problèmes Communs

**Backend ne démarre pas:**
```bash
# Vérifier le modèle
ls backend/model/
# Doit contenir: final_model1.pth
```

**Frontend ne se connecte pas:**
- Vérifiez que le backend tourne sur port 8000
- Vérifiez CORS dans main.py

**Module non trouvé:**
```bash
# Réinstaller les dépendances
pip install -r requirements.txt
npm install
```

**Port déjà utilisé:**
```bash
# Changer de port
uvicorn main:app --port 8001
```

## 9. Tests de Performance

### Charge du Backend
- Testez avec plusieurs images simultanées
- Vérifiez le temps de réponse (< 5 secondes)

### Frontend
- Testez sur différents navigateurs
- Testez sur mobile (responsive)
- Vérifiez l'utilisation mémoire

## 10. Succès Attendu

Si tout fonctionne correctement:
1. L'interface se charge sur `http://localhost:3000`
2. L'API répond sur `http://localhost:8000`
3. Les images sont analysées avec résultats
4. Les erreurs sont gérées proprement
5. L'expérience utilisateur est fluide

## 11. Rapport de Test

Notez les résultats:
- [ ] Backend: OK/Erreur
- [ ] Frontend: OK/Erreur  
- [ ] Upload: OK/Erreur
- [ ] Analyse: OK/Erreur
- [ ] Erreurs: OK/Erreur

**Temps de réponse moyen:** _____ secondes
**Navigateurs testés:** _____
**Issues rencontrés:** _____
