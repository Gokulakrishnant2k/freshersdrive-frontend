// src/components/DriveCard.jsx
//
// "Placement OS" redesign — professional enterprise card.
// Signature element: glowing left-rail accent that brightens on hover.
// Inter-only type stack, weight-driven hierarchy.
// Dark mode first-class, reduced-motion respected.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  INK,
  PAGE_BG,
  PAPER,
  PAPER_TEXT,
  MUTED,
  HAIRLINE,
  CATEGORY_LABELS,
  STATUS_INK,
  STATUS_TINT,
  SHADOW,
  getAccent,
  getUrgency,
  barcodeBars,
} from "../utils/ticketTheme";

export default function DriveCard({ drive, dark, favorites = new Set(), onToggleFav }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const accent = getAccent(drive.companyName);
  const isFav  = favorites.has(drive.id);
  const { daysLeft, level: urgency } = getUrgency(drive.deadline);

  const paper    = dark ? PAPER.dark      : PAPER.light;
  const text     = dark ? PAPER_TEXT.dark : PAPER_TEXT.light;
  const muted    = dark ? MUTED.dark      : MUTED.light;
  const hairline = dark ? HAIRLINE.dark   : HAIRLINE.light;
  const shadow   = hovered
    ? (dark ? SHADOW.hover.dark  : SHADOW.hover.light)
    : (dark ? SHADOW.rest.dark   : SHADOW.rest.light);

  // Urgency badge
  const urgencyLabel =
    urgency === "urgent" ? (daysLeft === 0 ? "Today" : `${daysLeft}d left`) :
    urgency === "soon"   ? `${daysLeft}d left` :
    urgency === "closed" ? "Closed" : null;

  const urgencyInk = urgency ? STATUS_INK[urgency] : null;
  const urgencyTint = urgency
    ? (dark ? STATUS_TINT[urgency].dark_bg : STATUS_TINT[urgency].bg)
    : null;
  const urgencyBorder = urgency
    ? (dark ? STATUS_TINT[urgency].dark_border : STATUS_TINT[urgency].border)
    : null;

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

  // Initial letter avatar bg — semi-transparent tinted version of accent
  const avatarBg = accent + (dark ? "2A" : "18");

  return (
    <>
      <style>{STYLE_BLOCK}</style>

      <div
        className="dc-card"
        role="button"
        tabIndex={0}
        aria-label={`View ${drive.jobRole ?? "role"} at ${drive.companyName ?? "this company"}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          background: paper,
          borderRadius: 14,
          border: `1px solid ${hovered ? accent + "55" : hairline}`,
          boxShadow: shadow,
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          overflow: "hidden",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          filter: urgency === "closed" ? "grayscale(0.3)" : "none",
          // Left rail — the signature glow element
          borderLeft: `3px solid ${accent}`,
        }}
      >
        {/* ── Accent glow rail (behind-card, bleeds through border) ── */}
        {hovered && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: 3,
              background: accent,
              boxShadow: `0 0 12px 2px ${accent}66`,
              borderRadius: "3px 0 0 3px",
              pointerEvents: "none",
            }}
          />
        )}

        {/* ── HEADER ── */}
        <div style={{
          padding: "16px 18px 14px",
          borderBottom: `1px solid ${hairline}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44,
            borderRadius: 10,
            background: avatarBg,
            border: `1.5px solid ${accent}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: accent,
            flexShrink: 0,
            letterSpacing: "-0.5px",
          }}>
            {(drive.companyName || "?").charAt(0).toUpperCase()}
          </div>

          {/* Company + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15.5, fontWeight: 700,
              color: text,
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {drive.companyName}
            </div>
            <div style={{
              fontSize: 12.5, fontWeight: 500,
              color: muted,
              marginTop: 3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {drive.jobRole}
            </div>
          </div>

          {/* Status pill */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
            {drive.status === "ACTIVE" && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 10.5, fontWeight: 700,
                color: "#10B981",
                background: dark ? "#052E16" : "#ECFDF5",
                border: `1px solid ${dark ? "#14532D" : "#A7F3D0"}`,
                borderRadius: 99, padding: "3px 9px",
                letterSpacing: "0.4px",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 0 2px #10B98133",
                }} />
                LIVE
              </span>
            )}
            {urgencyLabel && (
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                color: urgencyInk,
                background: urgencyTint,
                border: `1px solid ${urgencyBorder}`,
                borderRadius: 99, padding: "3px 9px",
                letterSpacing: "0.3px",
              }}>
                {urgencyLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── BODY — data fields ── */}
        <div style={{ padding: "14px 18px 12px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: "10px 12px",
          }}>
            {drive.location && (
              <Field label="Location" value={drive.location} text={text} muted={muted} />
            )}
            {drive.jobType && (
              <Field label="Type" value={drive.jobType} text={text} muted={muted} />
            )}
            {drive.ctcDisplay && (
              <Field label="Package" value={`₹ ${drive.ctcDisplay}`} text={accent} muted={muted} bold />
            )}
            {drive.minCgpa && (
              <Field label="Min CGPA" value={`${drive.minCgpa}+`} text={text} muted={muted} />
            )}
            {drive.deadline && (
              <Field
                label="Deadline"
                value={
                  daysLeft !== null && daysLeft <= 7 && daysLeft > 0
                    ? `${new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${daysLeft}d`
                    : new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                }
                text={urgencyInk || text}
                muted={muted}
              />
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: "10px 18px 13px",
          borderTop: `1px solid ${hairline}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}>
          {/* Barcode + category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 14, flexShrink: 0 }}>
              {bars.map((w, i) => (
                <span key={i} style={{
                  width: w,
                  height: i % 5 === 0 ? 14 : 8,
                  background: dark ? "#2A3550" : "#CBD5E1",
                  display: "inline-block",
                  borderRadius: 1,
                }} />
              ))}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: muted,
              letterSpacing: "0.3px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {CATEGORY_LABELS[drive.category] || drive.category || "—"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Favourite */}
            {onToggleFav && (
              <button
                type="button"
                title={isFav ? "Remove from saved" : "Save"}
                aria-pressed={isFav}
                onClick={(e) => { e.stopPropagation(); onToggleFav(drive.id); }}
                onKeyDown={(e) => e.stopPropagation()}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                  background: isFav ? accent + "18" : "transparent",
                  border: `1px solid ${isFav ? accent + "55" : hairline}`,
                  color: isFav ? accent : muted,
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={isFav ? "currentColor" : "none"} stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}

            {/* CTA */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600,
              color: accent,
              transition: "gap 0.15s ease",
            }}>
              View role
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transform: hovered ? "translateX(2px)" : "translateX(0)",
                  transition: "transform 0.15s ease",
                }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Field sub-component ──────────────────────────────────────────────────────
function Field({ label, value, text, muted, bold }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: "0.55px",
        textTransform: "uppercase",
        color: muted,
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: bold ? 700 : 600,
        color: text,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.dc-card:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
  border-radius: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-card * {
    transition: none !important;
    animation: none !important;
  }
}
`;