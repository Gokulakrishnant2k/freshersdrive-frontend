// src/components/DriveCard.jsx
//
// Unchanged visually — only the constants/helpers it used to define
// locally now come from the shared ticketTheme module so ExpiringDrives
// (and anything else) can speak the exact same visual language.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  INK,
  PAGE_BG,
  CATEGORY_LABELS,
  STATUS_INK,
  getAccent,
  barcodeBars,
} from "../utils/ticketTheme";

export default function DriveCard({ drive, dark, favorites = new Set(), onToggleFav }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const accent = getAccent(drive.companyName);
  const isFav = favorites.has(drive.id);
  const pageBg = dark ? PAGE_BG.dark : PAGE_BG.light;

  const daysLeft = drive.deadline
    ? Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const urgency =
    daysLeft === null ? null :
    daysLeft <= 0      ? "closed" :
    daysLeft <= 2       ? "urgent" :
    daysLeft <= 7        ? "soon" : null;

  const stamp =
    urgency === "urgent" ? { text: "FINAL CALL",   ink: STATUS_INK.urgent } :
    urgency === "soon"   ? { text: "CLOSING SOON", ink: STATUS_INK.soon } :
    urgency === "closed" ? { text: "CLOSED",       ink: STATUS_INK.closed } :
    null;

  // Require login before viewing a drive's details / applying.
  const handleCardClick = () => {
    const token = localStorage.getItem("token");
    const target = `/drives/${drive.id}`;

    if (!token) {
      sessionStorage.setItem("postLoginRedirect", target);
      navigate("/login");
      return;
    }
    navigate(target);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const bars = barcodeBars(String(drive.id ?? drive.companyName ?? "x"));

  return (
    <>
      <style>{STYLE_BLOCK}</style>
      <div
        className="pp-ticket"
        role="button"
        tabIndex={0}
        aria-label={`View ${drive.jobRole ?? "role"} at ${drive.companyName ?? "this company"}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          filter: [
            urgency === "closed" ? "grayscale(0.45)" : "",
            hovered
              ? dark
                ? "drop-shadow(0 22px 34px rgba(0,0,0,0.55))"
                : "drop-shadow(0 18px 30px rgba(16,26,48,0.18))"
              : dark
                ? "drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                : "drop-shadow(0 2px 8px rgba(16,26,48,0.07))",
          ].filter(Boolean).join(" "),
          transition: "transform 0.25s ease, filter 0.25s ease",
        }}
      >
        {/* ── STUB ── */}
        <div style={{
          background: INK,
          borderRadius: "16px 16px 0 0",
          overflow: "hidden",
          position: "relative",
          padding: "20px 18px 18px",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: accent }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
              fontSize: 20, fontWeight: 800, color: "#fff",
              flexShrink: 0,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
            }}>
              {(drive.companyName || "?").charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
                fontSize: 21, fontWeight: 700, color: "#fff",
                textTransform: "uppercase", letterSpacing: "0.3px",
                lineHeight: 1.05,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {drive.companyName}
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11.5, color: "rgba(255,255,255,0.65)",
                marginTop: 4, letterSpacing: "0.2px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {drive.jobRole}
              </div>
            </div>

            {drive.status === "ACTIVE" && (
              <span style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 99, padding: "3px 9px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10.5, fontWeight: 700, color: "#fff",
                letterSpacing: "0.5px", flexShrink: 0,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#4ade80", boxShadow: "0 0 6px #4ade80",
                }} />
                LIVE
              </span>
            )}
          </div>

          {onToggleFav && (
            <button
              type="button"
              title={isFav ? "Remove from saved" : "Save this ticket"}
              aria-pressed={isFav}
              onClick={(e) => { e.stopPropagation(); onToggleFav(drive.id); }}
              onKeyDown={(e) => e.stopPropagation()}
              style={{
                position: "absolute", bottom: 14, right: 16,
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
                background: isFav ? accent : "rgba(255,255,255,0.1)",
                border: isFav ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                transition: "background 0.18s, transform 0.15s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24"
                fill={isFav ? "currentColor" : "none"} stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* ── PERFORATION ── */}
        <div style={{ position: "relative", height: 14, background: INK }}>
          <div style={{
            position: "absolute", left: 16, right: 16, top: "50%",
            borderTop: "2px dashed rgba(255,255,255,0.18)",
          }} />
          <div style={{
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            width: 7, height: 7, borderRadius: "50%", background: pageBg,
          }} />
          <div style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            width: 7, height: 7, borderRadius: "50%", background: pageBg,
          }} />
        </div>

        {/* ── BODY ── */}
        <div style={{
          background: dark ? "#161f33" : "#fbfcfe",
          borderRadius: "0 0 16px 16px",
          padding: "16px 18px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          {stamp && (
            <div style={{
              position: "absolute", top: 12, right: -6,
              transform: "rotate(8deg)",
              border: `1.5px solid ${stamp.ink}`,
              color: stamp.ink,
              borderRadius: 6,
              padding: "3px 10px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10.5, fontWeight: 700,
              letterSpacing: "1px",
              opacity: 0.9,
            }}>
              {stamp.text}
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))",
            gap: "12px 10px",
            marginBottom: 14,
            paddingRight: stamp ? 70 : 0,
          }}>
            {drive.location && (
              <Field dark={dark} label="LOCATION" value={drive.location} />
            )}
            {drive.jobType && (
              <Field dark={dark} label="ROLE TYPE" value={drive.jobType} />
            )}
            {drive.ctcDisplay && (
              <Field dark={dark} label="PACKAGE" value={`₹${drive.ctcDisplay}`} color={accent} />
            )}
            {drive.minCgpa && (
              <Field dark={dark} label="MIN. CGPA" value={`★ ${drive.minCgpa}+`} />
            )}
            {drive.deadline && (
              <Field
                dark={dark}
                label="DEADLINE"
                value={
                  urgency === "urgent" || urgency === "soon"
                    ? (daysLeft === 0 ? "Today" : `${daysLeft}d left`)
                    : new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                }
                color={urgency === "urgent" || urgency === "soon" ? stamp.ink : undefined}
              />
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 12,
            borderTop: `1px solid ${dark ? "#2a3550" : "#e7ebf2"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 14, flexShrink: 0 }}>
                {bars.map((w, i) => (
                  <span key={i} style={{
                    width: w, height: i % 5 === 0 ? 14 : 9,
                    background: dark ? "#3a4666" : "#cbd3e1",
                    display: "inline-block",
                  }} />
                ))}
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10.5, fontWeight: 600,
                color: dark ? "#7c8aa8" : "#8993ab",
                letterSpacing: "0.3px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {CATEGORY_LABELS[drive.category] || drive.category || "—"}
              </span>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12, fontWeight: 700, color: accent,
              letterSpacing: "0.2px", paddingLeft: 10,
              transform: hovered ? "translateX(2px)" : "translateX(0)",
              transition: "transform 0.18s ease",
            }}>
              View role
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ dark, label, value, color }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9.5, fontWeight: 700,
        letterSpacing: "0.6px",
        color: dark ? "#7c8aa8" : "#8993ab",
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700,
        color: color || (dark ? "#e7ecf5" : "#19223a"),
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </div>
    </div>
  );
}

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.pp-ticket:focus-visible {
  outline: 2.5px solid #1C7ED6;
  outline-offset: 3px;
  border-radius: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .pp-ticket, .pp-ticket * {
    transition: none !important;
    animation: none !important;
  }
}
`;