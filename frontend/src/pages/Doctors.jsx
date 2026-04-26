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
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return Array(full).fill("★").join("") + (half ? "½" : "") + Array(5 - full - (half ? 1 : 0)).fill("☆").join("");
  };

  const handleRatingSubmitted = () => setRefreshTrigger(p => p + 1);

  useEffect(() => {
    setMounted(true);
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Utilisateur non connecté"); setLoading(false); return; }
        const res = await axios.get("http://localhost:8000/api/doctors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data || res.data.length === 0) {
          setDoctors([]); setFilteredDoctors([]);
        } else {
          setDoctors(res.data); setFilteredDoctors(res.data);
          const uniqueCities = [...new Set(res.data.map(d => d.city).filter(Boolean))];
          setCities(uniqueCities);
        }
      } catch (err) {
        if (err.response?.status === 401) setError("Session expirée, reconnectez-vous");
        else if (err.response?.status === 404) setError("Route introuvable (backend)");
        else setError("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = doctors;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(t) ||
        d.specialty?.toLowerCase().includes(t) ||
        d.city?.toLowerCase().includes(t)
      );
    }
    if (selectedCity) filtered = filtered.filter(d => d.city === selectedCity);
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedCity, doctors]);

  const clearFilters = () => { setSearchTerm(""); setSelectedCity(""); };

  return (
    <div style={styles.root}>
      <style>{keyframes}</style>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      <Header />

      <div style={styles.page}>
        <div style={styles.container}>

          {/* ── Hero ── */}
          <div style={{
            ...styles.hero,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot} />
              Réseau de spécialistes
            </div>
            <h1 style={styles.heroTitle}>
              Trouvez votre<br />
              <span style={styles.heroAccent}>Expert Médical</span>
            </h1>
            <p style={styles.heroSub}>Les meilleurs dermatologues à portée de main</p>
          </div>

          {/* ── Search Bar ── */}
          <div style={{
            ...styles.searchWrap,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
          }}>
            <div style={styles.searchBar}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Nom, spécialité ou ville…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={styles.clearBtn}>✕</button>
              )}
            </div>

            <div style={styles.filtersRow}>
              <div style={styles.selectWrap}>
                <span style={styles.selectIcon}>◎</span>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={styles.select}>
                  <option value="">Toutes les villes</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {(searchTerm || selectedCity) && (
                <button onClick={clearFilters} style={styles.clearFiltersBtn}>
                  ✕ Effacer
                </button>
              )}

              <span style={styles.resultsCount}>
                <span style={styles.resultsNum}>{filteredDoctors.length}</span> médecin{filteredDoctors.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={styles.centerState}>
              <div style={styles.pulseRing} />
              <p style={styles.stateText}>Chargement des spécialistes…</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={styles.errorPanel}>
              <span style={styles.errorIcon}>⚠</span>
              <p style={styles.errorMsg}>{error}</p>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && filteredDoctors.length === 0 && !error && (
            <div style={styles.centerState}>
              <div style={styles.emptyEmoji}>🔬</div>
              <p style={styles.emptyTitle}>Aucun médecin trouvé</p>
              <p style={styles.emptySubtitle}>Essayez de modifier vos filtres</p>
              <button onClick={clearFilters} style={styles.resetBtn}>Voir tous les médecins</button>
            </div>
          )}

          {/* ── Doctors Grid ── */}
          {!loading && filteredDoctors.length > 0 && (
            <div style={styles.grid}>
              {filteredDoctors.map((doc, index) => {
                const isHovered = hoveredCard === doc.id;
                const rating = doc.avg_rating || 0;
                const initials = `${doc.first_name?.[0] || ""}${doc.last_name?.[0] || ""}`;
                return (
                  <div
                    key={doc.id}
                    style={{
                      ...styles.card,
                      ...(isHovered ? styles.cardHovered : {}),
                      animation: `slideUp 0.5s ease forwards`,
                      animationDelay: `${index * 60}ms`,
                      opacity: 0,
                    }}
                    onMouseEnter={() => setHoveredCard(doc.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Top glow accent */}
                    <div style={styles.cardTopGlow} />

                    {/* Avatar */}
                    <div style={styles.avatarWrap}>
                      <div style={styles.avatarRing}>
                        <div style={styles.avatar}>
                          {doc.image ? (
                            <img src={doc.image} alt={`${doc.first_name} ${doc.last_name}`} style={styles.avatarImg} />
                          ) : (
                            <span style={styles.avatarInitials}>{initials}</span>
                          )}
                        </div>
                      </div>
                      {/* Online indicator */}
                      <div style={styles.onlineDot} />
                    </div>

                    {/* Name & specialty */}
                    <h3 style={styles.docName}>Dr. {doc.first_name} {doc.last_name}</h3>
                    <div style={styles.specialtyBadge}>{doc.specialty || "Dermatologue"}</div>

                    {/* Location */}
                    <div style={styles.locationRow}>
                      <span style={styles.locationPin}>◎</span>
                      <span style={styles.locationText}>{doc.city || "Paris"}{doc.location ? ` · ${doc.location}` : ""}</span>
                    </div>

                    {/* Rating */}
                    <div style={styles.ratingRow}>
                      <div style={styles.starsWrap}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= Math.round(rating) ? "#fbbf24" : "#1e293b", fontSize: "16px" }}>★</span>
                        ))}
                      </div>
                      <span style={styles.ratingNum}>{rating.toFixed(1)}</span>
                      <span style={styles.ratingCount}>({doc.rating_count || 0} avis)</span>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p style={styles.description}>
                        {doc.description.length > 100
                          ? `${doc.description.substring(0, 100)}…`
                          : doc.description}
                      </p>
                    )}

                    {/* Divider */}
                    <div style={styles.divider} />

                    {/* Actions */}
                    <div style={styles.actions}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedDoctor(doc); setShowRatingModal(true); }}
                        style={styles.reviewBtn}
                      >
                        <span>★</span> Avis
                      </button>
                      <button style={styles.bookBtn}>
                        Rendez-vous →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRatingModal && selectedDoctor && (
        <RatingModal
          doctor={selectedDoctor}
          onClose={() => { setShowRatingModal(false); setSelectedDoctor(null); }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}

/* ─────────────── Styles ─────────────── */

const keyframes = `
  @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes orbFloat { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-30px) scale(1.05); } }
  @keyframes pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.4); opacity:0.3; } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const styles = {
  root: {
    position: "relative",
    minHeight: "100vh",
    background: "#050d1a",
    overflow: "hidden",
  },
  orb1: {
    position: "fixed", top: "-180px", right: "-80px",
    width: "560px", height: "560px",
    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
    animation: "orbFloat 14s ease-in-out infinite",
  },
  orb2: {
    position: "fixed", bottom: "-120px", left: "-80px",
    width: "480px", height: "480px",
    background: "radial-gradient(circle, rgba(34,211,165,0.1) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
    animation: "orbFloat 18s ease-in-out infinite reverse",
  },
  orb3: {
    position: "fixed", top: "40%", left: "35%",
    width: "700px", height: "700px",
    background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  page: { position: "relative", zIndex: 1, padding: "48px 24px 100px" },
  container: { maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" },

  /* Hero */
  hero: { textAlign: "center", paddingBottom: "8px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "6px 18px",
    border: "1px solid rgba(99,102,241,0.35)",
    borderRadius: "100px",
    fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#a5b4fc",
    background: "rgba(99,102,241,0.08)",
    marginBottom: "22px",
  },
  heroBadgeDot: {
    width: "6px", height: "6px",
    background: "#818cf8", borderRadius: "50%",
    boxShadow: "0 0 6px #818cf8",
    display: "inline-block",
    animation: "pulse 2s ease-in-out infinite",
  },
  heroTitle: {
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 1.1, marginBottom: "16px",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.02em",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #818cf8 0%, #22d3a5 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: { fontSize: "15px", color: "#64748b", letterSpacing: "0.02em" },

  /* Search */
  searchWrap: { display: "flex", flexDirection: "column", gap: "14px" },
  searchBar: {
    display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "16px",
    padding: "4px 16px",
    backdropFilter: "blur(12px)",
    gap: "12px",
    transition: "border-color 0.2s",
  },
  searchIcon: { fontSize: "22px", color: "#475569" },
  searchInput: {
    flex: 1, border: "none", outline: "none",
    padding: "14px 0",
    fontSize: "15px",
    background: "transparent",
    color: "#e2e8f0",
  },
  clearBtn: {
    background: "rgba(255,255,255,0.06)", border: "none",
    color: "#64748b", cursor: "pointer",
    width: "28px", height: "28px", borderRadius: "50%",
    fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  filtersRow: {
    display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
  },
  selectWrap: {
    position: "relative", display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    padding: "0 14px",
    gap: "8px",
  },
  selectIcon: { fontSize: "14px", color: "#475569" },
  select: {
    background: "transparent", border: "none", outline: "none",
    color: "#94a3b8", fontSize: "13px",
    padding: "10px 0", cursor: "pointer",
    appearance: "none",
  },
  clearFiltersBtn: {
    padding: "8px 16px",
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "8px",
    color: "#f87171", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  resultsCount: {
    marginLeft: "auto",
    fontSize: "13px", color: "#475569",
  },
  resultsNum: { color: "#818cf8", fontWeight: "700", fontSize: "15px" },

  /* States */
  centerState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "80px 20px", gap: "14px",
    textAlign: "center",
  },
  pulseRing: {
    width: "52px", height: "52px",
    border: "2px solid rgba(99,102,241,0.4)",
    borderRadius: "50%",
    animation: "pulse 1.6s ease-in-out infinite",
  },
  stateText: { color: "#64748b", fontSize: "14px", letterSpacing: "0.08em" },
  emptyEmoji: { fontSize: "52px", lineHeight: 1 },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
  emptySubtitle: { fontSize: "14px", color: "#475569" },
  resetBtn: {
    padding: "11px 26px",
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: "10px",
    color: "#a5b4fc", cursor: "pointer",
    fontSize: "14px", fontWeight: "600",
  },
  errorPanel: {
    background: "rgba(248,113,113,0.07)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: "16px", padding: "24px",
    display: "flex", alignItems: "center", gap: "16px",
  },
  errorIcon: { fontSize: "28px" },
  errorMsg: { color: "#f87171", fontSize: "15px" },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  /* Card */
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "24px",
    padding: "28px 24px 22px",
    backdropFilter: "blur(12px)",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "0",
    opacity: 0,
    transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
    overflow: "hidden",
    cursor: "default",
  },
  cardHovered: {
    borderColor: "rgba(99,102,241,0.3)",
    transform: "translateY(-6px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.15)",
  },
  cardTopGlow: {
    position: "absolute", top: 0, left: "50%",
    transform: "translateX(-50%)",
    width: "60%", height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.6), transparent)",
  },

  /* Avatar */
  avatarWrap: { position: "relative", marginBottom: "18px" },
  avatarRing: {
    width: "90px", height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(34,211,165,0.3))",
    padding: "2px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: "86px", height: "86px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarInitials: {
    fontSize: "28px", fontWeight: "800",
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
  },
  onlineDot: {
    position: "absolute", bottom: "3px", right: "3px",
    width: "14px", height: "14px",
    background: "#22d3a5",
    borderRadius: "50%",
    border: "2px solid #050d1a",
    boxShadow: "0 0 8px #22d3a5",
  },

  /* Doctor info */
  docName: {
    fontSize: "18px", fontWeight: "800",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: "8px",
    letterSpacing: "-0.01em",
  },
  specialtyBadge: {
    padding: "4px 14px",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "100px",
    fontSize: "10px", fontWeight: "700",
    color: "#a5b4fc",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },
  locationRow: {
    display: "flex", alignItems: "center", gap: "6px",
    marginBottom: "14px",
  },
  locationPin: { fontSize: "13px", color: "#475569" },
  locationText: { fontSize: "12px", color: "#64748b" },

  /* Rating */
  ratingRow: {
    display: "flex", alignItems: "center", gap: "8px",
    marginBottom: "14px",
  },
  starsWrap: { display: "flex", gap: "1px" },
  ratingNum: { fontSize: "14px", fontWeight: "800", color: "#fbbf24" },
  ratingCount: { fontSize: "11px", color: "#475569" },

  description: {
    fontSize: "12px", color: "#64748b",
    textAlign: "center", lineHeight: "1.6",
    marginBottom: "14px",
  },

  divider: {
    width: "100%", height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "4px 0 16px",
  },

  /* Actions */
  actions: {
    display: "flex", gap: "10px", width: "100%",
  },
  reviewBtn: {
    flex: "0 0 auto",
    padding: "10px 16px",
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: "10px",
    color: "#fbbf24",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    display: "flex", alignItems: "center", gap: "6px",
    transition: "background 0.2s",
  },
  bookBtn: {
    flex: 1,
    padding: "10px 16px",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "700",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
    transition: "opacity 0.2s, transform 0.15s",
  },
};
