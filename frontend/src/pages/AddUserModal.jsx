// frontend/src/components/AddUserModal.jsx
import { useState } from "react";
import axios from "axios";

export default function AddUserModal({ onClose, onUserAdded }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
    age: "",
    phone: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }

    if (formData.password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "http://localhost:8000/admin/users",
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          age: formData.age ? parseInt(formData.age) : null,
          phone: formData.phone,
          city: formData.city
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Utilisateur créé:", response.data);
      onUserAdded();
      onClose();
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.response?.data?.detail || "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>➕ Ajouter un utilisateur</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label>Prénom *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Prénom"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>Nom *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Nom"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemple.com"
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label>Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="user">👤 Utilisateur</option>
                <option value="admin">👑 Administrateur</option>
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label>Âge</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Âge"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>Téléphone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Téléphone"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label>Ville</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ville"
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttons}>
            <button onClick={onClose} style={styles.cancelBtn}>
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
              {loading ? "Création..." : "Créer l'utilisateur"}
            </button>
          </div>
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
    maxWidth: "550px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "15px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  row: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
  },
  select: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    background: "white",
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center",
    padding: "10px",
    background: "#fee",
    borderRadius: "8px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "10px",
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