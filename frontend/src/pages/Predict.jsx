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
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleFileInput = useCallback((e) => handleFileSelect(e.target.files[0]), [handleFileSelect]);

  const analyzeImage = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    setRecommendations(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:8000/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const apiResults = response.data;
      setResults({ maladie: apiResults.maladie, confiance: apiResults.confiance, probabilites: apiResults.probabilites });

      setLoadingRecommendations(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const url = `http://localhost:8000/api/recommend/${encodeURIComponent(apiResults.maladie)}${user.city ? `?city=${user.city}` : ""}`;
        const rec = await axios.get(url);
        setRecommendations(rec.data);
      } catch {
        setRecommendations({ error: "Impossible de charger les recommandations" });
      } finally {
        setLoadingRecommendations(false);
      }
    } catch (err) {
      if (err.response) setError(`Erreur serveur: ${err.response.data.detail || "Service indisponible"}`);
      else if (err.request) setError("Backend non disponible. Veuillez démarrer le serveur Python (port 8000).");
      else setError("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null); setPreview(null);
    setResults(null); setError(null); setRecommendations(null);
  };

  const getConfidenceColor = (conf) => {
    const num = parseFloat(conf);
    if (num >= 80) return "#22d3a5";
    if (num >= 60) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div style={S.root}>
      <style>{kf}</style>
      <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
      <Header />

      <main style={S.main}>
        <div style={S.container}>

          {/* ── Hero ── */}
          <div style={{ ...S.hero, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={S.heroBadge}><span style={S.badgeDot} />Analyse par IA</div>
            <h1 style={S.heroTitle}>Détection de<br /><span style={S.heroAccent}>Maladies Cutanées</span></h1>
            <p style={S.heroSub}>Intelligence artificielle pour un diagnostic préliminaire précis</p>
          </div>

          {/* ── Upload + Results Grid ── */}
          <div style={S.grid}>

            {/* LEFT — Upload */}
            <div style={S.panel}>
              <div style={S.panelTopGlow} />
              <div style={S.panelHeader}>
                <span style={S.panelIcon}>⬆</span>
                <h2 style={S.panelTitle}>Image à analyser</h2>
              </div>

              {!preview ? (
                <div
                  style={{
                    ...S.dropZone,
                    ...(isDragging ? S.dropZoneActive : {}),
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <div style={S.dropIcon}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: isDragging ? "#818cf8" : "#475569" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p style={S.dropText}>Glissez-déposez une image ici</p>
                  <p style={S.dropSubtext}>ou cliquez pour sélectionner • JPG, PNG, WEBP</p>
                  <input id="file-input" type="file" style={{ display: "none" }} accept="image/*" onChange={handleFileInput} />
                  <div style={S.dropBadge}>Sélectionner un fichier</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={S.previewWrap}>
                    <img src={preview} alt="Preview" style={S.previewImg} />
                    <div style={S.previewOverlay}>
                      <button onClick={resetAnalysis} style={S.removeBtn}>✕ Supprimer</button>
                    </div>
                  </div>
                  <button onClick={analyzeImage} disabled={isAnalyzing} style={{ ...S.analyzeBtn, ...(isAnalyzing ? S.analyzeBtnDisabled : {}) }}>
                    {isAnalyzing ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <span style={S.spinner} />
                        Analyse en cours…
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                        <span>⬡</span> Analyser l'image
                      </span>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div style={S.errorBox}>
                  <span>⚠</span> {error}
                </div>
              )}
            </div>

            {/* RIGHT — Results */}
            <div style={S.panel}>
              <div style={S.panelTopGlow} />
              <div style={S.panelHeader}>
                <span style={S.panelIcon}>◈</span>
                <h2 style={S.panelTitle}>Résultats de l'analyse</h2>
              </div>

              {results ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Main diagnosis */}
                  <div style={S.diagnosisCard}>
                    <div style={{ ...S.diagnosisDot, background: getConfidenceColor(parseFloat(results.confiance)), boxShadow: `0 0 10px ${getConfidenceColor(parseFloat(results.confiance))}` }} />
                    <div>
                      <p style={S.diagnosisLabel}>Diagnostic principal</p>
                      <p style={S.diagnosisName}>{results.maladie}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span style={{ ...S.confidenceBadge, color: getConfidenceColor(parseFloat(results.confiance)), borderColor: `${getConfidenceColor(parseFloat(results.confiance))}44`, background: `${getConfidenceColor(parseFloat(results.confiance))}11` }}>
                          {results.confiance} confiance
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Probabilities */}
                  {results.probabilites && (
                    <div>
                      <p style={S.probTitle}>Probabilités détaillées</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {Object.entries(results.probabilites).map(([disease, prob]) => {
                          const isMain = disease === results.maladie;
                          return (
                            <div key={disease} style={S.probRow}>
                              <span style={{ ...S.probName, color: isMain ? "#22d3a5" : "#64748b" }}>
                                {isMain && "● "}{disease}
                              </span>
                              <div style={S.probBarWrap}>
                                <div style={{
                                  ...S.probBarFill,
                                  width: prob,
                                  background: isMain ? "linear-gradient(90deg,#22d3a5,#34d399)" : "rgba(148,163,184,0.18)",
                                }} />
                              </div>
                              <span style={{ ...S.probVal, color: isMain ? "#22d3a5" : "#475569" }}>{prob}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div style={S.disclaimer}>
                    <span style={S.disclaimerIcon}>⚠</span>
                    <p style={S.disclaimerText}>Ce diagnostic est préliminaire et ne remplace pas un avis médical professionnel.</p>
                  </div>
                </div>
              ) : (
                <div style={S.emptyResults}>
                  <div style={S.emptyIconWrap}>
                    {isAnalyzing ? (
                      <span style={{ ...S.spinner, width: "32px", height: "32px", borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#818cf8" }} />
                    ) : (
                      <svg width="32" height="32" fill="none" stroke="#475569" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                  <p style={S.emptyTitle}>{isAnalyzing ? "Analyse en cours…" : "En attente d'une image"}</p>
                  <p style={S.emptySub}>{isAnalyzing ? "L'IA traite votre image…" : "Téléchargez une photo pour voir les résultats"}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Recommendations ── */}
          {(loadingRecommendations || recommendations) && (
            <div style={{ ...S.recoSection, animation: "slideUp 0.6s ease forwards" }}>
              <div style={S.recoHeader}>
                <span style={S.recoHeaderIcon}>◆</span>
                <h2 style={S.recoTitle}>Recommandations personnalisées</h2>
              </div>

              {loadingRecommendations ? (
                <div style={S.recoLoading}>
                  <div style={{ ...S.spinner, width: "36px", height: "36px", borderColor: "rgba(99,102,241,0.25)", borderTopColor: "#818cf8" }} />
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Chargement des recommandations…</p>
                </div>
              ) : recommendations && !recommendations.error ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Doctors */}
                  {recommendations.medecins?.length > 0 && (
                    <div style={S.recoPanel}>
                      <div style={S.panelTopGlow} />
                      <div style={S.panelHeader}>
                        <span style={S.panelIcon}>⚕</span>
                        <h3 style={S.panelTitle}>Médecins spécialistes près de chez vous</h3>
                      </div>
                      <div style={S.doctorsGrid}>
                        {recommendations.medecins.map((m) => (
                          <div key={m.id} style={S.doctorCard}>
                            <div style={S.doctorAvatar}>
                              {m.first_name?.[0]}{m.last_name?.[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={S.doctorName}>Dr. {m.first_name} {m.last_name}</p>
                              <p style={S.doctorSpec}>{m.specialty}</p>
                              <p style={S.doctorCity}>◎ {m.city || "Ville non spécifiée"}</p>
                              <div style={S.doctorRating}>
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} style={{ color: s <= Math.round(m.avg_rating || 0) ? "#fbbf24" : "#1e293b", fontSize: "13px" }}>★</span>
                                ))}
                                <span style={S.doctorRatingNum}>{m.avg_rating?.toFixed(1) || "Nouveau"}</span>
                                <span style={S.doctorRatingCount}>({m.rating_count || 0})</span>
                              </div>
                              {m.weighted_score && (
                                <div style={S.scoreRow}>
                                  <span style={S.scoreLabel}>Score:</span>
                                  <div style={S.scoreBarWrap}>
                                    <div style={{ ...S.scoreBarFill, width: `${m.weighted_score * 100}%` }} />
                                  </div>
                                  <span style={S.scoreVal}>{(m.weighted_score * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soins */}
                  {recommendations.soins?.length > 0 && (
                    <div style={S.recoPanel}>
                      <div style={S.panelTopGlow} />
                      <div style={S.panelHeader}>
                        <span style={S.panelIcon}>✦</span>
                        <h3 style={S.panelTitle}>Soins et traitements recommandés</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {recommendations.soins.map((soin, i) => (
                          <div key={soin.id} style={{ ...S.soinItem, borderBottom: i < recommendations.soins.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                            <div style={S.soinDot} />
                            <div style={{ flex: 1 }}>
                              <p style={S.soinTitle}>{soin.titre}</p>
                              <p style={S.soinInstructions}>{soin.instructions}</p>
                              {soin.produits?.length > 0 && (
                                <div style={S.soinTags}>
                                  {soin.produits.map(p => (
                                    <span key={p.id} style={S.soinTag}>{p.nom}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : recommendations?.error && (
                <div style={S.recoError}>
                  <span>⚠</span> {recommendations.error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Keyframes ─── */
const kf = `
  @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-28px) scale(1.04);} }
  @keyframes pulse { 0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.4);opacity:0.3;} }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─── Styles ─── */
const S = {
  root: { position: "relative", minHeight: "100vh", background: "#050d1a", overflow: "hidden" },
  orb1: { position: "fixed", top: "-160px", right: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 13s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-120px", left: "-80px", width: "460px", height: "460px", background: "radial-gradient(circle,rgba(34,211,165,0.11) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 16s ease-in-out infinite reverse" },
  orb3: { position: "fixed", top: "45%", left: "40%", width: "700px", height: "700px", background: "radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },

  main: { position: "relative", zIndex: 1, padding: "48px 24px 100px" },
  container: { maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" },

  /* Hero */
  hero: { textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#93c5fd", background: "rgba(59,130,246,0.07)", marginBottom: "22px" },
  badgeDot: { width: "6px", height: "6px", background: "#60a5fa", borderRadius: "50%", boxShadow: "0 0 6px #60a5fa", display: "inline-block", animation: "pulse 2s ease-in-out infinite" },
  heroTitle: { fontSize: "clamp(28px,5.5vw,52px)", fontWeight: "800", color: "#f1f5f9", lineHeight: 1.1, marginBottom: "16px", fontFamily: "'Georgia',serif", letterSpacing: "-0.02em" },
  heroAccent: { background: "linear-gradient(135deg,#60a5fa 0%,#22d3a5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "15px", color: "#64748b", letterSpacing: "0.02em" },

  /* Grid */
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px" },

  /* Panel */
  panel: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "28px", backdropFilter: "blur(14px)", overflow: "hidden" },
  panelTopGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)" },
  panelHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" },
  panelIcon: { fontSize: "18px", color: "#6366f1" },
  panelTitle: { fontSize: "16px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.01em" },

  /* Drop zone */
  dropZone: { border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "16px", padding: "48px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  dropZoneActive: { border: "1px dashed rgba(99,102,241,0.6)", background: "rgba(99,102,241,0.05)" },
  dropIcon: { width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" },
  dropText: { fontSize: "15px", color: "#94a3b8", fontWeight: "500" },
  dropSubtext: { fontSize: "12px", color: "#475569" },
  dropBadge: { marginTop: "12px", padding: "9px 22px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: "#a5b4fc" },

  /* Preview */
  previewWrap: { position: "relative", borderRadius: "14px", overflow: "hidden" },
  previewImg: { width: "100%", height: "220px", objectFit: "cover", display: "block" },
  previewOverlay: { position: "absolute", top: "10px", right: "10px" },
  removeBtn: { padding: "6px 14px", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", color: "#f87171", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  /* Analyze button */
  analyzeBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none", borderRadius: "12px", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(59,130,246,0.35)", transition: "opacity 0.2s,transform 0.15s", letterSpacing: "0.02em" },
  analyzeBtnDisabled: { background: "rgba(255,255,255,0.06)", boxShadow: "none", cursor: "not-allowed", color: "#475569" },
  spinner: { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  /* Error */
  errorBox: { marginTop: "16px", padding: "12px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", color: "#f87171", fontSize: "13px", display: "flex", gap: "8px", alignItems: "center" },

  /* Diagnosis */
  diagnosisCard: { display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px", background: "rgba(34,211,165,0.05)", border: "1px solid rgba(34,211,165,0.15)", borderRadius: "16px" },
  diagnosisDot: { width: "10px", height: "10px", borderRadius: "50%", marginTop: "6px", flexShrink: 0 },
  diagnosisLabel: { fontSize: "11px", color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" },
  diagnosisName: { fontSize: "20px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.01em" },
  confidenceBadge: { display: "inline-block", padding: "3px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", border: "1px solid" },

  /* Probs */
  probTitle: { fontSize: "12px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "600", marginBottom: "12px" },
  probRow: { display: "flex", alignItems: "center", gap: "10px" },
  probName: { fontSize: "12px", fontWeight: "500", minWidth: "140px" },
  probBarWrap: { flex: 1, height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" },
  probBarFill: { height: "100%", borderRadius: "100px", transition: "width 0.5s ease" },
  probVal: { fontSize: "11px", fontWeight: "700", minWidth: "44px", textAlign: "right", fontVariantNumeric: "tabular-nums" },

  /* Disclaimer */
  disclaimer: { display: "flex", gap: "10px", padding: "12px 16px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px" },
  disclaimerIcon: { fontSize: "16px", color: "#fbbf24", flexShrink: 0, marginTop: "1px" },
  disclaimerText: { fontSize: "12px", color: "#92400e", color: "#d97706", lineHeight: "1.5" },

  /* Empty results */
  emptyResults: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", gap: "12px", textAlign: "center" },
  emptyIconWrap: { width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: "15px", fontWeight: "700", color: "#475569" },
  emptySub: { fontSize: "12px", color: "#334155" },

  /* Recommendations section */
  recoSection: { display: "flex", flexDirection: "column", gap: "20px", opacity: 0 },
  recoHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" },
  recoHeaderIcon: { fontSize: "18px", color: "#6366f1" },
  recoTitle: { fontSize: "22px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.01em" },
  recoLoading: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "48px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px" },
  recoPanel: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "28px", backdropFilter: "blur(14px)", overflow: "hidden" },
  recoError: { padding: "16px 20px", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "12px", color: "#d97706", fontSize: "14px", display: "flex", gap: "10px", alignItems: "center" },

  /* Doctors reco */
  doctorsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "14px" },
  doctorCard: { display: "flex", gap: "14px", padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", transition: "border-color 0.2s" },
  doctorAvatar: { width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg,#3730a3,#1e40af)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc", fontSize: "16px", fontWeight: "800", flexShrink: 0 },
  doctorName: { fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "3px" },
  doctorSpec: { fontSize: "11px", color: "#6366f1", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" },
  doctorCity: { fontSize: "11px", color: "#475569", marginTop: "4px" },
  doctorRating: { display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" },
  doctorRatingNum: { fontSize: "12px", fontWeight: "700", color: "#fbbf24", marginLeft: "2px" },
  doctorRatingCount: { fontSize: "11px", color: "#475569" },
  scoreRow: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" },
  scoreLabel: { fontSize: "11px", color: "#475569", minWidth: "42px" },
  scoreBarWrap: { flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" },
  scoreBarFill: { height: "100%", background: "linear-gradient(90deg,#22d3a5,#34d399)", borderRadius: "100px", transition: "width 0.5s ease" },
  scoreVal: { fontSize: "11px", fontWeight: "700", color: "#22d3a5", minWidth: "30px", textAlign: "right" },

  /* Soins */
  soinItem: { display: "flex", gap: "14px", paddingBottom: "16px" },
  soinDot: { width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", marginTop: "6px", boxShadow: "0 0 8px #6366f1", flexShrink: 0 },
  soinTitle: { fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "5px" },
  soinInstructions: { fontSize: "12px", color: "#64748b", lineHeight: "1.6" },
  soinTags: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" },
  soinTag: { padding: "3px 10px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "100px", fontSize: "11px", color: "#a5b4fc", fontWeight: "500" },
};
