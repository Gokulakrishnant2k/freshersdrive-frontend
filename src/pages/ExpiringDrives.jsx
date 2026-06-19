import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const SLIDE_INTERVAL = 5000; // 5 seconds

function ExpItem({ drive, daysLeft, dark }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const urgent = daysLeft <= 2;
  const t = dark ? dm : s;

  return (
    <div
      style={{
        ...t.item,
        borderColor: hovered
          ? (dark ? "#475569" : "#cbd5e1")
          : (dark ? "#334155" : "#f1f5f9"),
      }}
      onClick={() => navigate(`/drives/${drive.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.itemTop}>
        <div>
          <div style={t.itemCompany}>{drive.companyName}</div>
          <div style={t.itemRole}>{drive.jobRole}</div>
        </div>
        <span style={urgent ? s.badgeUrgent : s.badgeSoon}>
          {daysLeft === 0 ? "Today" : `${daysLeft}d`}
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

  // Auto-advance slideshow
  useEffect(() => {
    if (drives.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % drives.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [drives.length, paused]);

  if (drives.length === 0) {
    return <p style={s.empty}>No drives expiring this week</p>;
  }

  const drive    = drives[current];
  const daysLeft = Math.ceil(
    (new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const progress = ((SLIDE_INTERVAL - 0) / SLIDE_INTERVAL) * 100; // kept for bar width

  return (
    <div
      style={s.wrapper}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide */}
      <ExpItem key={drive.id} drive={drive} daysLeft={daysLeft} dark={dark} />

      {/* Progress bar */}
      {!paused && (
        <div style={s.progressTrack}>
          <div
            key={`${current}-${paused}`}
            style={s.progressBar}
          />
        </div>
      )}

      {/* Dot indicators + counter */}
      <div style={s.controls}>
        <div style={s.dots}>
          {drives.map((_, i) => (
            <button
              key={i}
              style={{ ...s.dot, ...(i === current ? s.dotActive : {}) }}
              onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span style={dark ? dm.counter : s.counter}>
          {current + 1} / {drives.length}
        </span>
      </div>
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  empty: {
    fontSize: "13px",
    color: "#94a3b8",
    textAlign: "center",
    padding: "8px 0",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  item: {
    padding: "10px 12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#f1f5f9",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#fafafa",
    transition: "border-color 0.15s",
  },
  itemTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "8px",
  },
  itemCompany: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  itemRole: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "1px",
  },
  badgeSoon: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#92400e",
    background: "#fffbeb",
    padding: "2px 8px",
    borderRadius: "99px",
    flexShrink: 0,
  },
  badgeUrgent: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#b91c1c",
    background: "#fef2f2",
    padding: "2px 8px",
    borderRadius: "99px",
    flexShrink: 0,
  },
  progressTrack: {
    height: "3px",
    background: "#e2e8f0",
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "#b45309",
    borderRadius: "99px",
    width: "0%",
    animation: `slideProgress ${SLIDE_INTERVAL}ms linear forwards`,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "99px",
    background: "#cbd5e1",
    borderWidth: 0,
    padding: 0,
    cursor: "pointer",
    transition: "background 0.2s, width 0.2s",
  },
  dotActive: {
    background: "#b45309",
    width: "16px",
  },
  counter: {
    fontSize: "11px",
    color: "#94a3b8",
    fontVariantNumeric: "tabular-nums",
  },
};

// Inject keyframe animation once
if (typeof document !== "undefined" && !document.getElementById("expiry-anim")) {
  const style = document.createElement("style");
  style.id = "expiry-anim";
  style.textContent = `
    @keyframes slideProgress {
      from { width: 0% }
      to   { width: 100% }
    }
  `;
  document.head.appendChild(style);
}

const dm = {
  ...s,
  item:        { ...s.item,        background: "#1e293b" },
  itemCompany: { ...s.itemCompany, color: "#f1f5f9" },
  itemRole:    { ...s.itemRole,    color: "#94a3b8" },
  counter:     { ...s.counter,     color: "#64748b" },
};