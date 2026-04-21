import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import RatingModal from "../pages/RatingModal";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  
  // États pour le modal d'avis
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push("⭐");
    }
    if (hasHalfStar) {
      stars.push("½");
    }
    
    return stars.join(" ");
  };

  // Fonction pour rafraîchir la liste après un avis
  const handleRatingSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Utilisateur non connecté");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:8000/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("DATA DOCTORS:", res.data);

        if (!res.data || res.data.length === 0) {
          setDoctors([]);
          setFilteredDoctors([]);
        } else {
          setDoctors(res.data);
          setFilteredDoctors(res.data);
          
          // Extraire les villes uniques pour le filtre
          const uniqueCities = [...new Set(res.data.map(doc => doc.city).filter(city => city))];
          setCities(uniqueCities);
        }

      } catch (err) {
        console.log("ERROR:", err.response || err);
        if (err.response?.status === 401) {
          setError("Session expirée, reconnectez-vous");
        } else if (err.response?.status === 404) {
          setError("Route /doctors introuvable (backend)");
        } else {
          setError("Erreur serveur");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [refreshTrigger]);

  // Filtrer les médecins quand searchTerm ou selectedCity change
  useEffect(() => {
    let filtered = doctors;
    
    // Filtrer par recherche (nom, spécialité, ville)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(term) ||
        doc.specialty?.toLowerCase().includes(term) ||
        doc.city?.toLowerCase().includes(term) ||
        doc.location?.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par ville
    if (selectedCity) {
      filtered = filtered.filter(doc => doc.city === selectedCity);
    }
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedCity, doctors]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
  };

  return (
    <div>
      <Header />
      
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header Section */}
          <div style={styles.header}>
            <h1 style={styles.mainTitle}>Expert Specialists</h1>
            <p style={styles.subtitle}>Trouvez les meilleurs dermatologues</p>
          </div>

          {/* Barre de recherche et filtres */}
          <div style={styles.searchSection}>
            <div style={styles.searchBar}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité ou ville..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={styles.clearButton}>
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filters}>
              <select 
                value={selectedCity} 
                onChange={handleCityChange}
                style={styles.select}
              >
                <option value="">Toutes les villes</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              
              {(searchTerm || selectedCity) && (
                <button onClick={clearFilters} style={styles.clearFiltersButton}>
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>

          {/* Résultats count */}
          <div style={styles.resultsCount}>
            {filteredDoctors.length} médecin(s) trouvé(s)
          </div>

          {/* Loading State */}
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Chargement des spécialistes...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDoctors.length === 0 && !error && (
            <div style={styles.emptyContainer}>
              <p>Aucun médecin ne correspond à votre recherche</p>
              <button onClick={clearFilters} style={styles.resetButton}>
                Voir tous les médecins
              </button>
            </div>
          )}

          {/* Doctors Grid */}
          {!loading && filteredDoctors.length > 0 && (
            <>
              <div style={styles.grid}>
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} style={styles.card}>
                    {/* Avatar / Image */}
                    <div style={styles.avatarContainer}>
                      <div style={styles.avatar}>
                        {doc.image ? (
                          <img 
                            src={doc.image} 
                            alt={`${doc.first_name} ${doc.last_name}`}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <span style={styles.avatarText}>
                            {doc.first_name?.[0]}{doc.last_name?.[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <h3 style={styles.doctorName}>
                      Dr. {doc.first_name} {doc.last_name}
                    </h3>
                    
                    <p style={styles.specialty}>{doc.specialty}</p>
                    
                    <p style={styles.location}>
                      📍 {doc.city || "Paris"} • {doc.location || "France"}
                    </p>

                    {/* Rating */}
                    <div style={styles.ratingContainer}>
                      <span style={styles.stars}>
                        {renderStars(doc.avg_rating || 0)}
                      </span>
                      <span style={styles.ratingText}>
                        {doc.avg_rating?.toFixed(1) || "0.0"} 
                        ({doc.rating_count || 0} avis)
                      </span>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p style={styles.description}>
                        {doc.description.length > 100 
                          ? `${doc.description.substring(0, 100)}...` 
                          : doc.description}
                      </p>
                    )}

                    {/* Bouton Donner mon avis */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoctor(doc);
                        setShowRatingModal(true);
                      }} 
                      style={styles.ratingButton}
                    >
                      ⭐ Donner mon avis
                    </button>

                    {/* Book Button */}
                    <button style={styles.bookButton}>
                      Prendre rendez-vous
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal d'avis */}
      {showRatingModal && selectedDoctor && (
        <RatingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDoctor(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
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
    marginBottom: "30px",
  },
  mainTitle: {
    fontSize: "48px",
    fontWeight: "700",
    color: "white",
    marginBottom: "10px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255,255,255,0.9)",
  },
  searchSection: {
    marginBottom: "30px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: "50px",
    padding: "5px 20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginBottom: "15px",
  },
  searchIcon: {
    fontSize: "20px",
    marginRight: "10px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "15px 0",
    fontSize: "16px",
    background: "transparent",
  },
  clearButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
    padding: "5px",
  },
  filters: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  select: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "white",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
  },
  clearFiltersButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4757",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.3s",
  },
  resultsCount: {
    textAlign: "right",
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
  },
  card: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, boxShadow 0.3s ease",
    cursor: "pointer",
  },
  avatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarText: {
    fontSize: "36px",
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
  },
  doctorName: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: "8px",
  },
  specialty: {
    fontSize: "14px",
    color: "#667eea",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  location: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "15px",
  },
  ratingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginBottom: "15px",
  },
  stars: {
    fontSize: "16px",
    color: "#fbbf24",
  },
  ratingText: {
    fontSize: "13px",
    color: "#666",
  },
  description: {
    fontSize: "13px",
    color: "#888",
    textAlign: "center",
    marginBottom: "15px",
    lineHeight: "1.5",
  },
  ratingButton: {
    width: "100%",
    padding: "10px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background 0.3s ease",
  },
  bookButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px",
    color: "white",
  },
  spinner: {
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  errorContainer: {
    background: "#fee",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },
  errorText: {
    color: "#c33",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "50px",
    color: "white",
  },
  resetButton: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "white",
    border: "none",
    borderRadius: "8px",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

// Ajout des animations CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  }
  
  button:hover {
    opacity: 0.9;
  }
`;
document.head.appendChild(styleSheet);