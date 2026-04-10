@echo off
echo Démarrage de SkinAI - Détection de Maladies de la Peau
echo.

echo [1/2] Démarrage du backend FastAPI...
cd backend
start "Backend API" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Attente du démarrage du backend (5 secondes)...
timeout /t 5 /nobreak >nul

echo [2/2] Démarrage du frontend React...
cd ../frontend
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo SkinAI est en cours de démarrage...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Les fenêtres de terminal vont s'ouvrir séparément.
echo ========================================
echo.

pause
