import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

// ── Same design tokens as Home.jsx ────────────────────────────────────────────
const DARK = {
  bg:               "#080820",
  glass:            "rgba(255,255,255,0.04)",
  glassMid:         "rgba(255,255,255,0.06)",
  glassBorder:      "rgba(255,255,255,0.09)",
  glassBorderHover: "rgba(255,255,255,0.18)",
  text:             "#f0f0ff",
  textSecondary:    "rgba(240,240,255,0.55)",
  textMuted:        "rgba(240,240,255,0.32)",
  accent:           "#6366f1",
  accentLight:      "#818cf8",
  accentSoft:       "rgba(99,102,241,0.15)",
  gradient:         "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  warning:          "#f59e0b",
  warningTint:      "rgba(245,158,11,0.12)",
  success:          "#10b981",
  successTint:      "rgba(16,185,129,0.12)",
  danger:           "#f87171",
  dangerTint:       "rgba(248,113,113,0.12)",
  divider:          "rgba(255,255,255,0.07)",
  inputBg:          "rgba(255,255,255,0.06)",
  shadow:           "0 4px 24px rgba(0,0,0,0.4)",
  shadowLg:         "0 20px 60px rgba(0,0,0,0.5)",
};

const LIGHT = {
  bg:               "#f4f3fa",
  glass:            "#ffffff",
  glassMid:         "#fafafa",
  glassBorder:      "rgba(99,102,241,0.10)",
  glassBorderHover: "rgba(99,102,241,0.25)",
  text:             "#1a1740",
  textSecondary:    "rgba(26,23,64,0.55)",
  textMuted:        "rgba(26,23,64,0.38)",
  accent:           "#6366f1",
  accentLight:      "#6366f1",
  accentSoft:       "rgba(99,102,241,0.08)",
  gradient:         "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  warning:          "#d97706",
  warningTint:      "rgba(217,119,6,0.08)",
  success:          "#059669",
  successTint:      "rgba(5,150,105,0.08)",
  danger:           "#dc2626",
  dangerTint:       "rgba(220,38,38,0.08)",
  divider:          "rgba(99,102,241,0.08)",
  inputBg:          "#f8f7fc",
  shadow:           "0 4px 24px rgba(99,102,241,0.08)",
  shadowLg:         "0 20px 60px rgba(76,29,149,0.10)",
};

const CATEGORY_LABELS = {
  IT_SOFTWARE:      "IT / Software",
  CORE_ENGINEERING: "Core Engineering",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OTHERS:           "Others",
};

// urgency helper
function getUrgency(deadline) {
  if (!deadline) return { daysLeft: null, level: "none" };
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { daysLeft: diff,  level: "closed" };
  if (diff <= 3) return { daysLeft: diff,  level: "urgent" };
  if (diff <= 7) return { daysLeft: diff,  level: "soon"   };
  return           { daysLeft: diff,  level: "open"   };
}

// company initial → gradient accent (same palette as Home DriveCard)
const ACCENT_PALETTE = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#14b8a6,#6366f1)",
];
function getAccent(name = "") {
  const code = [...name.toUpperCase()].reduce((s, c) => s + c.charCodeAt(0), 0);
  return ACCENT_PALETTE[code % ACCENT_PALETTE.length];
}

// solid version of gradient accent for borders / glows
const ACCENT_SOLIDS = [
  "#6366f1","#ec4899","#0ea5e9","#10b981","#f59e0b","#8b5cf6","#14b8a6",
];
function getAccentSolid(name = "") {
  const code = [...name.toUpperCase()].reduce((s, c) => s + c.charCodeAt(0), 0);
  return ACCENT_SOLIDS[code % ACCENT_SOLIDS.length];
}

// ── Global styles ─────────────────────────────────────────────────────────────
const STYLE_BLOCK = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  @keyframes dd-fade-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dd-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes dd-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  .dd-in   { animation: dd-fade-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .dd-skel {
    background: linear-gradient(90deg,
      rgba(129,140,248,0.06) 25%,
      rgba(129,140,248,0.14) 37%,
      rgba(129,140,248,0.06) 63%
    );
    background-size: 600px 100%;
    animation: dd-shimmer 1.6s ease-in-out infinite;
    border-radius: 10px;
  }
  .dd-focus:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 3px;
    border-radius: 8px;
  }
  .dd-apply-btn {
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }
  .dd-apply-btn:hover { transform: translateY(-2px); }
  .dd-chip { transition: border-color 0.15s ease; }

  @media (prefers-reduced-motion: reduce) {
    .dd-in, .dd-skel { animation: none; }
    .dd-apply-btn:hover { transform: none; }
  }
  @media (max-width: 680px) {
    .dd-grid { grid-template-columns: 1fr !important; }
    .dd-hero-row { flex-direction: column !important; align-items: flex-start !important; }
  }
`;

// ── Ambient glow (dark only) ──────────────────────────────────────────────────
function AmbientGlow() {
  return (
    <div aria-hidden style={{ position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none" }}>
      <div style={{ position:"absolute",top:"-10%",right:"-5%",width:"45%",height:"45%",borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)" }} />
      <div style={{ position:"absolute",bottom:"5%",left:"-10%",width:"40%",height:"40%",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 70%)" }} />
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ tk }) {
  return (
    <div style={{ maxWidth:820,margin:"0 auto",padding:"32px 20px 60px" }}>
      <div className="dd-skel" style={{ width:80,height:13,marginBottom:28,borderRadius:8 }} />
      <div style={{ background:tk.glass,border:`1px solid ${tk.glassBorder}`,borderRadius:20,overflow:"hidden",boxShadow:tk.shadowLg }}>
        <div style={{ padding:"32px 28px 28px",borderBottom:`1px solid ${tk.glassBorder}` }}>
          <div style={{ display:"flex",gap:16,marginBottom:24 }}>
            <div className="dd-skel" style={{ width:60,height:60,borderRadius:16,flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div className="dd-skel" style={{ width:"55%",height:22,marginBottom:10 }} />
              <div className="dd-skel" style={{ width:"38%",height:14 }} />
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12 }}>
            {[1,2,3,4].map(i => <div key={i} className="dd-skel" style={{ height:52,borderRadius:12 }} />)}
          </div>
        </div>
        <div style={{ padding:"28px 28px 32px" }}>
          {[1,2,3,4,5].map(i => <div key={i} className="dd-skel" style={{ height:13,marginBottom:14,width:`${70+i*5}%` }} />)}
        </div>
      </div>
    </div>
  );
}

// ── Info chip (hero row) ──────────────────────────────────────────────────────
function InfoChip({ icon, label, value, tk }) {
  return (
    <div style={{
      background: tk.glassMid,
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: 14, padding: "12px 16px",
      display: "flex", flexDirection: "column", gap: 4, minWidth: 0,
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", display:"flex",alignItems:"center",gap:5 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: tk.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {value || "—"}
      </div>
    </div>
  );
}

// ── Detail row (manifest section) ────────────────────────────────────────────
function DetailRow({ label, children, tk }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "11px 0", borderBottom: `1px solid ${tk.divider}`,
      gap: 16,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: tk.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", flexShrink:0 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: tk.text, textAlign:"right" }}>
        {children}
      </span>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ children, tk }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
      <div style={{ width:3,height:16,borderRadius:99,background:tk.gradient }} />
      <span style={{ fontSize:11,fontWeight:700,color:tk.textMuted,textTransform:"uppercase",letterSpacing:"0.8px" }}>
        {children}
      </span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, tk }) {
  const cfg =
    status === "ACTIVE"   ? { color: tk.success,  bg: tk.successTint,  label: "Active"   } :
    status === "UPCOMING" ? { color: tk.accent,   bg: tk.accentSoft,   label: "Upcoming" } :
    status === "CLOSED"   ? { color: tk.danger,   bg: tk.dangerTint,   label: "Closed"   } :
    status === "EXPIRED"  ? { color: tk.warning,  bg: tk.warningTint,  label: "Expired"  } :
    { color: tk.textMuted, bg: tk.glassMid, label: status || "Unknown" };

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      fontSize:12, fontWeight:700, color:cfg.color,
      background:cfg.bg, border:`1px solid ${cfg.color}33`,
      borderRadius:999, padding:"4px 12px",
    }}>
      {status === "ACTIVE" && (
        <span style={{ width:6,height:6,borderRadius:"50%",background:cfg.color,animation:"dd-pulse-dot 2s ease-in-out infinite",boxShadow:`0 0 6px ${cfg.color}` }} />
      )}
      {cfg.label}
    </span>
  );
}

// ── Urgency badge ─────────────────────────────────────────────────────────────
function UrgencyBadge({ level, daysLeft, deadline, tk }) {
  if (level === "none" || !deadline) return <span style={{ color:tk.textMuted }}>—</span>;
  const date = new Date(deadline).toLocaleDateString("en-IN",{ day:"numeric",month:"short",year:"numeric" });
  const cfg =
    level === "closed" ? { color:"#f87171", bg:"rgba(248,113,113,0.12)", suffix:" · Closed"    } :
    level === "urgent" ? { color:tk.warning, bg:tk.warningTint,          suffix:` · ${daysLeft}d left` } :
    level === "soon"   ? { color:"#38bdf8",  bg:"rgba(56,189,248,0.10)",  suffix:` · ${daysLeft}d left` } :
    { color: tk.success, bg: tk.successTint, suffix: "" };

  return (
    <span style={{ color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.color}33`, borderRadius:999, padding:"3px 12px", fontSize:13, fontWeight:700 }}>
      {date}{cfg.suffix}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DriveDetails() {
  const { id }     = useParams();
  const { dark }   = useTheme();
  const navigate   = useNavigate();
  const tk         = dark ? DARK : LIGHT;

  const [drive, setDrive] = useState(null);

  useEffect(() => {
    axios.get(`/drives/${id}`)
      .then(res => setDrive(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const requireLoginThenApply = (applyLink) => {
    const token = localStorage.getItem("token");
    if (!token) {
      sessionStorage.setItem("postLoginRedirect", window.location.pathname);
      sessionStorage.setItem("pendingApplyLink", applyLink);
      navigate("/login");
      return;
    }
    window.open(applyLink, "_blank", "noopener,noreferrer");
  };

  if (!drive) {
    return (
      <div style={{ minHeight:"100vh", background:tk.bg, fontFamily:"'Inter',system-ui,sans-serif", position:"relative" }}>
        <style>{STYLE_BLOCK}</style>
        {dark && <AmbientGlow />}
        <div style={{ position:"relative",zIndex:1 }}>
          <Skeleton tk={tk} />
        </div>
      </div>
    );
  }

  const accentGradient = getAccent(drive.companyName);
  const accentSolid    = getAccentSolid(drive.companyName);
  const { daysLeft, level: urgency } = getUrgency(drive.deadline);

  const skills = (drive.keySkills || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  const eligibility = [
    drive.eligibleBranches || "Any branch",
    drive.eligibleBatches  || "Any batch",
    drive.eligibleDegrees  || "Any degree",
  ];

  return (
    <div style={{ minHeight:"100vh", background:tk.bg, fontFamily:"'Inter',system-ui,-apple-system,sans-serif", position:"relative", WebkitFontSmoothing:"antialiased" }}>
      <style>{STYLE_BLOCK}</style>
      {dark && <AmbientGlow />}

      <div style={{ position:"relative", zIndex:1, maxWidth:820, margin:"0 auto", padding:"32px 20px 80px" }}>

        {/* ── Back button ── */}
        <button
          className="dd-focus"
          onClick={() => navigate(-1)}
          style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"transparent", border:"none", cursor:"pointer",
            fontSize:12.5, fontWeight:700, color:tk.textMuted,
            padding:"6px 2px", marginBottom:24, fontFamily:"inherit",
            letterSpacing:"-0.1px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to drives
        </button>

        {/* ── Main card ── */}
        <div
          className="dd-in"
          style={{
            background: tk.glass,
            border: `1px solid ${tk.glassBorder}`,
            borderRadius: 20,
            boxShadow: tk.shadowLg,
            overflow: "hidden",
          }}
        >
          {/* Gradient top accent bar */}
          <div style={{ height:4, background:accentGradient }} />

          {/* ── HERO SECTION ── */}
          <div style={{ padding:"28px 28px 24px", borderBottom:`1px solid ${tk.divider}` }}>

            {/* Company row */}
            <div className="dd-hero-row" style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:24, flexWrap:"wrap" }}>
              {/* Logo avatar */}
              <div style={{
                width:60, height:60, borderRadius:16, flexShrink:0,
                background:accentGradient,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, fontWeight:800, color:"#fff",
                boxShadow:`0 8px 24px ${accentSolid}40`,
              }}>
                {(drive.companyName || "?").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={{ fontSize:26, fontWeight:800, color:tk.text, margin:"0 0 6px", letterSpacing:"-0.5px", lineHeight:1.1 }}>
                  {drive.companyName}
                </h1>
                <p style={{ fontSize:14.5, color:tk.textSecondary, margin:0, fontWeight:500 }}>
                  {drive.jobRole}
                </p>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <StatusBadge status={drive.status} tk={tk} />
                {(urgency === "urgent" || urgency === "soon") && (
                  <span style={{
                    fontSize:11.5, fontWeight:700,
                    color:tk.warning, background:tk.warningTint,
                    border:`1px solid ${tk.warning}33`, borderRadius:999, padding:"4px 10px",
                  }}>
                    ⚡ {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
                  </span>
                )}
              </div>
            </div>

            {/* Info chips grid */}
            <div className="dd-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
              <InfoChip icon="📍" label="Location"   value={drive.location   || "Remote / NA"} tk={tk} />
              <InfoChip icon="💰" label="Package"    value={drive.ctcDisplay ? `₹ ${drive.ctcDisplay}` : "Not disclosed"} tk={tk} />
              <InfoChip icon="🏢" label="Work mode"  value={drive.isRemote   ? "Remote" : "Onsite"} tk={tk} />
              <InfoChip icon="💼" label="Role type"  value={drive.jobType    || "Full-Time"} tk={tk} />
              <InfoChip icon="🎓" label="Experience" value={drive.experienceLevel || "Freshers"} tk={tk} />
              <InfoChip icon="🗂️"  label="Category"  value={CATEGORY_LABELS[drive.category] || drive.category || "—"} tk={tk} />
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ padding:"26px 28px 32px" }}>

            {/* Manifest / details */}
            <section style={{ marginBottom:28 }}>
              <SectionHeading tk={tk}>Details</SectionHeading>
              <DetailRow label="Deadline" tk={tk}>
                <UrgencyBadge level={urgency} daysLeft={daysLeft} deadline={drive.deadline} tk={tk} />
              </DetailRow>
              <DetailRow label="Min CGPA" tk={tk}>
                {drive.minCgpa || "No minimum"}
              </DetailRow>
              <DetailRow label="Max backlogs" tk={tk}>
                {drive.maxBacklogs != null ? String(drive.maxBacklogs) : "Not specified"}
              </DetailRow>
              {drive.applyLink && (
                <DetailRow label="Apply link" tk={tk}>
                  <span
                    onClick={() => requireLoginThenApply(drive.applyLink)}
                    style={{ color:accentSolid, cursor:"pointer", fontWeight:700, textDecoration:"underline", textDecorationColor:`${accentSolid}55` }}
                  >
                    Open link ↗
                  </span>
                </DetailRow>
              )}
            </section>

            {/* Eligibility */}
            <section style={{ marginBottom:28 }}>
              <SectionHeading tk={tk}>Eligibility</SectionHeading>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {eligibility.map(tag => (
                  <span
                    key={tag}
                    className="dd-chip"
                    style={{
                      fontSize:12.5, fontWeight:600, color:tk.textSecondary,
                      background:tk.glassMid, border:`1px solid ${tk.glassBorder}`,
                      borderRadius:999, padding:"6px 14px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Key skills */}
            {skills.length > 0 && (
              <section style={{ marginBottom:28 }}>
                <SectionHeading tk={tk}>Key skills</SectionHeading>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="dd-chip"
                      style={{
                        fontSize:12.5, fontWeight:600, color:accentSolid,
                        background:`${accentSolid}14`, border:`1px solid ${accentSolid}40`,
                        borderRadius:999, padding:"6px 14px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Job description */}
            {drive.jobDescription && (
              <section style={{ marginBottom:28 }}>
                <SectionHeading tk={tk}>About the role</SectionHeading>
                <p style={{
                  fontSize:14, lineHeight:1.8, color:tk.textSecondary,
                  margin:0, whiteSpace:"pre-line",
                  background:tk.glassMid, border:`1px solid ${tk.glassBorder}`,
                  borderRadius:14, padding:"18px 20px",
                }}>
                  {drive.jobDescription}
                </p>
              </section>
            )}

            {/* ── CTA ── */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:14, paddingTop:20, borderTop:`1px solid ${tk.divider}`,
              flexWrap:"wrap",
            }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>
                  Ready to apply?
                </div>
                <div style={{ fontSize:13, color:tk.textSecondary }}>
                  {drive.companyName} · {drive.jobRole}
                </div>
              </div>

              {drive.applyLink ? (
                <button
                  className="dd-focus dd-apply-btn"
                  onClick={() => requireLoginThenApply(drive.applyLink)}
                  style={{
                    padding:"13px 32px", fontSize:14, fontWeight:700,
                    background:accentGradient, color:"#fff",
                    border:"none", borderRadius:13, cursor:"pointer",
                    fontFamily:"inherit", letterSpacing:"-0.2px",
                    boxShadow:`0 8px 24px ${accentSolid}40`,
                  }}
                >
                  Apply now →
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    padding:"13px 28px", fontSize:14, fontWeight:600,
                    background:tk.glassMid, color:tk.textMuted,
                    border:`1px solid ${tk.glassBorder}`, borderRadius:13,
                    cursor:"not-allowed", fontFamily:"inherit",
                  }}
                >
                  Application unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}