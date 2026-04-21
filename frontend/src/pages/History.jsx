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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        // Récupérer l'historique
        const historyRes = await axios.get("http://localhost:8000/api/predict/history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Récupérer les statistiques
        const statsRes = await axios.get("http://localhost:8000/api/predict/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setHistory(historyRes.data.history || []);
        setStats(statsRes.data);
        
      } catch (err) {
        console.error("Erreur:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Impossible de charger l'historique");
        }
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#10b981"; // vert
    if (confidence >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // rouge
  };

  const getDiseaseIcon = (disease) => {
    const icons = {
      "Eczema": "🩹",
      "Psoriasis": "🔴",
      "Acne": "⚪",
      "Melanoma": "⚠️",
      "Basal_Cell_Carcinoma": "🔬",
      "Atopic_Dermatitis": "🩺",
      "Tinea_Ringworm": "🔄",
      "Keratosis": "📌",
      "Warts_Molluscum": "●",
      "Melanocytic_Nevi": "⚫"
    };
    return icons[disease] || "🩺";
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Chargement de votre historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>📋 Historique des prédictions</h1>
            <p style={styles.subtitle}>Suivez l'évolution de vos analyses</p>
          </div>

          {/* Statistiques */}
          {stats && (
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.total || 0}</div>
                <div style={styles.statLabel}>Total prédictions</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.by_disease?.length || 0}</div>
                <div style={styles.statLabel}>Maladies détectées</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {stats.by_disease?.length > 0 
                    ? Math.max(...stats.by_disease.map(d => d.count))
                    : 0}
                </div>
                <div style={styles.statLabel}>Maximum par maladie</div>
              </div>
            </div>
          )}

          {/* Distribution des maladies */}
          {stats?.by_disease && stats.by_disease.length > 0 && (
            <div style={styles.distributionContainer}>
              <h2 style={styles.sectionTitle}>📊 Distribution par maladie</h2>
              <div style={styles.distributionList}>
                {stats.by_disease.map((item, index) => (
                  <div key={index} style={styles.distributionItem}>
                    <div style={styles.distributionLeft}>
                      <span style={styles.diseaseIcon}>{getDiseaseIcon(item.maladie)}</span>
                      <span style={styles.diseaseName}>{item.maladie}</span>
                    </div>
                    <div style={styles.distributionRight}>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${(item.count / stats.total) * 100}%`,
                            backgroundColor: getConfidenceColor(item.avg_confidence)
                          }}
                        />
                      </div>
                      <span style={styles.diseaseCount}>{item.count} fois</span>
                      <span style={styles.diseaseConfidence}>
                        {item.avg_confidence?.toFixed(1)}% confiance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des prédictions */}
          <div style={styles.historyContainer}>
            <h2 style={styles.sectionTitle}>📜 Historique détaillé</h2>
            
            {history.length === 0 ? (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>🔍</div>
                <p>Aucune prédiction encore effectuée</p>
                <button 
                  onClick={() => navigate("/predict")} 
                  style={styles.predictButton}
                >
                  Faire une prédiction
                </button>
              </div>
            ) : (
              <div style={styles.historyList}>
                {history.map((item, index) => (
                  <div 
                    key={item.id} 
                    style={styles.historyCard}
                    onClick={() => setSelectedPrediction(selectedPrediction === item.id ? null : item.id)}
                  >
                    <div style={styles.historyHeader}>
                      <div style={styles.historyLeft}>
                        <span style={styles.historyNumber}>#{history.length - index}</span>
                        <span style={styles.historyIcon}>{getDiseaseIcon(item.maladie)}</span>
                        <span style={styles.historyDisease}>{item.maladie}</span>
                      </div>
                      <div style={styles.historyRight}>
                        <span 
                          style={{
                            ...styles.confidenceBadge,
                            backgroundColor: getConfidenceColor(item.confidence)
                          }}
                        >
                          {item.confidence?.toFixed(1)}% confiance
                        </span>
                        <span style={styles.historyDate}>{formatDate(item.date)}</span>
                        <span style={styles.expandIcon}>
                          {selectedPrediction === item.id ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                    
                    {selectedPrediction === item.id && item.all_probabilities && (
                      <div style={styles.detailsContainer}>
                        <h4 style={styles.detailsTitle}>Probabilités détaillées</h4>
                        <div style={styles.probabilitiesList}>
                          {Object.entries(item.all_probabilities).map(([disease, prob]) => (
                            <div key={disease} style={styles.probabilityItem}>
                              <div style={styles.probabilityLeft}>
                                <span style={styles.probabilityName}>{disease}</span>
                              </div>
                              <div style={styles.probabilityBar}>
                                <div 
                                  style={{
                                    width: prob,
                                    height: "100%",
                                    backgroundColor: disease === item.maladie ? "#10b981" : "#e5e7eb",
                                    borderRadius: "10px",
                                    transition: "width 0.3s"
                                  }}
                                />
                              </div>
                              <span style={styles.probabilityValue}>{prob}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "white",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.9)",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  errorText: {
    color: "white",
    fontSize: "18px",
    marginBottom: "20px",
  },
  retryButton: {
    padding: "10px 20px",
    background: "white",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
  },
  distributionContainer: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
  },
  distributionList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  distributionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  distributionLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "180px",
  },
  diseaseIcon: {
    fontSize: "24px",
  },
  diseaseName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  distributionRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.3s",
  },
  diseaseCount: {
    fontSize: "12px",
    color: "#666",
    minWidth: "60px",
  },
  diseaseConfidence: {
    fontSize: "12px",
    color: "#999",
    minWidth: "70px",
  },
  historyContainer: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  historyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  historyLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  historyNumber: {
    fontSize: "12px",
    color: "#999",
  },
  historyIcon: {
    fontSize: "20px",
  },
  historyDisease: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  historyRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  confidenceBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    color: "white",
  },
  historyDate: {
    fontSize: "12px",
    color: "#999",
  },
  expandIcon: {
    fontSize: "12px",
    color: "#999",
  },
  detailsContainer: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e5e7eb",
  },
  detailsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "10px",
  },
  probabilitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  probabilityItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  probabilityLeft: {
    width: "150px",
  },
  probabilityName: {
    fontSize: "12px",
    color: "#666",
  },
  probabilityBar: {
    flex: 1,
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  probabilityValue: {
    fontSize: "11px",
    color: "#999",
    minWidth: "45px",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  predictButton: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

// Ajout de l'animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);