// src/components/AdminLayout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { label: "Prédictions", path: "/predict", icon: "🔮" },
  { label: "Médecins", path: "/doctors", icon: "⚕" },
  { label: "Historique", path: "/history", icon: "◈" },
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" }

  
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar gauche */}
      <aside style={{ ...styles.sidebar, width: collapsed ? "80px" : "260px" }}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏥</span>
          {!collapsed && <span style={styles.logoText}>SkinAI Admin</span>}
        </div>

        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? "→" : "←"}
        </button>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          {!collapsed && (
            <div style={styles.userDetails}>
              <div style={styles.userName}>Dr. {user.first_name} {user.last_name}</div>
              <div style={styles.userRole}>Administrateur</div>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {collapsed ? "🚪" : "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#050d1a",
  },
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    background: "rgba(10, 20, 35, 0.95)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s ease",
    zIndex: 100,
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "20px",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #c084fc, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  collapseBtn: {
    position: "absolute",
    right: "-12px",
    top: "80px",
    width: "24px",
    height: "24px",
    borderRadius: "12px",
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    zIndex: 101,
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "0 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderRadius: "12px",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    fontSize: "14px",
  },
  navItemActive: {
    background: "rgba(99, 102, 241, 0.15)",
    color: "#a5b4fc",
    borderLeft: "2px solid #818cf8",
  },
  navIcon: {
    fontSize: "20px",
    minWidth: "24px",
  },
  navLabel: {
    whiteSpace: "nowrap",
  },
  userInfo: {
    padding: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "auto",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #c084fc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
    overflow: "hidden",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "10px",
    color: "#64748b",
  },
  logoutBtn: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  main: {
    flex: 1,
    marginLeft: "260px",
    transition: "margin-left 0.3s ease",
    minHeight: "100vh",
  },
};

// Ajoutez ceci pour gérer le margin quand la sidebar est réduite
// Dans un useEffect ou avec CSS-in-JS dynamique