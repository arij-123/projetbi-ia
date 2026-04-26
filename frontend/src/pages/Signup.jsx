import { useState } from "react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    city: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          age: form.age ? Number(form.age) : null,
          phone: form.phone,
          city: form.city,
          location: form.location,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Inscription échouée");
      }
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...S.input,
    borderColor:
      focusedField === field
        ? "rgba(96,165,250,0.5)"
        : "rgba(255,255,255,0.08)",
    background:
      focusedField === field
        ? "rgba(96,165,250,0.05)"
        : "rgba(255,255,255,0.03)",
    boxShadow:
      focusedField === field ? "0 0 0 3px rgba(96,165,250,0.08)" : "none",
  });

  return (
    <div style={S.root}>
      <style>{kf}</style>

      {/* Ambient orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />

      {/* Grid pattern */}
      <svg
        style={S.gridSvg}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
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
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#60a5fa"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <div style={S.liveBadge}>
            <span style={S.liveDot} />
            Nouveau compte
          </div>
          <h1 style={S.title}>
            Rejoignez
            <br />
            <span style={S.titleAccent}>SkinAI</span>
          </h1>
          <p style={S.subtitle}>
            Intelligence artificielle · Diagnostic dermatologique
          </p>
        </div>

        {/* Divider */}
        <div style={S.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={S.form}>
          {/* Row: first + last name */}
          <div style={S.row}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Prénom</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input
                  name="first_name"
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  style={inputStyle("first_name")}
                  onFocus={() => setFocusedField("first_name")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Nom</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input
                  name="last_name"
                  placeholder="Nom"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  style={inputStyle("last_name")}
                  onFocus={() => setFocusedField("last_name")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Adresse email</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#475569"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
              </span>
              <input
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* Password */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Mot de passe</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#475569"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                style={{ ...inputStyle("password"), paddingRight: "44px" }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={S.eyeBtn}
              >
                {showPassword ? (
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Row: age + phone */}
          <div style={S.row}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Âge</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
                <input
                  name="age"
                  type="number"
                  placeholder="Âge"
                  value={form.age}
                  onChange={handleChange}
                  style={inputStyle("age")}
                  onFocus={() => setFocusedField("age")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Téléphone</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  style={inputStyle("phone")}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Row: city + location */}
          <div style={S.row}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Ville</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <input
                  name="city"
                  placeholder="Ville"
                  value={form.city}
                  onChange={handleChange}
                  style={inputStyle("city")}
                  onFocus={() => setFocusedField("city")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Localisation</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#475569"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <input
                  name="location"
                  placeholder="Localisation"
                  value={form.location}
                  onChange={handleChange}
                  style={inputStyle("location")}
                  onFocus={() => setFocusedField("location")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

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
            style={{
              ...S.submitBtn,
              ...(loading ? S.submitBtnLoading : {}),
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span style={S.spinner} /> Création en cours…
              </span>
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Créer mon compte <span style={{ fontSize: "16px" }}>→</span>
              </span>
            )}
          </button>
        </form>

        <p style={S.signupText}>
          Déjà un compte ?{" "}
          <a href="/login" style={S.signupLink}>
            Se connecter
          </a>
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

  orb1: { position: "fixed", top: "-160px", right: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orbFloat 13s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-120px", left: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle,rgba(34,211,165,0.12) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orbFloat 17s ease-in-out infinite reverse" },
  orb3: { position: "fixed", top: "40%", left: "30%", width: "600px", height: "600px", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" },

  gridSvg: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 },

  card: {
    position: "relative", zIndex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "28px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "460px",
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

  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "10px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "7px", flex: 1, minWidth: 0 },
  label: { fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" },

  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: "14px", top: "50%",
    transform: "translateY(-50%)",
    display: "flex", alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px 12px 40px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "13px", color: "#e2e8f0",
    background: "rgba(255,255,255,0.03)",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  eyeBtn: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    padding: "4px", display: "flex", alignItems: "center",
  },

  errorBox: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 14px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: "10px",
    color: "#f87171", fontSize: "13px",
  },

  submitBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none", borderRadius: "12px",
    color: "white", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: "4px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
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

  signupText: { textAlign: "center", marginTop: "22px", fontSize: "13px", color: "#475569" },
  signupLink: { color: "#60a5fa", fontWeight: "700", textDecoration: "none" },
};
