import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (token && userData?.id) setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-avatar-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (!user) return "Chargement…";
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split("@")[0];
    return "Utilisateur";
  };

  const getRoleLabel = () => {
    if (!user) return "";
    return { admin: "Administrateur", doctor: "Médecin" }[user.role] || "Patient";
  };

  const getRolePill = () => {
    if (!user) return S.roleDefault;
    return { admin: S.roleAdmin, doctor: S.roleDoctor }[user.role] || S.roleDefault;
  };

const navItems = [
  { label: "Prédiction", path: "/predict", icon: "⬡" },
  { label: "Médecins", path: "/doctors", icon: "⚕" },
  { label: "Historique", path: "/history", icon: "◈" },
  ...(user?.role === "doctor" ? [{ label: "Rendez-vous", path: "/my-appointments", icon: "◉" }] : []),
  ...(user?.role === "admin" ? [
    { label: "Utilisateurs", path: "/admin", icon: "◆" },
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" }
  ] : [])
];
  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <header style={S.header}>
        <div style={S.inner}>
          <div style={S.logo}>
            <div style={S.logoIcon}><span style={{ color: "#60a5fa", fontSize: "18px" }}>♥</span></div>
            <div>
              <div style={{ width: "80px", height: "14px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", marginBottom: "5px" }} />
              <div style={{ width: "120px", height: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "6px" }} />
            </div>
          </div>
          <div style={{ width: "200px", height: "36px", background: "rgba(255,255,255,0.04)", borderRadius: "10px" }} />
        </div>
      </header>
    );
  }

  return (
    <>
      <style>{kf}</style>
      <header style={{ ...S.header, ...(scrolled ? S.headerScrolled : {}) }}>
        {/* Top shimmer line */}
        <div style={S.shimmerLine} />

        <div style={S.inner}>
          {/* ── Logo ── */}
          <div style={S.logo} onClick={() => navigate("/")}>
            <div style={S.logoIcon}>
              <svg width="20" height="20" fill="none" stroke="#60a5fa" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p style={S.logoName}>SkinAI</p>
              <p style={S.logoSub}>Détection IA · Maladies cutanées</p>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav style={S.nav}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...S.navBtn,
                  ...(isActive(item.path) ? S.navBtnActive : {}),
                }}
              >
                <span style={{ fontSize: "13px", opacity: 0.7 }}>{item.icon}</span>
                {item.label}
                {isActive(item.path) && <span style={S.activeBar} />}
              </button>
            ))}
          </nav>

          {/* ── Right: user + logout ── */}
          <div style={S.right}>
            {/* Name (desktop) */}
            <div style={S.userMeta}>
              <p style={S.userName}>{getDisplayName()}</p>
              <span style={{ ...S.rolePill, ...getRolePill() }}>{getRoleLabel()}</span>
            </div>

            {/* Vertical divider */}
            <div style={S.divider} />

            {/* Avatar + dropdown */}
            <div style={S.avatarWrap} data-avatar-menu onClick={() => setMenuOpen(o => !o)}>
              <div style={S.avatar}>{getInitials()}</div>
              <span style={{ ...S.chevron, transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</span>

              {menuOpen && (
                <div style={S.dropdown} data-avatar-menu>
                  {/* Header */}
                  <div style={S.dropHeader}>
                    <div style={S.dropAvatar}>{getInitials()}</div>
                    <div>
                      <p style={S.dropName}>{getDisplayName()}</p>
                      <p style={S.dropEmail}>{user?.email}</p>
                    </div>
                  </div>

                  <div style={S.dropDivider} />

                  {/* Meta info */}
                  <div style={S.dropBody}>
                    <span style={{ ...S.rolePill, ...getRolePill(), fontSize: "11px" }}>{getRoleLabel()}</span>
                    {user?.city && (
                      <div style={S.dropMeta}>
                        <span style={S.dropMetaIcon}>◎</span>
                        <span>{user.city}{user.location ? ` · ${user.location}` : ""}</span>
                      </div>
                    )}
                    {user?.age && (
                      <div style={S.dropMeta}>
                        <span style={S.dropMetaIcon}>◷</span>
                        <span>{user.age} ans</span>
                      </div>
                    )}
                    {user?.phone && (
                      <div style={S.dropMeta}>
                        <span style={S.dropMetaIcon}>◈</span>
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div style={S.dropDivider} />

                  {/* Logout */}
                  <button onClick={handleLogout} style={S.dropLogout}>
                    <span>⏻</span> Déconnexion
                  </button>
                </div>
              )}
            </div>

            {/* Logout button (desktop) */}
            <button onClick={handleLogout} style={S.logoutBtn}>
              <span>⏻</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/* ─── Keyframes ─── */
const kf = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

/* ─── Styles ─── */
const S = {
  header: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(5,13,26,0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "background 0.3s, box-shadow 0.3s",
  },
  headerScrolled: {
    background: "rgba(5,13,26,0.92)",
    boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
  },
  shimmerLine: {
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 30%, rgba(34,211,165,0.5) 60%, transparent 100%)",
    backgroundSize: "200% auto",
    animation: "shimmer 4s linear infinite",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },

  /* Logo */
  logo: {
    display: "flex", alignItems: "center", gap: "12px",
    cursor: "pointer", flexShrink: 0,
    userSelect: "none",
  },
  logoIcon: {
    width: "38px", height: "38px",
    borderRadius: "12px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoName: {
    fontSize: "17px", fontWeight: "800",
    color: "#f1f5f9", letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: "10px", color: "#475569",
    letterSpacing: "0.05em",
    marginTop: "3px",
  },

  /* Nav */
  nav: {
    display: "flex", alignItems: "center", gap: "2px",
    flex: 1,
  },
  navBtn: {
    position: "relative",
    display: "flex", alignItems: "center", gap: "6px",
    padding: "7px 13px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px", fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    transition: "color 0.2s, background 0.2s",
    whiteSpace: "nowrap",
  },
  navBtnActive: {
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.05)",
  },
  activeBar: {
    position: "absolute", bottom: "2px", left: "50%",
    transform: "translateX(-50%)",
    width: "16px", height: "2px",
    background: "linear-gradient(90deg,#6366f1,#22d3a5)",
    borderRadius: "100px",
  },

  /* Right */
  right: {
    display: "flex", alignItems: "center", gap: "14px",
    flexShrink: 0,
  },
  userMeta: {
    display: "flex", flexDirection: "column", alignItems: "flex-end",
    gap: "3px",
  },
  userName: {
    fontSize: "13px", fontWeight: "700",
    color: "#cbd5e1", lineHeight: 1,
  },
  rolePill: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: "100px",
    fontSize: "10px", fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    border: "1px solid",
  },
  roleDefault: { color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)" },
  roleDoctor: { color: "#22d3a5", borderColor: "rgba(34,211,165,0.3)", background: "rgba(34,211,165,0.08)" },
  roleAdmin: { color: "#c084fc", borderColor: "rgba(192,132,252,0.3)", background: "rgba(192,132,252,0.08)" },

  divider: {
    width: "1px", height: "28px",
    background: "rgba(255,255,255,0.07)",
  },

  /* Avatar */
  avatarWrap: {
    position: "relative",
    display: "flex", alignItems: "center", gap: "6px",
    cursor: "pointer",
    userSelect: "none",
  },
  avatar: {
    width: "36px", height: "36px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#3730a3,#1e40af)",
    border: "1px solid rgba(99,102,241,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "800",
    color: "#a5b4fc",
    letterSpacing: "-0.02em",
  },
  chevron: {
    fontSize: "18px", color: "#475569",
    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    lineHeight: 1,
  },

  /* Dropdown */
  dropdown: {
    position: "absolute", top: "calc(100% + 12px)", right: 0,
    width: "240px",
    background: "rgba(10,18,32,0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "16px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
    overflow: "hidden",
    animation: "dropIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards",
    zIndex: 200,
  },
  dropHeader: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px",
  },
  dropAvatar: {
    width: "40px", height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#3730a3,#1e40af)",
    border: "1px solid rgba(99,102,241,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "800",
    color: "#a5b4fc", flexShrink: 0,
  },
  dropName: {
    fontSize: "13px", fontWeight: "700",
    color: "#e2e8f0", marginBottom: "3px",
  },
  dropEmail: {
    fontSize: "11px", color: "#475569",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    maxWidth: "140px",
  },
  dropDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
  },
  dropBody: {
    padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  dropMeta: {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "12px", color: "#64748b",
  },
  dropMetaIcon: {
    fontSize: "13px", color: "#334155",
  },
  dropLogout: {
    width: "100%",
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    color: "#f87171",
    transition: "background 0.15s",
  },

  /* Desktop logout icon */
  logoutBtn: {
    width: "34px", height: "34px",
    borderRadius: "10px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.2)",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s",
  },
};
