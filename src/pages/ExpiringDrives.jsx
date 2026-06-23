// src/pages/ExpiringDrives.jsx
//
// "Placement OS" redesign — speaks the same visual language as DriveCard.
// Clean list widget: compact rows with accent left-rail, urgency badge,
// smooth auto-slide with a linear progress bar.

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
  barcodeBars,
} from "../utils/ticketTheme";

const SLIDE_INTERVAL = 5000;

// ── Single expiring drive row ────────────────────────────────────────────────
function ExpItem({ drive, daysLeft, dark }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);

  const accent     = getAccent(drive.companyName);
  const urgency    = daysLeft <= 2 ? "urgent" : "soon";
  const statusInk  = STATUS_INK[urgency];
  const tintBg     = dark ? STATUS_TINT[urgency].dark_bg     : STATUS_TINT[urgency].bg;
  const tintBorder = dark ? STATUS_TINT[urgency].dark_border : STATUS_TINT[urgency].border;

  const paper    = dark ? PAPER.dark      : PAPER.light;
  const text     = dark ? PAPER_TEXT.dark : PAPER_TEXT.light;
  const muted    = dark ? MUTED.dark      : MUTED.light;
  const hairline = dark ? HAIRLINE.dark   : HAIRLINE.light;

  const bars = barcodeBars(String(drive.id ?? drive.companyName ?? "x"), 12);

  return (
    <div
      role="button"
      tabIndex={0}
      className="exp-item"
      onClick={() => navigate(`/drives/${drive.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/drives/${drive.id}`);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: paper,
        border: `1px solid ${hovered ? accent + "55" : hairline}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        padding: "11px 14px 11px 12px",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: "border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
        transform: hovered ? "translateX(2px)" : "translateX(0)",
        boxShadow: hovered
          ? `0 4px 14px ${accent}22, 0 1px 3px rgba(0,0,0,0.06)`
          : dark
            ? "0 1px 3px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(15,23,42,0.05)",
      }}
    >
      {/* Glow rail on hover */}
      {hovered && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 3,
            background: accent,
            boxShadow: `0 0 10px 1px ${accent}55`,
            borderRadius: "3px 0 0 3px",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        {/* Company + role */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 700,
            color: text,
            letterSpacing: "-0.1px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {drive.companyName}
          </div>
          <div style={{
            fontSize: 11.5, fontWeight: 500,
            color: muted,
            marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {drive.jobRole}
          </div>
        </div>

        {/* Urgency badge */}
        <span style={{
          flexShrink: 0,
          fontSize: 10.5, fontWeight: 700,
          color: statusInk,
          background: tintBg,
          border: `1px solid ${tintBorder}`,
          borderRadius: 99, padding: "3px 9px",
          letterSpacing: "0.3px",
        }}>
          {daysLeft === 0 ? "TODAY" : `${daysLeft}D LEFT`}
        </span>
      </div>

      {/* Barcode + category */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 1.2, height: 9, flexShrink: 0 }}>
          {bars.map((w, i) => (
            <span key={i} style={{
              width: w,
              height: i % 4 === 0 ? 9 : 5,
              background: dark ? "#2A3550" : "#CBD5E1",
              display: "inline-block",
              borderRadius: 1,
            }} />
          ))}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: muted,
          letterSpacing: "0.35px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {CATEGORY_LABELS[drive.category] || drive.category || "—"}
        </span>

        {/* Deadline on the right */}
        {drive.deadline && (
          <span style={{
            marginLeft: "auto",
            fontSize: 10.5, fontWeight: 600,
            color: statusInk,
            flexShrink: 0,
          }}>
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
            const dl  = new Date(d.deadline);
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

  const muted = dark ? MUTED.dark : MUTED.light;

  if (drives.length === 0) {
    return (
      <p style={{
        fontSize: 12.5, fontWeight: 500,
        color: muted,
        textAlign: "center",
        padding: "12px 4px",
        lineHeight: 1.6,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}>
        No drives closing this week.
      </p>
    );
  }

  const drive    = drives[current];
  const { daysLeft } = getUrgency(drive.deadline);
  const accent   = getAccent(drive.companyName);
  const hairline = dark ? HAIRLINE.dark : HAIRLINE.light;

  return (
    <>
      <style>{STYLE_BLOCK}</style>
      <div
        className="exp-wrap"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <ExpItem key={drive.id} drive={drive} daysLeft={daysLeft} dark={dark} />

        {/* Progress bar */}
        {!paused && (
          <div style={{
            height: 2,
            background: dark ? "#1E2D45" : "#E2E8F0",
            borderRadius: 99,
            overflow: "hidden",
          }}>
            <div
              key={`${current}-${paused}`}
              className="exp-progress"
              style={{
                height: "100%",
                borderRadius: 99,
                width: "0%",
                background: accent,
                animation: `expProgress ${SLIDE_INTERVAL}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Dots + counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {drives.map((d, i) => {
              const a = getAccent(d.companyName);
              return (
                <button
                  key={i}
                  className="exp-dot"
                  onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
                  aria-label={`Go to ${d.companyName}`}
                  style={{
                    width: i === current ? 18 : 6,
                    height: 6,
                    borderRadius: 99,
                    background: i === current ? a : (dark ? "#2A3550" : "#CBD5E1"),
                    border: 0, padding: 0, cursor: "pointer",
                    transition: "background 0.2s ease, width 0.2s ease",
                  }}
                />
              );
            })}
          </div>
          <span style={{
            fontFamily: "'Inter', monospace",
            fontSize: 11, fontWeight: 600,
            color: muted,
            fontVariantNumeric: "tabular-nums",
          }}>
            {current + 1} / {drives.length}
          </span>
        </div>
      </div>
    </>
  );
}

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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