// src/pages/ExpiringDrives.jsx
//
// Redesigned to speak the same boarding-pass language as DriveCard:
// a livery-accented stub, monospace data, and a small barcode echo —
// instead of the generic slate/amber card it was before.
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
  CATEGORY_LABELS,
  getAccent,
  barcodeBars,
} from "../utils/ticketTheme";

const SLIDE_INTERVAL = 5000; // 5 seconds

function ExpItem({ drive, daysLeft, dark }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const accent = getAccent(drive.companyName);
  const statusInk = daysLeft <= 2 ? STATUS_INK.urgent : STATUS_INK.soon;
  const bars = barcodeBars(String(drive.id ?? drive.companyName ?? "x"), 14);

  const paper = dark ? PAPER.dark : PAPER.light;
  const text = dark ? PAPER_TEXT.dark : PAPER_TEXT.light;
  const muted = dark ? MUTED.dark : MUTED.light;
  const hairline = dark ? HAIRLINE.dark : HAIRLINE.light;

  return (
    <div
      role="button"
      tabIndex={0}
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
        border: `1px solid ${hovered ? accent + "60" : hairline}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: "10px 12px 10px 11px",
        cursor: "pointer",
        transition: "border-color 0.15s ease, transform 0.15s ease",
        transform: hovered ? "translateX(2px)" : "translateX(0)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
            fontSize: 14.5, fontWeight: 700, letterSpacing: "0.1px",
            color: text, textTransform: "uppercase",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {drive.companyName}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5, color: muted, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {drive.jobRole}
          </div>
        </div>

        <span style={{
          flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10.5, fontWeight: 700,
          color: statusInk,
          background: statusInk + "16",
          border: `1px solid ${statusInk}33`,
          borderRadius: 99, padding: "2px 8px",
          letterSpacing: "0.3px",
        }}>
          {daysLeft === 0 ? "TODAY" : `${daysLeft}D LEFT`}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 1.2, height: 9, flexShrink: 0 }}>
          {bars.map((w, i) => (
            <span key={i} style={{
              width: w, height: i % 4 === 0 ? 9 : 6,
              background: dark ? "#3a4666" : "#cbd3e1",
              display: "inline-block",
            }} />
          ))}
        </div>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5,
          color: muted, letterSpacing: "0.3px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {CATEGORY_LABELS[drive.category] || drive.category || "—"}
        </span>
      </div>
    </div>
  );
}

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
            const dl = new Date(d.deadline);
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

  if (drives.length === 0) {
    return (
      <p style={{
        fontSize: 12.5,
        color: dark ? MUTED.dark : MUTED.light,
        textAlign: "center",
        padding: "10px 4px",
        lineHeight: 1.6,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}>
        Nothing closing this week — the board is clear.
      </p>
    );
  }

  const drive    = drives[current];
  const daysLeft = Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24));
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

        {!paused && (
          <div style={{ height: 3, background: hairline, borderRadius: 99, overflow: "hidden" }}>
            <div
              key={`${current}-${paused}`}
              className="exp-progress-bar"
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {drives.map((d, i) => (
              <button
                key={i}
                className="exp-dot"
                onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 16 : 6, height: 6, borderRadius: 99,
                  background: i === current ? getAccent(d.companyName) : (dark ? "#3a4666" : "#cbd3e1"),
                  border: 0, padding: 0, cursor: "pointer",
                  transition: "background 0.2s ease, width 0.2s ease",
                }}
              />
            ))}
          </div>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5,
            color: dark ? MUTED.dark : MUTED.light, fontVariantNumeric: "tabular-nums",
          }}>
            {current + 1} / {drives.length}
          </span>
        </div>
      </div>
    </>
  );
}

const STYLE_BLOCK = `
@keyframes expProgress { from { width: 0% } to { width: 100% } }
.exp-dot:focus-visible { outline: 2px solid #1C7ED6; outline-offset: 2px; border-radius: 99px; }

@media (prefers-reduced-motion: reduce) {
  .exp-wrap, .exp-wrap * {
    transition: none !important;
    animation: none !important;
  }
}
`;