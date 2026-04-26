// src/components/RatingModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function RatingModal({ doctor, onClose, onRatingSubmitted }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverScore, setHoverScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/user-rating/${doctor.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.has_rated) {
          setUserRating(response.data);
          setScore(response.data.score);
          setComment(response.data.comment || "");
        }
      } catch (err) {
        console.error("Erreur:", err);
      }
    };
    fetchUserRating();
  }, [doctor.id]);

  const handleSubmit = async () => {
    if (score === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/api/ratings",
        { doctor_id: doctor.id, score, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRatingSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'envoi de l'avis");
    } finally {
      setLoading(false);
    }
  };

  const scoreLabels = ["", "1 étoile", "2 étoiles", "3 étoiles", "4 étoiles", "5 étoiles"];
  const currentDisplay = hoverScore || score;

  return (
    <>
      <style>{kf}</style>
      <div style={S.overlay}>
        <div style={S.modal}>
          <div style={S.topGlow} />

          {/* Header */}
          <div style={S.header}>
            <h3 style={S.title}>
              {userRating ? "Modifier mon avis" : "Donner mon avis"}
            </h3>
            <button onClick={onClose} style={S.closeBtn}>✕</button>
          </div>

          {/* Doctor info */}
          <div style={S.doctorCard}>
            <div style={S.doctorName}>
              Dr. {doctor.first_name} {doctor.last_name}
            </div>
            <span style={S.specialtyBadge}>
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              {doctor.specialty}
            </span>
          </div>

          {/* Stars */}
          <div style={S.section}>
            <label style={S.label}>Votre note</label>
            <div style={S.starsWrap}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onClick={() => { setScore(i); setError(""); }}
                  onMouseEnter={() => setHoverScore(i)}
                  onMouseLeave={() => setHoverScore(0)}
                  style={{
                    ...S.star,
                    color: i <= currentDisplay ? "#fbbf24" : "rgba(255,255,255,0.1)",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={S.scoreLabel}>
              {scoreLabels[currentDisplay] || "Non noté"}
            </span>
          </div>

          <div style={S.divider} />

          {/* Comment */}
          <div style={S.section}>
            <label style={S.label}>Votre commentaire (optionnel)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce médecin…"
              rows={4}
              style={S.textarea}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>
              <span style={{ fontSize: "15px" }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={S.btns}>
            <button onClick={onClose} style={S.cancelBtn}>
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...S.submitBtn, ...(loading ? S.submitBtnLoading : {}) }}
            >
              {loading
                ? <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={S.spinner} /> Envoi…
                  </span>
                : (userRating ? "Modifier mon avis →" : "Envoyer mon avis →")
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const kf = `
  @keyframes fadeInModal { from{opacity:0;transform:scale(0.96) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);} }
  @keyframes spin { to{transform:rotate(360deg);} }
`;

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px",
  },
  modal: {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "28px",
    padding: "32px",
    width: "100%",
    maxWidth: "460px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    animation: "fadeInModal 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
    overflow: "hidden",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  topGlow: {
    position: "absolute", top: 0, left: "50%",
    transform: "translateX(-50%)",
    width: "65%", height: "1px",
    background: "linear-gradient(90deg,transparent,rgba(96,165,250,0.7),transparent)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#f1f5f9",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.01em",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "50%",
    width: "32px", height: "32px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    color: "#475569",
    fontSize: "14px",
    transition: "all .2s",
  },
  doctorCard: {
    textAlign: "center",
    padding: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    marginBottom: "22px",
  },
  doctorName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: "8px",
  },
  specialtyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 12px",
    border: "1px solid rgba(96,165,250,0.25)",
    borderRadius: "100px",
    fontSize: "11px",
    letterSpacing: "0.06em",
    color: "#60a5fa",
    background: "rgba(59,130,246,0.08)",
  },
  section: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "10px",
  },
  starsWrap: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  star: {
    fontSize: "34px",
    cursor: "pointer",
    transition: "transform .15s, color .15s",
    lineHeight: 1,
    userSelect: "none",
  },
  scoreLabel: {
    display: "block",
    textAlign: "center",
    fontSize: "12px",
    color: "#475569",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "0 0 20px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.03)",
    outline: "none",
    resize: "vertical",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: "all .2s",
    minHeight: "90px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 13px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: "10px",
    color: "#f87171",
    fontSize: "13px",
    marginBottom: "16px",
  },
  btns: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: "all .2s",
  },
  submitBtn: {
    padding: "10px 22px",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
    transition: "opacity .2s",
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
  },
  submitBtnLoading: {
    background: "rgba(255,255,255,0.06)",
    boxShadow: "none",
    cursor: "not-allowed",
    color: "#475569",
  },
  spinner: {
    width: "14px", height: "14px",
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin .8s linear infinite",
  },
};
