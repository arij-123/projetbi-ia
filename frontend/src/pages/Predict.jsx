import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "../index.css";
import Header from "../components/Header";


export default function Predict() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);  // ← AJOUTEZ CETTE LIGNE
  const [recommendations, setRecommendations] = useState(null);        // ← NOUVEAU

  // 🔐 Protection login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError(null);
      setResults(null);
    } else {
      setError("Veuillez sélectionner une image valide (JPG, PNG, etc.)");
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

 const analyzeImage = async () => {
  if (!selectedFile) return;

  setIsAnalyzing(true);
  setError(null);
  setRecommendations(null);  // ← AJOUTEZ CETTE LIGNE pour clear les anciennes recommandations

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:8000/api/predict",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const apiResults = response.data;

    setResults({
      maladie: apiResults.maladie,
      confiance: apiResults.confiance,
      probabilites: apiResults.probabilites,
    });
    
    // 🔥 Appel à la recommandation
    setLoadingRecommendations(true);  // ← AJOUTEZ CETTE LIGNE
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const recommendUrl = `http://localhost:8000/recommend/${encodeURIComponent(apiResults.maladie)}${user.city ? `?city=${user.city}` : ''}`;
      
      const recommendResponse = await axios.get(recommendUrl);
      setRecommendations(recommendResponse.data);
    } catch (recError) {
      console.error("Erreur recommandation:", recError);
      setRecommendations({ error: "Impossible de charger les recommandations" });
    } finally {
      setLoadingRecommendations(false);  // ← AJOUTEZ CETTE LIGNE
    }
    
  } catch (err) {
    if (err.response) {
      setError(
        `Erreur serveur: ${err.response.data.detail || "Service indisponible"}`
      );
    } else if (err.request) {
      setError(
        "Backend non disponible. Veuillez démarrer le serveur Python (port 8000)."
      );
    } else {
      setError("Erreur lors de l'analyse. Veuillez réessayer.");
    }
  } finally {
    setIsAnalyzing(false);
  }
};

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
return ( 
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

       <Header />
     

      {/* MAIN */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* HERO TEXT */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Détection de Maladies de la Peau
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Utilisez l'intelligence artificielle pour analyser les images de
              maladies de la peau et obtenir un diagnostic préliminaire.
            </p>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT — Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Image à analyser
              </h2>

              {!preview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">Glissez-déposez une image ici</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou cliquez pour sélectionner
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isAnalyzing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Analyse en cours...
                      </span>
                    ) : (
                      "Analyser l'image"
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT — Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Résultats de l'analyse
              </h2>

              {results ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Diagnostic principal
                    </h3>
                    <p className="text-lg font-bold text-green-900">
                      {results.maladie}
                    </p>
                    <p className="text-sm text-green-700">
                      Confiance: {results.confiance}
                    </p>
                  </div>

                  {results.probabilites && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Probabilités détaillées
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(results.probabilites).map(
                          ([disease, probability]) => (
                            <div
                              key={disease}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-700">
                                {disease}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      disease === results.maladie
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{ width: probability }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 w-12 text-right">
                                  {probability}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Important:</strong> Ce diagnostic est préliminaire
                      et ne remplace pas un avis médical professionnel.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    {isAnalyzing
                      ? "Analyse en cours..."
                      : "Attendez l'analyse d'une image"}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {isAnalyzing
                      ? "L'IA analyse votre image..."
                      : "Téléchargez une photo pour voir les résultats"}
                  </p>
                </div>
              )}
            </div>

          
          </div>
          {/* 🟢 AJOUTEZ LA SECTION RECOMMANDATIONS ICI 🟢 */}
        {(loadingRecommendations || recommendations) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Recommandations personnalisées
            </h2>
            
            {loadingRecommendations ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des recommandations...</p>
              </div>
            ) : recommendations && !recommendations.error ? (
              <div className="space-y-8">
                {/* Médecins recommandés */}
{recommendations.medecins && recommendations.medecins.length > 0 && (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <span className="text-2xl">👨‍⚕️</span>
      Médecins spécialistes près de chez vous
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      {recommendations.medecins.map((medecin) => (
        <div key={medecin.id} className="border rounded-lg p-4 hover:shadow-md transition">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {medecin.first_name?.[0]}{medecin.last_name?.[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">
                Dr. {medecin.first_name} {medecin.last_name}
              </h4>
              <p className="text-sm text-blue-600">{medecin.specialty}</p>
              <p className="text-xs text-gray-500 mt-1">
                📍 {medecin.city || "Ville non spécifiée"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">
                  {medecin.avg_rating?.toFixed(1) || "Nouveau"}
                </span>
                <span className="text-xs text-gray-400">
                  ({medecin.rating_count || 0} avis)
                </span>
              </div>
              
              {/* 🔥 AFFICHER LE WEIGHTED SCORE */}
              {medecin.weighted_score && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Score de confiance:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${medecin.weighted_score * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-green-600">
                        {(medecin.weighted_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                {/* Soins recommandés */}
                {recommendations.soins && recommendations.soins.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💊</span>
                      Soins et traitements recommandés
                    </h3>
                    <div className="space-y-4">
                      {recommendations.soins.map((soin) => (
                        <div key={soin.id} className="border-b last:border-0 pb-4 last:pb-0">
                          <h4 className="font-semibold text-gray-800">{soin.titre}</h4>
                          <p className="text-sm text-gray-600 mt-1">{soin.instructions}</p>
                          {soin.produits && soin.produits.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {soin.produits.map((produit) => (
                                <span key={produit.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {produit.nom}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : recommendations?.error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">{recommendations.error}</p>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
