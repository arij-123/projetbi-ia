import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();

      // 🔥 Sauvegarder le token ET les informations utilisateur
      localStorage.setItem("token", data.access_token);
      
      // Sauvegarder les infos utilisateur si présentes
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Utilisateur sauvegardé:", data.user);
      } else {
        // Si le backend ne retourne pas user, faire un appel supplémentaire
        console.warn("Backend didn't return user data");
      }

      // Redirection après login
      navigate("/predict");

    } catch (err) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Arrière-plan hexagonal */}
      <div style={styles.bgOverlay}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
          <defs>
            <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon
                points="30,2 58,17 58,47 30,62 2,47 2,17"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
      </div>

      {/* Carte de login */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="3" fill="white" opacity="0.4" />
            </svg>
          </div>
          <h1 style={styles.title}>Skin Disease Detection</h1>
          <p style={styles.subtitle}>AI-Powered Dermatology Diagnosis</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa5b4" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1a6bb5";
                  e.target.style.background = "white";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.background = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa5b4" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: "42px" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1a6bb5";
                  e.target.style.background = "white";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.background = "#f8fafc";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa5b4" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa5b4" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div style={styles.row}>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={styles.checkbox}
              />
              Remember me
            </label>
            <a href="/forgot-password" style={styles.link}>
              Forgot password?
            </a>
          </div>

          {/* Affichage erreur */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Bouton Log in */}
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Connexion en cours..." : "Log in"}
          </button>
        </form>

        {/* Lien Sign up */}
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <a href="/register" style={styles.signupLink}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a6bb5 0%, #0d4a8a 40%, #0a3570 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  },
  bgOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
    position: "relative",
    zIndex: 1,
  },
  logoWrapper: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logoCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1a6bb5, #0d4a8a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#0d2d5e",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7a99",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    color: "#4a5568",
    fontWeight: 500,
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px 11px 42px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#2d3748",
    background: "#f8fafc",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#4a5568",
    cursor: "pointer",
  },
  checkbox: {
    width: "15px",
    height: "15px",
    accentColor: "#1a6bb5",
    cursor: "pointer",
  },
  link: {
    fontSize: "13px",
    color: "#1a6bb5",
    textDecoration: "none",
    fontWeight: 500,
  },
  errorMessage: {
    padding: "10px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    color: "#c33",
    fontSize: "13px",
    textAlign: "center",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #1a6bb5, #0d4a8a)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.3px",
    marginTop: "0.5rem",
    transition: "opacity 0.3s",
  },
  signupText: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "13px",
    color: "#6b7a99",
  },
  signupLink: {
    color: "#1a6bb5",
    fontWeight: 600,
    textDecoration: "none",
  },
};