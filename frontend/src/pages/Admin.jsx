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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "", last_name: "", age: "", phone: "",
    city: "", location: "", email: "", password: "", role: "user"
  });

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data.users);
  };

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") { navigate("/predict"); return; }

        const [usersRes, statsRes] = await Promise.all([
          axios.get("http://localhost:8000/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8000/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data.users);
        setStats(statsRes.data);
      } catch (err) {
        if (err.response?.status === 403) navigate("/predict");
        else setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      alert("Champs requis manquants"); return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewUser({ first_name: "", last_name: "", age: "", phone: "", city: "", location: "", email: "", password: "", role: "user" });
      await fetchUsers();
    } catch (err) { alert(err.response?.data?.detail || "Erreur"); }
  };

  const handleEditUser = async () => {
    if (!editUser.first_name || !editUser.last_name || !editUser.email) {
      alert("Champs requis manquants"); return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/admin/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false); setEditUser(null);
      await fetchUsers();
    } catch (err) { alert(err.response?.data?.detail || "Erreur"); }
  };

  const getRoleStyle = (role) => {
    if (role === "admin") return { color: "#c084fc", borderColor: "rgba(192,132,252,0.3)", background: "rgba(192,132,252,0.08)" };
    if (role === "doctor") return { color: "#22d3a5", borderColor: "rgba(34,211,165,0.3)", background: "rgba(34,211,165,0.08)" };
    return { color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)" };
  };
  const getRoleLabel = (role) => ({ admin: "Admin", doctor: "Médecin" }[role] || "Patient");

  const avatarGradients = [
    "linear-gradient(135deg,#3730a3,#1e40af)",
    "linear-gradient(135deg,#065f46,#047857)",
    "linear-gradient(135deg,#7c2d12,#b45309)",
    "linear-gradient(135deg,#4c0519,#9f1239)",
    "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
  ];

  if (loading) return (
    <div style={S.root}>
      <style>{kf}</style>
      <Header />
      <div style={S.centerState}>
        <div style={S.pulseRing} />
        <p style={{ color: "#64748b", fontSize: "14px" }}>Chargement…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.root}>
      <style>{kf}</style>
      <Header />
      <div style={S.centerState}>
        <p style={{ color: "#f87171", fontSize: "16px" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{kf}</style>
      <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
      <Header />

      <div style={S.page}>
        <div style={S.container}>

          {/* Hero */}
          <div style={{ ...S.hero, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={S.heroBadge}><span style={S.badgeDot} />Panneau d'administration</div>
            <h1 style={S.heroTitle}>Gestion des<br /><span style={S.heroAccent}>Utilisateurs</span></h1>
          </div>

          {/* Stats */}
          {stats && (
            <div style={S.statsGrid}>
              {[
                { value: stats.total_users || 0, label: "Utilisateurs totaux", icon: "◈", delay: "0ms" },
                { value: stats.total_doctors || 0, label: "Médecins", icon: "⚕", delay: "80ms" },
                { value: users.filter(u => u.role === "admin").length, label: "Administrateurs", icon: "◆", delay: "160ms" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.statCard, animationDelay: s.delay, animation: "slideUp 0.6s ease forwards", opacity: 0 }}>
                  <div style={S.statIconWrap}><span style={S.statIcon}>{s.icon}</span></div>
                  <div style={S.statValue}>{s.value}</div>
                  <div style={S.statLabel}>{s.label}</div>
                  <div style={S.statGlow} />
                </div>
              ))}
            </div>
          )}

          {/* Table panel */}
          <div style={S.panel}>
            <div style={S.panelTopGlow} />
            <div style={S.panelHeader}>
              <div style={S.panelTitleWrap}>
                <span style={S.panelIcon}>≡</span>
                <h2 style={S.panelTitle}>Liste des utilisateurs</h2>
                <span style={S.countBadge}>{users.length}</span>
              </div>
              <button onClick={() => setShowAddModal(true)} style={S.addBtn}>
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> Ajouter
              </button>
            </div>

            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Utilisateur", "Âge", "Email", "Téléphone", "Ville", "Rôle", "Actions"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={S.emptyCell}>
                        <div style={S.emptyState}>
                          <span style={{ fontSize: "40px" }}>👥</span>
                          <p style={{ fontSize: "15px", color: "#475569" }}>Aucun utilisateur trouvé</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.map((user, i) => {
                    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
                    const rStyle = getRoleStyle(user.role);
                    return (
                      <tr key={user.id} style={S.tr}>
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={{ ...S.avatar, background: avatarGradients[i % avatarGradients.length] }}>{initials}</div>
                            <div>
                              <div style={S.userName}>{user.first_name} {user.last_name}</div>
                              <div style={S.onlineRow}><span style={S.onlineDot} /> En ligne</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.tdMuted}>{user.age || "—"}</td>
                        <td style={S.tdMuted}>{user.email}</td>
                        <td style={S.tdMuted}>{user.phone || "—"}</td>
                        <td style={S.tdMuted}>{user.city || "—"}</td>
                        <td style={S.td}>
                          <span style={{ ...S.rolePill, ...rStyle }}>{getRoleLabel(user.role)}</span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => { setEditUser(user); setShowEditModal(true); }} style={S.editBtn} title="Modifier">✎</button>
                            <button onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)} style={S.deleteBtn} title="Supprimer">✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ModalShell title="Nouvel utilisateur" subtitle="Remplissez les informations" icon="◈"
          onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} submitLabel="Créer l'utilisateur">
          <UserForm data={newUser} onChange={setNewUser} />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editUser && (
        <ModalShell title="Modifier l'utilisateur" subtitle={`${editUser.first_name} ${editUser.last_name}`} icon="✎"
          onClose={() => { setShowEditModal(false); setEditUser(null); }} onSubmit={handleEditUser} submitLabel="Enregistrer">
          <UserForm data={editUser} onChange={setEditUser} isEdit />
        </ModalShell>
      )}
    </div>
  );
}

function ModalShell({ title, subtitle, icon, onClose, onSubmit, submitLabel, children }) {
  return (
    <div style={S.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={S.modalTopGlow} />
        <div style={S.modalHeader}>
          <div style={S.modalIconWrap}><span style={{ fontSize: "16px", color: "#818cf8" }}>{icon}</span></div>
          <div>
            <p style={S.modalTitle}>{title}</p>
            <p style={S.modalSubtitle}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>
        <div style={S.modalBody}>{children}</div>
        <div style={S.modalFooter}>
          <button onClick={onClose} style={S.cancelBtn}>Annuler</button>
          <button onClick={onSubmit} style={S.submitBtn}>{submitLabel} →</button>
        </div>
      </div>
    </div>
  );
}

function UserForm({ data, onChange, isEdit }) {
  const f = field => e => onChange({ ...data, [field]: e.target.value });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={S.inputRow}>
        <Field label="Prénom *"><input type="text" placeholder="Jean" value={data.first_name} onChange={f("first_name")} style={S.input} /></Field>
        <Field label="Nom *"><input type="text" placeholder="Dupont" value={data.last_name} onChange={f("last_name")} style={S.input} /></Field>
      </div>
      <div style={S.inputRow}>
        <Field label="Âge"><input type="number" placeholder="30" value={data.age || ""} onChange={f("age")} style={S.input} /></Field>
        <Field label="Téléphone"><input type="tel" placeholder="99 541 236" value={data.phone || ""} onChange={f("phone")} style={S.input} /></Field>
      </div>
      <div style={S.inputRow}>
        <Field label="Ville"><input type="text" placeholder="Tunis" value={data.city || ""} onChange={f("city")} style={S.input} /></Field>
        <Field label="Localisation"><input type="text" placeholder="Centre-ville" value={data.location || ""} onChange={f("location")} style={S.input} /></Field>
      </div>
      <Field label="Adresse email *"><input type="email" placeholder="jean@exemple.com" value={data.email} onChange={f("email")} style={S.input} /></Field>
      <Field label={isEdit ? <span>Mot de passe <span style={{ color: "#475569", fontWeight: 400, fontSize: "10px" }}>(vide = inchangé)</span></span> : "Mot de passe *"}>
        <input type="password" placeholder="••••••••" value={data.password || ""} onChange={f("password")} style={S.input} />
      </Field>
      <Field label="Rôle">
        <div style={S.roleToggle}>
          {[
            { value: "user", label: "◈ Utilisateur", active: S.roleBtnUser },
            { value: "doctor", label: "⚕ Médecin", active: S.roleBtnDoctor },
            { value: "admin", label: "◆ Admin", active: S.roleBtnAdmin },
          ].map(r => (
            <button key={r.value} onClick={() => onChange({ ...data, role: r.value })}
              style={{ ...S.roleBtn, ...(data.role === r.value ? r.active : {}) }}>
              {r.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

const kf = `
  @keyframes slideUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes orbFloat { 0%,100%{transform:translateY(0);}50%{transform:translateY(-28px);} }
  @keyframes pulse { 0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.4);opacity:0.3;} }
  @keyframes modalIn { from{opacity:0;transform:translateY(-12px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);} }
`;

const S = {
  root: { position: "relative", minHeight: "100vh", background: "#050d1a", overflow: "hidden" },
  orb1: { position: "fixed", top: "-180px", right: "-80px", width: "520px", height: "520px", background: "radial-gradient(circle,rgba(192,132,252,0.15) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 14s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-120px", left: "-80px", width: "460px", height: "460px", background: "radial-gradient(circle,rgba(34,211,165,0.1) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 18s ease-in-out infinite reverse" },
  orb3: { position: "fixed", top: "40%", left: "35%", width: "700px", height: "700px", background: "radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },

  page: { position: "relative", zIndex: 1, padding: "48px 24px 100px" },
  container: { maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" },
  centerState: { minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" },
  pulseRing: { width: "52px", height: "52px", border: "2px solid rgba(192,132,252,0.4)", borderRadius: "50%", animation: "pulse 1.6s ease-in-out infinite" },

  hero: { textAlign: "center", paddingBottom: "4px" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", border: "1px solid rgba(192,132,252,0.3)", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c084fc", background: "rgba(192,132,252,0.07)", marginBottom: "20px" },
  badgeDot: { width: "6px", height: "6px", background: "#c084fc", borderRadius: "50%", boxShadow: "0 0 6px #c084fc", display: "inline-block", animation: "pulse 2s ease-in-out infinite" },
  heroTitle: { fontSize: "clamp(28px,5vw,48px)", fontWeight: "800", color: "#f1f5f9", lineHeight: 1.1, fontFamily: "'Georgia',serif", letterSpacing: "-0.02em" },
  heroAccent: { background: "linear-gradient(135deg,#c084fc 0%,#818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" },
  statCard: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "24px", textAlign: "center", backdropFilter: "blur(12px)", overflow: "hidden", opacity: 0 },
  statIconWrap: { width: "38px", height: "38px", borderRadius: "11px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" },
  statIcon: { fontSize: "16px", color: "#c084fc" },
  statValue: { fontSize: "38px", fontWeight: "800", color: "#f1f5f9", lineHeight: 1, marginBottom: "8px", fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: "12px", color: "#64748b", letterSpacing: "0.04em" },
  statGlow: { position: "absolute", bottom: 0, right: 0, width: "70px", height: "70px", background: "radial-gradient(circle,rgba(192,132,252,0.1) 0%,transparent 70%)", borderRadius: "50%" },

  panel: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "28px", backdropFilter: "blur(14px)", overflow: "hidden" },
  panelTopGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "55%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(192,132,252,0.5),transparent)" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  panelTitleWrap: { display: "flex", alignItems: "center", gap: "10px" },
  panelIcon: { fontSize: "18px", color: "#c084fc" },
  panelTitle: { fontSize: "17px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.01em" },
  countBadge: { padding: "3px 10px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "100px", fontSize: "11px", color: "#c084fc", fontWeight: "700" },
  addBtn: { display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", background: "linear-gradient(135deg,#7c3aed,#818cf8)", border: "none", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.35)", letterSpacing: "0.02em" },

  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  td: { padding: "14px 16px", fontSize: "13px", color: "#e2e8f0", verticalAlign: "middle" },
  tdMuted: { padding: "14px 16px", fontSize: "12px", color: "#64748b", verticalAlign: "middle" },
  userCell: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#c4b5fd", flexShrink: 0 },
  userName: { fontSize: "13px", fontWeight: "700", color: "#e2e8f0" },
  onlineRow: { display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#475569", marginTop: "2px" },
  onlineDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#22d3a5", boxShadow: "0 0 5px #22d3a5", display: "inline-block" },
  rolePill: { display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid" },
  editBtn: { width: "30px", height: "30px", borderRadius: "8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: "30px", height: "30px", borderRadius: "8px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" },
  emptyCell: { textAlign: "center", padding: "60px 20px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalBox: { position: "relative", background: "rgba(8,15,28,0.98)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "24px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.8)", animation: "modalIn 0.25s cubic-bezier(0.22,1,0.36,1) forwards" },
  modalTopGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(192,132,252,0.6),transparent)" },
  modalHeader: { display: "flex", alignItems: "center", gap: "14px", padding: "22px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  modalIconWrap: { width: "40px", height: "40px", borderRadius: "12px", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  modalTitle: { fontSize: "15px", fontWeight: "700", color: "#e2e8f0", margin: 0 },
  modalSubtitle: { fontSize: "12px", color: "#475569", margin: "3px 0 0" },
  closeBtn: { marginLeft: "auto", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "pointer", width: "30px", height: "30px", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: "22px 24px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", padding: "16px 24px 22px", borderTop: "1px solid rgba(255,255,255,0.07)" },
  cancelBtn: { padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "13px", color: "#64748b", cursor: "pointer", fontWeight: "500" },
  submitBtn: { padding: "9px 20px", background: "linear-gradient(135deg,#7c3aed,#818cf8)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" },

  inputRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  label: { fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" },
  input: { padding: "10px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", fontSize: "13px", color: "#e2e8f0", outline: "none", width: "100%", boxSizing: "border-box" },
  roleToggle: { display: "flex", gap: "8px" },
  roleBtn: { flex: 1, padding: "9px 8px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", background: "rgba(255,255,255,0.03)", fontSize: "12px", color: "#64748b", cursor: "pointer", fontWeight: "600" },
  roleBtnUser: { border: "1px solid rgba(96,165,250,0.4)", background: "rgba(96,165,250,0.08)", color: "#60a5fa" },
  roleBtnDoctor: { border: "1px solid rgba(34,211,165,0.4)", background: "rgba(34,211,165,0.08)", color: "#22d3a5" },
  roleBtnAdmin: { border: "1px solid rgba(192,132,252,0.4)", background: "rgba(192,132,252,0.08)", color: "#c084fc" },
};
