import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_LABELS = {
  IT_SOFTWARE:      "IT · Software",
  CORE_ENGINEERING: "Core · Engg",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OFF_CAMPUS:       "Off Campus",
};

const GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#6366f1"],
  ["#10b981", "#0ea5e9"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#8b5cf6"],
  ["#14b8a6", "#6366f1"],
  ["#f97316", "#ec4899"],
];

function getGradient(name = "") {
  return GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];
}

export default function DriveCard({ drive, dark, favorites = new Set(), onToggleFav }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [g1, g2] = getGradient(drive.companyName);

  const isFav = favorites.has(drive.id);

  const daysLeft = drive.deadline
    ? Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const urgency =
    daysLeft === null      ? null
    : daysLeft <= 0        ? "closed"
    : daysLeft <= 2        ? "urgent"
    : daysLeft <= 7        ? "soon"
    : null;

  return (
    <div
      style={{
        ...card(dark),
        transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? dark
            ? `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px #334155`
            : `0 20px 40px rgba(99,102,241,0.15), 0 0 0 1px #e0e7ff`
          : dark
            ? "0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px #1e293b"
            : "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px #f1f5f9",
      }}
      onClick={() => navigate(`/drives/${drive.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* GRADIENT HEADER BAND */}
      <div style={{
        background: `linear-gradient(135deg, ${g1}, ${g2})`,
        borderRadius: "14px 14px 0 0",
        padding: "18px 18px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-20px", right: "-20px",
          width: "90px", height: "90px", borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: "-30px", right: "30px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />

        {/* Company initial */}
        <div style={{
          width: "46px", height: "46px", borderRadius: "14px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", fontWeight: "800", color: "white",
          letterSpacing: "-1px", marginBottom: "12px",
        }}>
          {drive.companyName?.charAt(0)?.toUpperCase()}
        </div>

        <div style={{
          fontSize: "16px", fontWeight: "800",
          color: "white", letterSpacing: "-0.5px",
          lineHeight: "1.2", textShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}>
          {drive.companyName}
        </div>
        <div style={{
          fontSize: "12.5px", color: "rgba(255,255,255,0.8)",
          marginTop: "4px", fontWeight: "500", letterSpacing: "-0.1px",
        }}>
          {drive.jobRole}
        </div>

        {/* Status pill */}
        {drive.status === "ACTIVE" && (
          <div style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "99px", padding: "3px 10px",
            fontSize: "11px", fontWeight: "700",
            color: "white", letterSpacing: "0.2px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
            }} />
            LIVE
          </div>
        )}

        {/* ── HEART / FAVORITE BUTTON ── */}
        {onToggleFav && (
          <button
            style={{
              position: "absolute",
              bottom: "14px",
              right: "16px",
              background: isFav ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              border: isFav ? "1.5px solid rgba(239,68,68,0.6)" : "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: "50%",
              width: "30px", height: "30px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.18s, transform 0.15s",
              padding: 0,
              zIndex: 3,
            }}
            title={isFav ? "Remove from saved" : "Save drive"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(drive.id);
            }}
          >
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              fill={isFav ? "white" : "none"}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        )}
      </div>

      {/* PULL-UP CARD BODY */}
      <div style={{
        background: dark ? "#1e293b" : "white",
        borderRadius: "16px",
        marginTop: "-14px",
        padding: "16px 18px 18px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* META PILLS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {drive.location && (
            <span style={pill(dark)}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {drive.location}
            </span>
          )}
          {drive.ctcDisplay && (
            <span style={{ ...pill(dark), color: "#059669", background: dark ? "#022c22" : "#f0fdf4", border: `1px solid ${dark ? "#064e3b" : "#bbf7d0"}` }}>
              ₹ {drive.ctcDisplay}
            </span>
          )}
          {drive.jobType && (
            <span style={{ ...pill(dark), color: "#7c3aed", background: dark ? "#2e1065" : "#faf5ff", border: `1px solid ${dark ? "#4c1d95" : "#e9d5ff"}` }}>
              {drive.jobType}
            </span>
          )}
        </div>

        {/* CATEGORY + CGPA ROW */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{
            fontSize: "11px", fontWeight: "700",
            letterSpacing: "0.3px", textTransform: "uppercase",
            color: dark ? "#94a3b8" : "#94a3b8",
          }}>
            {CATEGORY_LABELS[drive.category] || drive.category || "—"}
          </span>
          {drive.minCgpa && (
            <span style={{
              fontSize: "11.5px", fontWeight: "700",
              color: "#f59e0b",
              background: dark ? "#1c1400" : "#fffbeb",
              border: "1px solid #fde68a",
              padding: "2px 9px", borderRadius: "99px",
            }}>
              ★ {drive.minCgpa}+ CGPA
            </span>
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "14px",
          borderTop: `1px solid ${dark ? "#334155" : "#f1f5f9"}`,
        }}>
          <div>
            {urgency === "urgent" && (
              <span style={deadlineBadge("#b91c1c", "#fef2f2", "#fecaca", dark)}>
                🔥 {daysLeft}d left
              </span>
            )}
            {urgency === "soon" && (
              <span style={deadlineBadge("#92400e", "#fffbeb", "#fde68a", dark)}>
                ⏳ {daysLeft}d left
              </span>
            )}
            {urgency === "closed" && (
              <span style={deadlineBadge("#64748b", "#f8fafc", "#e2e8f0", dark)}>
                Closed
              </span>
            )}
            {!urgency && drive.deadline && (
              <span style={{ fontSize: "12px", color: dark ? "#64748b" : "#94a3b8", fontWeight: "500" }}>
                {new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12.5px", fontWeight: "700",
            color: g1,
            letterSpacing: "-0.2px",
          }}>
            View role
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function card(dark) {
  return {
    borderRadius: "16px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    overflow: "hidden",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    background: dark ? "#1e293b" : "white",
  };
}

function pill(dark) {
  return {
    display: "inline-flex", alignItems: "center", gap: "4px",
    fontSize: "11.5px", fontWeight: "600",
    padding: "3px 9px", borderRadius: "99px",
    letterSpacing: "-0.1px",
    color: dark ? "#94a3b8" : "#475569",
    background: dark ? "#0f172a" : "#f8fafc",
    border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  };
}

function deadlineBadge(color, bg, border, dark) {
  return {
    fontSize: "11.5px", fontWeight: "700",
    color, padding: "3px 9px", borderRadius: "99px",
    background: dark ? "#0f172a" : bg,
    border: `1px solid ${dark ? "#334155" : border}`,
  };
}