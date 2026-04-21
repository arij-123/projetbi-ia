// frontend/src/pages/Admin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user"
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Vérifier si l'utilisateur est admin
        if (user.role !== "admin") {
          navigate("/predict");
          return;
        }
        
        // 🔥 CORRECTION : Récupérer les utilisateurs (au lieu de delete)
        const usersRes = await axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Récupérer les statistiques
        const statsRes = await axios.get("http://localhost:8000/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(usersRes.data.users);
        setStats(statsRes.data);
        
      } catch (err) {
        console.error("Erreur:", err);
        if (err.response?.status === 403) {
          navigate("/predict");
        } else {
          setError("Impossible de charger les données");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [navigate]);
  
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Supprimer ${userName} ?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.filter(u => u.id !== userId));
      alert("Utilisateur supprimé");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  };
  
  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      alert("Tous les champs sont requis");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddModal(false);
      setNewUser({ first_name: "", last_name: "", email: "", password: "", role: "user" });
      
      // Recharger la liste
      const usersRes = await axios.get("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.users);
      
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  };
  
  if (loading) return (
    <div>
      <Header />
      <div style={styles.loading}>Chargement...</div>
    </div>
  );
  
  if (error) return (
    <div>
      <Header />
      <div style={styles.error}>{error}</div>
    </div>
  );
  
  return (
    <div>
      <Header />
      
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>👑 Administration</h1>
          
          {/* Statistiques */}
          {stats && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.total_users || 0}</div>
                <div style={styles.statLabel}>Utilisateurs</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.total_doctors || 0}</div>
                <div style={styles.statLabel}>Médecins</div>
              </div>
            </div>
          )}
          
          {/* Liste des utilisateurs */}
          <div style={styles.userSection}>
            <div style={styles.userHeader}>
              <h2>📋 Utilisateurs</h2>
              <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
                + Ajouter
              </button>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Ville</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id?.slice(0, 8)}...</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: user.role === "admin" ? "#fef3c7" : "#dbeafe",
                        color: user.role === "admin" ? "#92400e" : "#1e40af"
                      }}>
                        {user.role === "admin" ? "👑 Admin" : "👤 User"}
                      </span>
                    </td>
                    <td>{user.city || "-"}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                        style={styles.deleteButton}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal Ajout */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Ajouter un utilisateur</h3>
            <input
              type="text"
              placeholder="Prénom"
              value={newUser.first_name}
              onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Nom"
              value={newUser.last_name}
              onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              style={styles.input}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              style={styles.select}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Annuler</button>
              <button onClick={handleAddUser} style={styles.submitBtn}>Ajouter</button>
            </div>
          </div>
        </div>
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
  title: {
    fontSize: "32px",
    color: "white",
    marginBottom: "30px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#667eea",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
  },
  userSection: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
  },
  userHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  addButton: {
    padding: "10px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  roleBadge: {
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  modal: {
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
  modalContent: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    width: "400px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  modalButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
  },
  error: {
    textAlign: "center",
    padding: "50px",
    color: "red",
  },
};