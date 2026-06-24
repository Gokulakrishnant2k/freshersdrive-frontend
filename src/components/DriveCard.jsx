// src/components/DriveCard.jsx
//
// Redesigned — professional, information-dense, zero decorative noise.
// Inspired by Linear / Vercel dashboard aesthetics: tight type, restrained
// palette, every pixel earns its place.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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

  const urgencyLabel =
    urgency === "urgent" ? (daysLeft === 0 ? "Today" : `${daysLeft}d left`) :
    urgency === "soon"   ? `${daysLeft}d left` :
    urgency === "closed" ? "Closed" : null;

  const urgencyInk    = urgency ? STATUS_INK[urgency] : null;
  const urgencyTintBg = urgency ? (dark ? STATUS_TINT[urgency].dark_bg     : STATUS_TINT[urgency].bg)     : null;
  const urgencyBorder = urgency ? (dark ? STATUS_TINT[urgency].dark_border : STATUS_TINT[urgency].border) : null;

  const handleCardClick = () => {
    const token  = localStorage.getItem("token");
    const target = `/drives/${drive.id}`;
    if (!token) { sessionStorage.setItem("postLoginRedirect", target); navigate("/login"); return; }
    navigate(target);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(); }
  };

  // Avatar: single letter on a very soft tint of the accent
  const avatarBg  = dark ? accent + "22" : accent + "14";
  const isActive  = drive.status === "ACTIVE";
  const isClosed  = urgency === "closed";

  const deadlineDisplay = drive.deadline
    ? (() => {
        const formatted = new Date(drive.deadline).toLocaleDateString("en-IN", {
          day: "numeric", month: "short",
        });
        if (daysLeft !== null && daysLeft > 0 && daysLeft <= 7) return `${formatted} · ${daysLeft}d`;
        return new Date(drive.deadline).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "2-digit",
        });
      })()
    : null;

  return (
    <>
      <style>{STYLE_BLOCK}</style>
      <div
        className="dc-card"
        role="button"
        tabIndex={0}
        aria-label={`${drive.jobRole ?? "Role"} at ${drive.companyName ?? "company"}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          background: paper,
          borderRadius: 12,
          border: `0.5px solid ${hovered ? (dark ? "#334155" : "#CBD5E1") : hairline}`,
          boxShadow: shadow,
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          overflow: "hidden",
          transition: "box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          opacity: isClosed ? 0.6 : 1,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: "15px 18px 13px",
          borderBottom: `0.5px solid ${hairline}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}>
          {/* Avatar + company + role */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: accent,
              flexShrink: 0,
              letterSpacing: "-0.2px",
            }}>
              {(drive.companyName || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: text, letterSpacing: "-0.15px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {drive.companyName}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 400,
                color: muted, marginTop: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {drive.jobRole}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            {isActive && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: dark ? "#34D399" : "#047857",
                background: dark ? "#052E16" : "#F0FDF4",
                border: `0.5px solid ${dark ? "#14532D" : "#BBF7D0"}`,
                borderRadius: 4, padding: "2px 7px",
              }}>
                Live
              </span>
            )}
            {urgencyLabel && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: urgencyInk,
                background: urgencyTintBg,
                border: `0.5px solid ${urgencyBorder}`,
                borderRadius: 4, padding: "2px 7px",
              }}>
                {urgencyLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── BODY — data grid ── */}
        <div style={{
          padding: "13px 18px 11px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
          gap: "11px 14px",
        }}>
          {drive.location  && <Field label="Location" value={drive.location}               text={text}        muted={muted} />}
          {drive.jobType   && <Field label="Type"     value={drive.jobType}                text={text}        muted={muted} />}
          {drive.ctcDisplay && <Field label="Package"  value={`₹ ${drive.ctcDisplay}`}     text={accent}      muted={muted} bold />}
          {drive.minCgpa   && <Field label="Min CGPA" value={`${drive.minCgpa}+`}          text={text}        muted={muted} />}
          {deadlineDisplay  && (
            <Field
              label="Deadline"
              value={deadlineDisplay}
              text={urgencyInk || text}
              muted={muted}
            />
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: "9px 18px 12px",
          borderTop: `0.5px solid ${hairline}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Category pill */}
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: muted,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: "50%",
              background: dark ? "#2A3550" : "#CBD5E1",
              display: "inline-block",
            }} />
            {CATEGORY_LABELS[drive.category] || drive.category || "—"}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Favourite */}
            {onToggleFav && (
              <button
                type="button"
                title={isFav ? "Remove from saved" : "Save"}
                aria-pressed={isFav}
                onClick={(e) => { e.stopPropagation(); onToggleFav(drive.id); }}
                onKeyDown={(e) => e.stopPropagation()}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                  background: isFav ? (dark ? "#1E1B4B" : "#EEF2FF") : "transparent",
                  border: `0.5px solid ${isFav ? (dark ? "#3730A3" : "#C7D2FE") : hairline}`,
                  color: isFav ? "#4F46E5" : muted,
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24"
                  fill={isFav ? "currentColor" : "none"} stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}

            {/* CTA */}
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: hovered ? (dark ? "#818CF8" : "#3730A3") : (dark ? "#6366F1" : "#4F46E5"),
              display: "flex", alignItems: "center", gap: 4,
              transition: "color 0.15s",
            }}>
              View role
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
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

function Field({ label, value, text, muted, bold }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 500,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        color: muted,
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: bold ? 600 : 500,
        color: text,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </div>
    </div>
  );
}

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.dc-card:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
  border-radius: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-card * {
    transition: none !important;
    animation: none !important;
  }
}
`;