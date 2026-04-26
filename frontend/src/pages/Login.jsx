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
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/predict");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...S.input,
    borderColor: focusedField === field
      ? "rgba(96,165,250,0.5)"
      : "rgba(255,255,255,0.08)",
    background: focusedField === field
      ? "rgba(96,165,250,0.05)"
      : "rgba(255,255,255,0.03)",
    boxShadow: focusedField === field
      ? "0 0 0 3px rgba(96,165,250,0.08)"
      : "none",
  });

  return (
    <div style={S.root}>
      <style>{kf}</style>

      {/* Ambient orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />

      {/* Grid pattern */}
      <svg style={S.gridSvg} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Card */}
      <div style={S.card}>
        <div style={S.cardTopGlow} />

        {/* Logo */}
        <div style={S.logoWrap}>
          <div style={S.logoRing}>
            <div style={S.logoIcon}>
              <svg width="22" height="22" fill="none" stroke="#60a5fa" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div style={S.liveBadge}>
            <span style={S.liveDot} />
            Système actif
          </div>
          <h1 style={S.title}>Bienvenue sur<br /><span style={S.titleAccent}>SkinAI</span></h1>
          <p style={S.subtitle}>Intelligence artificielle · Diagnostic dermatologique</p>
        </div>

        {/* Divider */}
        <div style={S.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={S.form}>

          {/* Email */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Adresse email</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg width="15" height="15" fill="none" stroke="#475569" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Password */}
          <div style={S.fieldGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={S.label}>Mot de passe</label>
              <a href="/forgot-password" style={S.forgotLink}>Mot de passe oublié ?</a>
            </div>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg width="15" height="15" fill="none" stroke="#475569" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle("password"), paddingRight: "44px" }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={S.eyeBtn}>
                {showPassword ? (
                  <svg width="15" height="15" fill="none" stroke="#475569" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="#475569" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label style={S.checkRow}>
            <div style={{ position: "relative" }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ display: "none" }} />
              <div style={{ ...S.checkbox, ...(remember ? S.checkboxChecked : {}) }}
                onClick={() => setRemember(v => !v)}>
                {remember && <span style={S.checkMark}>✓</span>}
              </div>
            </div>
            <span style={S.checkLabel}>Se souvenir de moi</span>
          </label>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>
              <span style={{ fontSize: "16px" }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...S.submitBtn, ...(loading ? S.submitBtnLoading : {}) }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={S.spinner} /> Connexion en cours…
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                Se connecter <span style={{ fontSize: "16px" }}>→</span>
              </span>
            )}
          </button>
        </form>

        {/* Sign up */}
        <p style={S.signupText}>
          Pas encore de compte ?{" "}
          <a href="/register" style={S.signupLink}>Créer un compte</a>
        </p>
      </div>
    </div>
  );
}

const kf = `
  @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.05);} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(1.5);} }
  @keyframes spin { to{transform:rotate(360deg);} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes shimmer { 0%{background-position:-200% center;}100%{background-position:200% center;} }
`;

const S = {
  root: {
    minHeight: "100vh",
    background: "#050d1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  /* Orbs */
  orb1: { position: "fixed", top: "-160px", right: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orbFloat 13s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-120px", left: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle,rgba(34,211,165,0.12) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orbFloat 17s ease-in-out infinite reverse" },
  orb3: { position: "fixed", top: "40%", left: "30%", width: "600px", height: "600px", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" },

  gridSvg: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },

  /* Card */
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "28px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
    overflow: "hidden",
  },
  cardTopGlow: {
    position: "absolute", top: 0, left: "50%",
    transform: "translateX(-50%)",
    width: "65%", height: "1px",
    background: "linear-gradient(90deg,transparent,rgba(96,165,250,0.7),transparent)",
  },

  /* Logo section */
  logoWrap: { textAlign: "center", marginBottom: "28px" },
  logoRing: {
    width: "68px", height: "68px",
    borderRadius: "22px",
    background: "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.15))",
    border: "1px solid rgba(96,165,250,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 0 28px rgba(59,130,246,0.15)",
  },
  logoIcon: {
    width: "44px", height: "44px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  liveBadge: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    padding: "4px 14px",
    border: "1px solid rgba(34,211,165,0.25)",
    borderRadius: "100px",
    fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#22d3a5",
    background: "rgba(34,211,165,0.06)",
    marginBottom: "14px",
  },
  liveDot: {
    width: "6px", height: "6px",
    background: "#22d3a5", borderRadius: "50%",
    boxShadow: "0 0 6px #22d3a5",
    display: "inline-block",
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    fontSize: "26px", fontWeight: "800",
    color: "#f1f5f9", lineHeight: 1.2,
    marginBottom: "8px",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.02em",
  },
  titleAccent: {
    background: "linear-gradient(135deg,#60a5fa 0%,#22d3a5 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: "12px", color: "#475569", letterSpacing: "0.04em" },

  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "0 0 24px",
  },

  /* Form */
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" },
  forgotLink: { fontSize: "11px", color: "#6366f1", fontWeight: "600", textDecoration: "none" },

  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: "14px", top: "50%",
    transform: "translateY(-50%)",
    display: "flex", alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px 12px 42px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "14px", color: "#e2e8f0",
    background: "rgba(255,255,255,0.03)",
    outline: "none",
    transition: "all 0.2s",
  },
  eyeBtn: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    padding: "4px", display: "flex", alignItems: "center",
    color: "#475569",
  },

  /* Checkbox */
  checkRow: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" },
  checkbox: {
    width: "18px", height: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.03)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    transition: "all 0.2s",
  },
  checkboxChecked: {
    background: "rgba(96,165,250,0.2)",
    border: "1px solid rgba(96,165,250,0.5)",
  },
  checkMark: { fontSize: "11px", color: "#60a5fa", fontWeight: "700", lineHeight: 1 },
  checkLabel: { fontSize: "13px", color: "#64748b" },

  /* Error */
  errorBox: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 14px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: "10px",
    color: "#f87171", fontSize: "13px",
  },

  /* Submit */
  submitBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none", borderRadius: "12px",
    color: "white", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: "4px",
  },
  submitBtnLoading: {
    background: "rgba(255,255,255,0.06)",
    boxShadow: "none", cursor: "not-allowed",
    color: "#475569",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },

  /* Signup */
  signupText: { textAlign: "center", marginTop: "22px", fontSize: "13px", color: "#475569" },
  signupLink: { color: "#60a5fa", fontWeight: "700", textDecoration: "none" },
};
