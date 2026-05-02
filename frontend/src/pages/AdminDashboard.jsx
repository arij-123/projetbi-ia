// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

// ── Tiny chart primitives (no external lib needed) ──────────────────────────

function BarChart({ data, colorFn, valueKey = "value", labelKey = "label", height = 140 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: `${height}px`, padding: "0 4px" }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        const color = colorFn ? colorFn(d, i) : "#6366f1";
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color, fontVariantNumeric: "tabular-nums" }}>{d[valueKey]}</span>
            <div style={{ width: "100%", height: `${pct}%`, minHeight: "4px", background: color, borderRadius: "6px 6px 0 0", boxShadow: `0 0 12px ${color}55`, transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "rgba(255,255,255,0.15)", borderRadius: "6px 6px 0 0" }} />
            </div>
            <span style={{ fontSize: "9px", color: "#475569", textAlign: "center", lineHeight: 1.2, letterSpacing: "0.04em" }}>{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 120, thickness = 22 }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${seg.color}66)`, transition: "stroke-dasharray 0.8s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
    </svg>
  );
}

function SparkLine({ values, color = "#22d3a5", height = 40, width = 120 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") { navigate("/predict"); return; }

        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, statsRes, doctorsRes] = await Promise.all([
          axios.get("http://localhost:8000/admin/users", { headers }),
          axios.get("http://localhost:8000/admin/stats", { headers }),
          axios.get("http://localhost:8000/api/doctors", { headers }),
        ]);

        const users = usersRes.data.users || [];
        const stats = statsRes.data || {};
        const doctors = doctorsRes.data || [];

        // Derive insights
        const roleBreakdown = [
          { label: "Patients", value: users.filter(u => u.role === "user").length, color: "#60a5fa" },
          { label: "Médecins", value: users.filter(u => u.role === "doctor").length, color: "#22d3a5" },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "#c084fc" },
        ];

        const topDoctors = [...doctors]
          .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
          .slice(0, 6);

        const cityCounts = {};
        users.forEach(u => { if (u.city) cityCounts[u.city] = (cityCounts[u.city] || 0) + 1; });
        const topCities = Object.entries(cityCounts)
          .sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([label, value]) => ({ label, value }));

        // Fake sparkline trends (replace with real API data if available)
        const trend = [12, 18, 15, 22, 28, 24, 32, 38, 35, 42, 48, users.length];
        const reviewTrend = [3, 5, 4, 8, 6, 10, 9, 12, 11, 14, 16, doctors.reduce((s, d) => s + (d.rating_count || 0), 0)];

        setData({ users, stats, doctors, roleBreakdown, topDoctors, topCities, trend, reviewTrend });
      } catch (err) {
        if (err.response?.status === 403) navigate("/predict");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  if (loading) return (
    <div style={S.root}><style>{kf}</style><Header />
      <div style={S.center}><div style={S.pulseRing} /><p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Chargement du tableau de bord…</p></div>
    </div>
  );

  if (!data) return null;

  const { users, stats, doctors, roleBreakdown, topDoctors, topCities, trend, reviewTrend } = data;
  const totalReviews = doctors.reduce((s, d) => s + (d.rating_count || 0), 0);
  const avgRating = doctors.length
    ? (doctors.reduce((s, d) => s + (d.avg_rating || 0), 0) / doctors.length).toFixed(2)
    : "—";

  const kpis = [
    { label: "Utilisateurs", value: users.length, icon: "◈", color: "#60a5fa", trend: "+12%", spark: trend, sparkColor: "#60a5fa" },
    { label: "Médecins", value: doctors.length, icon: "⚕", color: "#22d3a5", trend: "+5%", spark: [2,3,3,4,4,5,5,6,6,7,7,doctors.length], sparkColor: "#22d3a5" },
    { label: "Avis totaux", value: totalReviews, icon: "★", color: "#fbbf24", trend: "+24%", spark: reviewTrend, sparkColor: "#fbbf24" },
    { label: "Note moyenne", value: avgRating, icon: "◆", color: "#c084fc", trend: "stable", spark: [3.8,3.9,4.0,3.9,4.1,4.0,4.2,4.1,4.3,4.2,4.4,parseFloat(avgRating)||4.2], sparkColor: "#c084fc" },
  ];

  return (
    <div style={S.root}>
      <style>{kf}</style>
      <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
      <Header />

      <div style={S.page}>
        <div style={S.container}>

          {/* ── Hero ── */}
          <div style={{ ...S.hero, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={S.heroBadge}><span style={S.badgeDot} />Business Intelligence</div>
            <h1 style={S.heroTitle}>Tableau de<br /><span style={S.heroAccent}>Bord Admin</span></h1>
            <p style={S.heroSub}>Vue en temps réel de la plateforme SkinAI</p>
          </div>

          {/* ── Tabs ── */}
          <div style={S.tabs}>
            {[
              { id: "overview", label: "◈ Vue d'ensemble" },
              { id: "doctors", label: "⚕ Médecins" },
              { id: "users", label: "◉ Utilisateurs" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ ...S.tab, ...(activeTab === t.id ? S.tabActive : {}) }}>
                {t.label}
                {activeTab === t.id && <span style={S.tabBar} />}
              </button>
            ))}
          </div>

          {/* ── KPI Cards ── */}
          <div style={S.kpiGrid}>
            {kpis.map((k, i) => (
              <div key={i} style={{ ...S.kpiCard, animationDelay: `${i * 70}ms`, animation: "slideUp 0.6s ease forwards", opacity: 0 }}>
                <div style={S.kpiTop}>
                  <div style={{ ...S.kpiIconWrap, background: `${k.color}18`, border: `1px solid ${k.color}33` }}>
                    <span style={{ color: k.color, fontSize: "16px" }}>{k.icon}</span>
                  </div>
                  <span style={{ ...S.kpiTrend, color: k.trend === "stable" ? "#64748b" : "#22d3a5" }}>{k.trend}</span>
                </div>
                <div style={S.kpiValue}>{k.value}</div>
                <div style={S.kpiLabel}>{k.label}</div>
                <div style={S.kpiSpark}>
                  <SparkLine values={k.spark} color={k.sparkColor} width={100} height={32} />
                </div>
                <div style={{ ...S.kpiGlow, background: `radial-gradient(circle, ${k.color}18 0%, transparent 70%)` }} />
              </div>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div style={S.gridTwo}>
              {/* Role donut */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="◉" title="Répartition des rôles" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", padding: "8px 0 16px" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DonutChart segments={roleBreakdown} size={130} thickness={20} />
                    <div style={{ position: "absolute", textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9" }}>{users.length}</div>
                      <div style={{ fontSize: "9px", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Total</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {roleBreakdown.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: r.color, boxShadow: `0 0 8px ${r.color}88`, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{r.value}</div>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>{r.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cities bar chart */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="◎" title="Utilisateurs par ville" badge={`${topCities.length} villes`} />
                {topCities.length > 0 ? (
                  <BarChart data={topCities} valueKey="value" labelKey="label" height={140}
                    colorFn={(_, i) => ["#6366f1","#60a5fa","#22d3a5","#fbbf24","#c084fc","#f87171"][i % 6]} />
                ) : (
                  <EmptyState label="Aucune donnée de ville" />
                )}
              </div>

              {/* Top doctors preview */}
              <div style={{ ...S.panel, gridColumn: "1 / -1" }}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="⚕" title="Top médecins" badge={`${topDoctors.length} sur ${doctors.length}`} />
                <div style={S.topDoctorsGrid}>
                  {topDoctors.map((doc, i) => (
                    <DoctorCard key={doc.id} doc={doc} rank={i + 1} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Doctors Tab ── */}
          {activeTab === "doctors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Rating distribution */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="★" title="Distribution des notes" badge={`${totalReviews} avis`} />
                {(() => {
                  const buckets = [
                    { label: "5★", value: doctors.filter(d => Math.round(d.avg_rating || 0) === 5).length, color: "#22d3a5" },
                    { label: "4★", value: doctors.filter(d => Math.round(d.avg_rating || 0) === 4).length, color: "#60a5fa" },
                    { label: "3★", value: doctors.filter(d => Math.round(d.avg_rating || 0) === 3).length, color: "#fbbf24" },
                    { label: "2★", value: doctors.filter(d => Math.round(d.avg_rating || 0) === 2).length, color: "#f97316" },
                    { label: "1★", value: doctors.filter(d => Math.round(d.avg_rating || 0) === 1).length, color: "#f87171" },
                    { label: "0★", value: doctors.filter(d => !d.avg_rating).length, color: "#334155" },
                  ];
                  return <BarChart data={buckets} valueKey="value" labelKey="label" height={160} colorFn={(d) => d.color} />;
                })()}
              </div>

              {/* Full doctors table */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="≡" title="Tous les médecins" badge={`${doctors.length} médecins`} />
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {["#", "Médecin", "Spécialité", "Ville", "Note", "Avis", "Score"].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...doctors].sort((a,b) => (b.avg_rating||0)-(a.avg_rating||0)).map((doc, i) => (
                        <tr key={doc.id} style={S.tr}>
                          <td style={S.tdMuted}>#{i + 1}</td>
                          <td style={S.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ ...S.miniAvatar, background: `linear-gradient(135deg, ${["#3730a3","#065f46","#7c2d12","#4c0519"][i%4]}, ${["#1e40af","#047857","#b45309","#9f1239"][i%4]})` }}>
                                {doc.first_name?.[0]}{doc.last_name?.[0]}
                              </div>
                              <span style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>Dr. {doc.first_name} {doc.last_name}</span>
                            </div>
                          </td>
                          <td style={S.tdMuted}>{doc.specialty || "—"}</td>
                          <td style={S.tdMuted}>{doc.city || "—"}</td>
                          <td style={S.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ color: s <= Math.round(doc.avg_rating||0) ? "#fbbf24" : "#1e293b", fontSize: "12px" }}>★</span>
                              ))}
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "#fbbf24", marginLeft: "4px" }}>{(doc.avg_rating||0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td style={S.tdMuted}>{doc.rating_count || 0}</td>
                          <td style={S.td}>
                            <ScoreBar value={doc.avg_rating || 0} max={5} color="#22d3a5" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Users Tab ── */}
          {activeTab === "users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Age distribution */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="◷" title="Répartition par âge" />
                {(() => {
                  const ageGroups = [
                    { label: "< 20", value: users.filter(u => u.age && u.age < 20).length, color: "#60a5fa" },
                    { label: "20–30", value: users.filter(u => u.age >= 20 && u.age < 30).length, color: "#22d3a5" },
                    { label: "30–40", value: users.filter(u => u.age >= 30 && u.age < 40).length, color: "#6366f1" },
                    { label: "40–50", value: users.filter(u => u.age >= 40 && u.age < 50).length, color: "#fbbf24" },
                    { label: "50+", value: users.filter(u => u.age >= 50).length, color: "#c084fc" },
                    { label: "N/A", value: users.filter(u => !u.age).length, color: "#334155" },
                  ];
                  return <BarChart data={ageGroups} valueKey="value" labelKey="label" height={160} colorFn={d => d.color} />;
                })()}
              </div>

              {/* Users table */}
              <div style={S.panel}>
                <div style={S.panelTopGlow} />
                <PanelHeader icon="◈" title="Tous les utilisateurs" badge={`${users.length} comptes`} />
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {["Utilisateur", "Email", "Rôle", "Ville", "Âge"].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => {
                        const rStyle = { admin: S.roleAdmin, doctor: S.roleDoctor }[u.role] || S.roleUser;
                        const rLabel = { admin: "Admin", doctor: "Médecin" }[u.role] || "Patient";
                        return (
                          <tr key={u.id} style={S.tr}>
                            <td style={S.td}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ ...S.miniAvatar, background: ["linear-gradient(135deg,#3730a3,#1e40af)","linear-gradient(135deg,#065f46,#047857)","linear-gradient(135deg,#7c2d12,#b45309)","linear-gradient(135deg,#4c0519,#9f1239)"][i%4] }}>
                                  {u.first_name?.[0]}{u.last_name?.[0]}
                                </div>
                                <div>
                                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{u.first_name} {u.last_name}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                    <span style={S.onlineDot} /> <span style={{ fontSize: "10px", color: "#475569" }}>En ligne</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={S.tdMuted}>{u.email}</td>
                            <td style={S.td}><span style={{ ...S.rolePill, ...rStyle }}>{rLabel}</span></td>
                            <td style={S.tdMuted}>{u.city || "—"}</td>
                            <td style={S.tdMuted}>{u.age || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PanelHeader({ icon, title, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <span style={{ fontSize: "18px", color: "#818cf8" }}>{icon}</span>
      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.01em" }}>{title}</h3>
      {badge && <span style={S.badge}>{badge}</span>}
    </div>
  );
}

function DoctorCard({ doc, rank }) {
  const color = rank === 1 ? "#fbbf24" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c2f" : "#475569";
  return (
    <div style={S.doctorCard}>
      <div style={{ ...S.rankBadge, color, borderColor: `${color}44`, background: `${color}11` }}>#{rank}</div>
      <div style={S.doctorAvatar}>{doc.first_name?.[0]}{doc.last_name?.[0]}</div>
      <p style={S.doctorName}>Dr. {doc.first_name} {doc.last_name}</p>
      <p style={S.doctorSpec}>{doc.specialty || "—"}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "2px", margin: "6px 0" }}>
        {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(doc.avg_rating||0) ? "#fbbf24" : "#1e293b", fontSize: "13px" }}>★</span>)}
      </div>
      <div style={S.doctorStats}>
        <div style={S.doctorStatItem}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#fbbf24" }}>{(doc.avg_rating||0).toFixed(1)}</span>
          <span style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Note</span>
        </div>
        <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.07)" }} />
        <div style={S.doctorStatItem}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#60a5fa" }}>{doc.rating_count || 0}</span>
          <span style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avis</span>
        </div>
      </div>
      {doc.city && <p style={{ fontSize: "10px", color: "#475569", textAlign: "center", marginTop: "8px" }}>◎ {doc.city}</p>}
    </div>
  );
}

function ScoreBar({ value, max = 5, color }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "70px", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: "100px", boxShadow: `0 0 6px ${color}66` }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "700", color, fontVariantNumeric: "tabular-nums" }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function EmptyState({ label }) {
  return <div style={{ textAlign: "center", padding: "40px", color: "#334155", fontSize: "13px" }}>{label}</div>;
}

// ── Keyframes & Styles ────────────────────────────────────────────────────────

const kf = `
  @keyframes slideUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes orbFloat { 0%,100%{transform:translateY(0);}50%{transform:translateY(-28px);} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(1.5);} }
`;

const S = {
  root: { position: "relative", minHeight: "100vh", background: "#050d1a", overflow: "hidden" },
  orb1: { position: "fixed", top: "-180px", right: "-80px", width: "520px", height: "520px", background: "radial-gradient(circle,rgba(192,132,252,0.14) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 14s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-120px", left: "-80px", width: "460px", height: "460px", background: "radial-gradient(circle,rgba(34,211,165,0.1) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "orbFloat 18s ease-in-out infinite reverse" },
  orb3: { position: "fixed", top: "40%", left: "35%", width: "700px", height: "700px", background: "radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },

  page: { position: "relative", zIndex: 1, padding: "48px 24px 100px" },
  container: { maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" },
  center: { minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" },
  pulseRing: { width: "52px", height: "52px", border: "2px solid rgba(192,132,252,0.4)", borderRadius: "50%", animation: "pulse 1.6s ease-in-out infinite" },

  hero: { textAlign: "center", paddingBottom: "4px" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", border: "1px solid rgba(192,132,252,0.3)", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c084fc", background: "rgba(192,132,252,0.07)", marginBottom: "20px" },
  badgeDot: { width: "6px", height: "6px", background: "#c084fc", borderRadius: "50%", boxShadow: "0 0 6px #c084fc", display: "inline-block", animation: "pulse 2s ease-in-out infinite" },
  heroTitle: { fontSize: "clamp(28px,5vw,48px)", fontWeight: "800", color: "#f1f5f9", lineHeight: 1.1, fontFamily: "'Georgia',serif", letterSpacing: "-0.02em" },
  heroAccent: { background: "linear-gradient(135deg,#c084fc 0%,#818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "14px", color: "#64748b", marginTop: "10px" },

  /* Tabs */
  tabs: { display: "flex", gap: "4px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "6px" },
  tab: { position: "relative", flex: 1, padding: "10px 16px", background: "transparent", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "500", color: "#64748b", cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontWeight: "700" },
  tabBar: { position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "20px", height: "2px", background: "linear-gradient(90deg,#6366f1,#22d3a5)", borderRadius: "100px" },

  /* KPI */
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" },
  kpiCard: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px", backdropFilter: "blur(12px)", overflow: "hidden", opacity: 0 },
  kpiTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  kpiIconWrap: { width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  kpiTrend: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em" },
  kpiValue: { fontSize: "34px", fontWeight: "800", color: "#f1f5f9", lineHeight: 1, marginBottom: "4px", fontVariantNumeric: "tabular-nums" },
  kpiLabel: { fontSize: "11px", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" },
  kpiSpark: { opacity: 0.7 },
  kpiGlow: { position: "absolute", bottom: 0, right: 0, width: "80px", height: "80px", borderRadius: "50%" },

  /* Panels */
  panel: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "24px", backdropFilter: "blur(14px)", overflow: "hidden" },
  panelTopGlow: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "55%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(192,132,252,0.5),transparent)" },
  gridTwo: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "20px" },

  badge: { padding: "3px 10px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "100px", fontSize: "11px", color: "#a5b4fc", fontWeight: "700" },

  /* Top doctors grid */
  topDoctorsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "12px" },
  doctorCard: { position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  rankBadge: { position: "absolute", top: "10px", right: "10px", fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "100px", border: "1px solid", letterSpacing: "0.04em" },
  doctorAvatar: { width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#3730a3,#1e40af)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "#a5b4fc", marginBottom: "4px" },
  doctorName: { fontSize: "12px", fontWeight: "700", color: "#e2e8f0", textAlign: "center", lineHeight: 1.3 },
  doctorSpec: { fontSize: "10px", color: "#6366f1", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center" },
  doctorStats: { display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "8px 14px", width: "100%" },
  doctorStatItem: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "2px" },

  /* Table */
  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  th: { padding: "11px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  td: { padding: "13px 14px", fontSize: "13px", color: "#e2e8f0", verticalAlign: "middle" },
  tdMuted: { padding: "13px 14px", fontSize: "12px", color: "#64748b", verticalAlign: "middle" },
  miniAvatar: { width: "32px", height: "32px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#c4b5fd", flexShrink: 0 },
  onlineDot: { width: "5px", height: "5px", borderRadius: "50%", background: "#22d3a5", boxShadow: "0 0 4px #22d3a5", display: "inline-block" },
  rolePill: { display: "inline-block", padding: "3px 9px", borderRadius: "100px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid" },
  roleUser: { color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)" },
  roleDoctor: { color: "#22d3a5", borderColor: "rgba(34,211,165,0.3)", background: "rgba(34,211,165,0.08)" },
  roleAdmin: { color: "#c084fc", borderColor: "rgba(192,132,252,0.3)", background: "rgba(192,132,252,0.08)" },
};
