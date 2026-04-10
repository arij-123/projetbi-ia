#!/bin/bash

echo "Démarrage de SkinAI - Détection de Maladies de la Peau"
echo

echo "[1/2] Démarrage du backend FastAPI..."
cd backend
gnome-terminal -- bash -c "uvicorn main:app --reload --host 0.0.0.0 --port 8000; exec bash" &
BACKEND_PID=$!

echo "Attente du démarrage du backend (5 secondes)..."
sleep 5

echo "[2/2] Démarrage du frontend React..."
cd ../frontend
gnome-terminal -- bash -c "npm start; exec bash" &
FRONTEND_PID=$!

echo
echo "========================================"
echo "SkinAI est en cours de démarrage..."
echo
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo
echo "Les fenêtres de terminal vont s'ouvrir séparément."
echo "========================================"
echo

echo "Appuyez sur Ctrl+C pour arrêter tous les processus"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
