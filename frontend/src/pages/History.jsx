// src/pages/History.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const [historyRes, statsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/predict/history", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:8000/api/predict/stats", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setHistory(historyRes.data.history || []);
        setStats(statsRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Impossible de charger l'historique");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#22d3a5";
    if (confidence >= 60) return "#fbbf24";
    return "#f87171";
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return "Élevée";
    if (confidence >= 60) return "Modérée";
    return "Faible";
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.pulseRing}></div>
          <div style={styles.pulseCore}></div>
          <p style={styles.loadingText}>Chargement de l'historique…</p>
          <style>{keyframes}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.errorIcon}>⚠</div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Réessayer
          </button>
          <style>{keyframes}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{keyframes}</style>
      <Header />

      {/* Ambient background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.page}>
        <div style={styles.container}>

          {/* ── Hero Header ── */}
          <div style={{ ...styles.heroHeader, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot} />
              Tableau de bord médical
            </div>
            <h1 style={styles.heroTitle}>
              Historique des<br />
              <span style={styles.heroTitleAccent}>Prédictions</span>
            </h1>
            <p style={styles.heroSubtitle}>Analysez l'évolution de vos diagnostics en temps réel</p>
          </div>

          {/* ── Stats Cards ── */}
          {stats && (
            <div style={styles.statsGrid}>
              {[
                { value: stats.total || 0, label: "Analyses totales", icon: "◈", delay: "0ms" },
                { value: stats.by_disease?.length || 0, label: "Maladies détectées", icon: "◉", delay: "80ms" },
                {
                  value: stats.by_disease?.length > 0
                    ? `${Math.max(...stats.by_disease.map(d => d.avg_confidence || 0)).toFixed(0)}%`
                    : "—",
                  label: "Confiance max", icon: "◆", delay: "160ms"
                },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, animationDelay: s.delay, animation: "slideUp 0.6s ease forwards" }}>
                  <div style={styles.statIconWrap}>
                    <span style={styles.statIcon}>{s.icon}</span>
                  </div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                  <div style={styles.statGlow} />
                </div>
              ))}
            </div>
          )}

          {/* ── Disease Distribution ── */}
          {stats?.by_disease && stats.by_disease.length > 0 && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleWrap}>
                  <span style={styles.panelIcon}>▦</span>
                  <h2 style={styles.panelTitle}>Distribution par maladie</h2>
                </div>
                <span style={styles.panelBadge}>{stats.by_disease.length} types</span>
              </div>
              <div style={styles.distributionList}>
                {stats.by_disease.map((item, index) => {
                  const pct = ((item.count / stats.total) * 100).toFixed(1);
                  const color = getConfidenceColor(item.avg_confidence);
                  return (
                    <div key={index} style={styles.distributionItem}>
                      <div style={styles.distLeft}>
                        <div style={{ ...styles.distDot, background: color, boxShadow: `0 0 10px ${color}66` }} />
                        <span style={styles.distName}>{item.maladie}</span>
                      </div>
                      <div style={styles.distRight}>
                        <div style={styles.distBarWrap}>
                          <div
                            style={{
                              ...styles.distBarFill,
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}cc, ${color})`,
                              boxShadow: `0 0 8px ${color}55`,
                            }}
                          />
                        </div>
                        <span style={styles.distCount}>{item.count}×</span>
                        <span style={{ ...styles.distConf, color }}>{item.avg_confidence?.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── History List ── */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelTitleWrap}>
                <span style={styles.panelIcon}>≡</span>
                <h2 style={styles.panelTitle}>Historique détaillé</h2>
              </div>
              {history.length > 0 && (
                <span style={styles.panelBadge}>{history.length} entrées</span>
              )}
            </div>

            {history.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIconWrap}>🔬</div>
                <p style={styles.emptyTitle}>Aucune analyse effectuée</p>
                <p style={styles.emptySubtitle}>Commencez votre première prédiction dès maintenant</p>
                <button onClick={() => navigate("/predict")} style={styles.ctaButton}>
                  <span>Lancer une analyse</span>
                  <span style={styles.ctaArrow}>→</span>
                </button>
              </div>
            ) : (
              <div style={styles.historyList}>
                {history.map((item, index) => {
                  const color = getConfidenceColor(item.confidence);
                  const isOpen = selectedPrediction === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.historyCard,
                        ...(isOpen ? styles.historyCardOpen : {}),
                        animationDelay: `${index * 40}ms`,
                        animation: "slideUp 0.5s ease forwards",
                        opacity: 0,
                      }}
                      onClick={() => setSelectedPrediction(isOpen ? null : item.id)}
                    >
                      {/* Left accent bar */}
                      <div style={{ ...styles.cardAccent, background: color, boxShadow: `0 0 12px ${color}88` }} />

                      <div style={styles.cardMain}>
                        <div style={styles.cardLeft}>
                          <span style={styles.cardIndex}>#{String(history.length - index).padStart(2, "0")}</span>
                          <div>
                            <div style={styles.cardDisease}>{item.maladie}</div>
                            <div style={styles.cardDate}>{formatDate(item.date)}</div>
                          </div>
                        </div>
                        <div style={styles.cardRight}>
                          <div style={styles.confidencePill}>
                            <div style={{ ...styles.pillDot, background: color, boxShadow: `0 0 6px ${color}` }} />
                            <span style={{ ...styles.pillValue, color }}>{item.confidence?.toFixed(1)}%</span>
                            <span style={styles.pillLabel}>{getConfidenceLabel(item.confidence)}</span>
                          </div>
                          <div style={{ ...styles.chevron, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                            ⌄
                          </div>
                        </div>
                      </div>

                      {/* Expanded probabilities */}
                      {isOpen && item.all_probabilities && (
                        <div style={styles.expandedSection}>
                          <p style={styles.expandedLabel}>Probabilités détaillées</p>
                          <div style={styles.probList}>
                            {Object.entries(item.all_probabilities).map(([disease, prob]) => {
                              const isMain = disease === item.maladie;
                              const numericProb = parseFloat(prob);
                              return (
                                <div key={disease} style={styles.probRow}>
                                  <span style={{ ...styles.probName, color: isMain ? "#22d3a5" : "#94a3b8" }}>
                                    {isMain && "● "}{disease}
                                  </span>
                                  <div style={styles.probBarWrap}>
                                    <div
                                      style={{
                                        ...styles.probBarFill,
                                        width: prob,
                                        background: isMain
                                          ? "linear-gradient(90deg, #22d3a5, #34d399)"
                                          : "rgba(148,163,184,0.25)",
                                      }}
                                    />
                                  </div>
                                  <span style={{ ...styles.probVal, color: isMain ? "#22d3a5" : "#64748b" }}>
                                    {prob}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Styles ─────────────── */

const keyframes = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.4); opacity:0.4; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes orbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
`;

const styles = {
  root: {
    position: "relative",
    minHeight: "100vh",
    background: "#050d1a",
    overflow: "hidden",
  },

  /* Ambient orbs */
  orb1: {
    position: "fixed", top: "-200px", right: "-100px",
    width: "600px", height: "600px",
    background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
    animation: "orbFloat 12s ease-in-out infinite",
  },
  orb2: {
    position: "fixed", bottom: "-150px", left: "-100px",
    width: "500px", height: "500px",
    background: "radial-gradient(circle, rgba(34,211,165,0.12) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
    animation: "orbFloat 15s ease-in-out infinite reverse",
  },
  orb3: {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    width: "800px", height: "800px",
    background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },

  /* Loading */
  loadingContainer: {
    minHeight: "100vh",
    background: "#050d1a",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "16px", position: "relative",
  },
  pulseRing: {
    width: "60px", height: "60px",
    border: "2px solid rgba(34,211,165,0.3)",
    borderRadius: "50%",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  pulseCore: {
    width: "20px", height: "20px",
    background: "#22d3a5",
    borderRadius: "50%",
    position: "absolute",
    animation: "pulse 1.5s ease-in-out infinite 0.2s",
  },
  loadingText: { color: "#64748b", fontSize: "14px", letterSpacing: "0.1em", fontFamily: "monospace" },
  errorIcon: { fontSize: "48px" },
  errorText: { color: "#f87171", fontSize: "16px" },
  retryButton: {
    padding: "10px 28px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "white", border: "none",
    borderRadius: "8px", cursor: "pointer",
    fontSize: "14px", fontWeight: "600",
  },

  /* Layout */
  page: {
    position: "relative", zIndex: 1,
    padding: "48px 24px 80px",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
    display: "flex", flexDirection: "column", gap: "28px",
  },

  /* Hero */
  heroHeader: { textAlign: "center", paddingBottom: "12px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "6px 16px",
    border: "1px solid rgba(34,211,165,0.3)",
    borderRadius: "100px",
    fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#22d3a5",
    background: "rgba(34,211,165,0.06)",
    marginBottom: "20px",
  },
  heroBadgeDot: {
    width: "6px", height: "6px",
    background: "#22d3a5",
    borderRadius: "50%",
    boxShadow: "0 0 6px #22d3a5",
    display: "inline-block",
    animation: "pulse 2s ease-in-out infinite",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 1.1,
    marginBottom: "16px",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.02em",
  },
  heroTitleAccent: {
    background: "linear-gradient(135deg, #22d3a5 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "15px", color: "#64748b",
    letterSpacing: "0.02em",
  },

  /* Stats */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "28px 24px",
    position: "relative", overflow: "hidden",
    backdropFilter: "blur(12px)",
    opacity: 0,
    transition: "border-color 0.3s, transform 0.3s",
  },
  statIconWrap: {
    width: "40px", height: "40px",
    borderRadius: "12px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "16px",
  },
  statIcon: { fontSize: "18px", color: "#3b82f6" },
  statValue: {
    fontSize: "42px", fontWeight: "800",
    color: "#f1f5f9", lineHeight: 1,
    marginBottom: "8px",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: { fontSize: "13px", color: "#64748b", letterSpacing: "0.04em" },
  statGlow: {
    position: "absolute", bottom: 0, right: 0,
    width: "80px", height: "80px",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
  },

  /* Panel */
  panel: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "24px",
    padding: "28px",
    backdropFilter: "blur(12px)",
  },
  panelHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  panelTitleWrap: { display: "flex", alignItems: "center", gap: "12px" },
  panelIcon: { fontSize: "20px", color: "#3b82f6" },
  panelTitle: {
    fontSize: "17px", fontWeight: "700",
    color: "#e2e8f0", letterSpacing: "-0.01em",
  },
  panelBadge: {
    padding: "4px 12px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: "100px",
    fontSize: "11px", color: "#93c5fd",
    fontWeight: "600", letterSpacing: "0.05em",
  },

  /* Distribution */
  distributionList: { display: "flex", flexDirection: "column", gap: "14px" },
  distributionItem: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "16px",
    flexWrap: "wrap",
  },
  distLeft: { display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" },
  distDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  distName: { fontSize: "14px", color: "#cbd5e1", fontWeight: "500" },
  distRight: { display: "flex", alignItems: "center", gap: "14px", flex: 1 },
  distBarWrap: {
    flex: 1, height: "6px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "100px", overflow: "hidden",
  },
  distBarFill: { height: "100%", borderRadius: "100px", transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" },
  distCount: { fontSize: "12px", color: "#475569", minWidth: "28px", textAlign: "right" },
  distConf: { fontSize: "12px", fontWeight: "700", minWidth: "48px", textAlign: "right" },

  /* History list */
  historyList: { display: "flex", flexDirection: "column", gap: "10px" },
  historyCard: {
    position: "relative",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "18px 18px 18px 24px",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, transform 0.15s",
    overflow: "hidden",
    opacity: 0,
  },
  historyCardOpen: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(59,130,246,0.2)",
  },
  cardAccent: {
    position: "absolute", left: 0, top: "12px", bottom: "12px",
    width: "3px", borderRadius: "0 3px 3px 0",
  },
  cardMain: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap", gap: "12px",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: "16px" },
  cardIndex: {
    fontSize: "11px", color: "#334155",
    fontFamily: "monospace", fontWeight: "700",
    letterSpacing: "0.05em",
  },
  cardDisease: { fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "3px" },
  cardDate: { fontSize: "11px", color: "#475569" },
  cardRight: { display: "flex", alignItems: "center", gap: "16px" },
  confidencePill: {
    display: "flex", alignItems: "center", gap: "7px",
    padding: "5px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "100px",
  },
  pillDot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  pillValue: { fontSize: "14px", fontWeight: "800", fontVariantNumeric: "tabular-nums" },
  pillLabel: { fontSize: "11px", color: "#475569" },
  chevron: {
    fontSize: "20px", color: "#334155",
    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    userSelect: "none", lineHeight: 1,
  },

  /* Expanded */
  expandedSection: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  expandedLabel: {
    fontSize: "11px", color: "#475569",
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: "14px", fontWeight: "600",
  },
  probList: { display: "flex", flexDirection: "column", gap: "9px" },
  probRow: { display: "flex", alignItems: "center", gap: "12px" },
  probName: { fontSize: "12px", fontWeight: "500", minWidth: "160px" },
  probBarWrap: {
    flex: 1, height: "5px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "100px", overflow: "hidden",
  },
  probBarFill: { height: "100%", borderRadius: "100px", transition: "width 0.5s ease" },
  probVal: { fontSize: "11px", fontWeight: "700", minWidth: "45px", textAlign: "right", fontVariantNumeric: "tabular-nums" },

  /* Empty */
  emptyState: {
    textAlign: "center", padding: "60px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
  },
  emptyIconWrap: { fontSize: "56px", lineHeight: 1, marginBottom: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
  emptySubtitle: { fontSize: "14px", color: "#475569", marginBottom: "8px" },
  ctaButton: {
    marginTop: "12px",
    display: "inline-flex", alignItems: "center", gap: "10px",
    padding: "13px 28px",
    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    color: "white", border: "none",
    borderRadius: "12px", cursor: "pointer",
    fontSize: "14px", fontWeight: "700",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 24px rgba(59,130,246,0.35)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  ctaArrow: { fontSize: "18px", lineHeight: 1 },
};
