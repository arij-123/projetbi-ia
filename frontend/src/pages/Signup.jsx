import { useState } from "react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    city: "",
    location: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          age: form.age ? Number(form.age) : null,
          phone: form.phone,
          city: form.city,
          location: form.location
        })
      });

      if (!res.ok) throw new Error("Signup failed");

      const data = await res.json();

      alert("Account created successfully!");
      window.location.href = "/login";

    } catch (err) {
      alert("Signup error");
      console.log(err);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background hexagonal */}
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

      {/* Card */}
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join SkinAI platform</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.row}>
            <input
              name="first_name"
              placeholder="First name"
              value={form.first_name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              name="last_name"
              placeholder="Last name"
              value={form.last_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div style={styles.passwordBox}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.btn}>
            Sign up
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account? <a href="/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a6bb5, #0d4a8a)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Segoe UI"
  },

  bgOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none"
  },

  card: {
    background: "white",
    padding: "2.5rem",
    borderRadius: "20px",
    width: "420px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    zIndex: 1
  },

  title: {
    textAlign: "center",
    marginBottom: "5px",
    color: "#0d2d5e"
  },

  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#6b7a99",
    fontSize: "13px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  row: {
    display: "flex",
    gap: "10px"
  },

  input: {
    padding: "11px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    width: "100%"
  },

  passwordBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  eyeBtn: {
    padding: "10px",
    border: "none",
    background: "#e5e7eb",
    borderRadius: "8px",
    cursor: "pointer"
  },

  btn: {
    padding: "12px",
    background: "linear-gradient(135deg, #1a6bb5, #0d4a8a)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  bottomText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "13px",
    color: "#6b7a99"
  },

  link: {
    color: "#1a6bb5",
    textDecoration: "none",
    fontWeight: "bold"
  }
};