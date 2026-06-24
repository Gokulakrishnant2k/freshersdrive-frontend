// src/pages/ExpiringDrives.jsx
//
// Redesigned to match the professional DriveCard aesthetic.
// Compact rows, semantic urgency, smooth auto-slide, no decorative noise.

import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  PAPER,
  PAPER_TEXT,
  MUTED,
  HAIRLINE,
  STATUS_INK,
  STATUS_TINT,
  CATEGORY_LABELS,
  getAccent,
  getUrgency,
} from "../utils/ticketTheme";

const SLIDE_INTERVAL = 5000;

// ── Single expiring drive row ────────────────────────────────────────────────
function ExpItem({ drive, daysLeft, dark }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);

  const accent  = getAccent(drive.companyName);
  const urgency = daysLeft <= 2 ? "urgent" : "soon";

  const statusInk  = STATUS_INK[urgency];
  const tintBg     = dark ? STATUS_TINT[urgency].dark_bg     : STATUS_TINT[urgency].bg;
  const tintBorder = dark ? STATUS_TINT[urgency].dark_border : STATUS_TINT[urgency].border;

  const paper    = dark ? PAPER.dark      : PAPER.light;
  const text     = dark ? PAPER_TEXT.dark : PAPER_TEXT.light;
  const muted    = dark ? MUTED.dark      : MUTED.light;
  const hairline = dark ? HAIRLINE.dark   : HAIRLINE.light;

  return (
    <div
      role="button"
      tabIndex={0}
      className="exp-item"
      onClick={() => navigate(`/drives/${drive.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/drives/${drive.id}`); }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: paper,
        border: `0.5px solid ${hovered ? (dark ? "#334155" : "#CBD5E1") : hairline}`,
        borderRadius: 10,
        padding: "11px 14px",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered
          ? (dark ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 12px rgba(15,23,42,0.08)")
          : (dark ? "0 1px 3px rgba(0,0,0,0.3)"  : "0 1px 2px rgba(15,23,42,0.04)"),
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        {/* Avatar + company + role */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: dark ? accent + "22" : accent + "14",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: accent,
          }}>
            {(drive.companyName || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {drive.companyName}
            </div>
            <div style={{
              fontSize: 11.5, fontWeight: 400, color: muted, marginTop: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {drive.jobRole}
            </div>
          </div>
        </div>

        {/* Urgency badge */}
        <span style={{
          flexShrink: 0,
          fontSize: 11, fontWeight: 500,
          color: statusInk,
          background: tintBg,
          border: `0.5px solid ${tintBorder}`,
          borderRadius: 4, padding: "2px 7px",
        }}>
          {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
        </span>
      </div>

      {/* Category + deadline */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 500, color: muted,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{
            width: 4, height: 4, borderRadius: "50%",
            background: dark ? "#2A3550" : "#CBD5E1",
            display: "inline-block",
          }} />
          {CATEGORY_LABELS[drive.category] || drive.category || "—"}
        </span>
        {drive.deadline && (
          <span style={{ fontSize: 11, fontWeight: 500, color: statusInk }}>
            {new Date(drive.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main widget ──────────────────────────────────────────────────────────────
export default function ExpiringDrives() {
  const { dark } = useTheme();
  const [drives,  setDrives]  = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    axios.get("/drives")
      .then((res) => {
        const now = new Date();
        const expiring = (res.data || [])
          .filter((d) => {
            if (!d.deadline) return false;
            const dl   = new Date(d.deadline);
            if (isNaN(dl.getTime())) return false;
            const diff = (dl - now) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 7;
          })
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setDrives(expiring);
      })
      .catch((err) => console.error("ExpiringDrives:", err));
  }, []);

  useEffect(() => {
    if (drives.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % drives.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [drives.length, paused]);

  const muted    = dark ? MUTED.dark    : MUTED.light;
  const hairline = dark ? HAIRLINE.dark : HAIRLINE.light;

  if (drives.length === 0) {
    return (
      <p style={{
        fontSize: 12.5, fontWeight: 400, color: muted,
        textAlign: "center", padding: "12px 4px", lineHeight: 1.6,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}>
        No drives closing this week.
      </p>
    );
  }

  const drive   = drives[current];
  const { daysLeft } = getUrgency(drive.deadline);
  const accent  = getAccent(drive.companyName);

  return (
    <>
      <style>{STYLE_BLOCK}</style>
      <div
        className="exp-wrap"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <ExpItem key={drive.id} drive={drive} daysLeft={daysLeft} dark={dark} />

        {/* Progress bar */}
        {!paused && drives.length > 1 && (
          <div style={{
            height: 1.5,
            background: hairline,
            borderRadius: 99, overflow: "hidden",
          }}>
            <div
              key={`${current}-${paused}`}
              className="exp-progress"
              style={{
                height: "100%", borderRadius: 99, width: "0%",
                background: accent,
                animation: `expProgress ${SLIDE_INTERVAL}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Dots + counter */}
        {drives.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {drives.map((d, i) => {
                const a = getAccent(d.companyName);
                return (
                  <button
                    key={i}
                    className="exp-dot"
                    onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
                    aria-label={`Go to ${d.companyName}`}
                    style={{
                      width: i === current ? 16 : 5,
                      height: 5, borderRadius: 99,
                      background: i === current ? a : (dark ? "#1E2D45" : "#E2E8F0"),
                      border: 0, padding: 0, cursor: "pointer",
                      transition: "background 0.2s, width 0.2s",
                    }}
                  />
                );
              })}
            </div>
            <span style={{
              fontFamily: "'Inter', monospace",
              fontSize: 11, fontWeight: 500, color: muted,
              fontVariantNumeric: "tabular-nums",
            }}>
              {current + 1} / {drives.length}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

@keyframes expProgress { from { width: 0% } to { width: 100% } }

.exp-dot:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 99px;
}

.exp-item:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .exp-wrap, .exp-wrap * {
    transition: none !important;
    animation: none !important;
  }
}
`;