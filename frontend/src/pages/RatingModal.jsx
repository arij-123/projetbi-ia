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
    // Vérifier si l'utilisateur a déjà noté ce médecin
    const fetchUserRating = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token pour user-rating:", token ? "Présent" : "MANQUANT");

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
    console.log("🔑 Token envoyé:", token ? "Présent" : "MANQUANT");
    console.log("📦 Données envoyées:", {
      doctor_id: doctor.id,
      score: score,
      comment: comment
    });
    
    const response = await axios.post(
      "http://localhost:8000/api/ratings",
      {
        doctor_id: doctor.id,
        score: score,
        comment: comment
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("✅ Réponse reçue:", response.data);
    onRatingSubmitted();
    onClose();
  } catch (err) {
    console.error("❌ Erreur complète:", err);
    console.error("Réponse d'erreur:", err.response?.data);
    console.error("Status:", err.response?.status);
    setError(err.response?.data?.detail || "Erreur lors de l'envoi de l'avis");
  } finally {
    setLoading(false);
  }
};

  const renderStars = () => {
    const stars = [];
    const currentHover = hoverScore || score;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setScore(i)}
          onMouseEnter={() => setHoverScore(i)}
          onMouseLeave={() => setHoverScore(0)}
          style={{
            fontSize: "35px",
            cursor: "pointer",
            color: i <= currentHover ? "#fbbf24" : "#d1d5db",
            transition: "color 0.2s",
            marginRight: "5px"
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>{userRating ? "Modifier mon avis" : "Donner mon avis"}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.doctorInfo}>
          <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>
          <span style={styles.specialty}>{doctor.specialty}</span>
        </div>

        <div style={styles.starsContainer}>
          <label>Votre note :</label>
          <div>{renderStars()}</div>
          <span style={styles.scoreLabel}>
            {score > 0 ? `${score} étoile${score > 1 ? 's' : ''}` : "Non noté"}
          </span>
        </div>

        <div style={styles.commentContainer}>
          <label>Votre commentaire (optionnel) :</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce médecin..."
            rows={4}
            style={styles.textarea}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttons}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
            {loading ? "Envoi..." : (userRating ? "Modifier mon avis" : "Envoyer mon avis")}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
  doctorInfo: {
    textAlign: "center",
    marginBottom: "20px",
    padding: "10px",
    background: "#f3f4f6",
    borderRadius: "10px",
  },
  specialty: {
    display: "block",
    fontSize: "12px",
    color: "#667eea",
    marginTop: "5px",
  },
  starsContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  scoreLabel: {
    display: "block",
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
  commentContainer: {
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    marginTop: "5px",
    fontFamily: "inherit",
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "15px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};