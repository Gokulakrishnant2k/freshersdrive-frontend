import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";
import DriveCard from "../components/DriveCard";
import useFavorites from "../../UseFavorites";

export default function SavedDrives() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const { favoriteIds, favorites, toggleFav } = useFavorites();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/drives")
      .then((res) => { setDrives(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Most recently saved drive first.
  const savedDrives = useMemo(() => {
    const byId = new Map(drives.map((d) => [d.id, d]));
    return [...favoriteIds].reverse().map((id) => byId.get(id)).filter(Boolean);
  }, [drives, favoriteIds]);

  const t = dark ? dm : s;

  return (
    <div style={t.page}>

      {/* ── TOP BAR ── */}
      <header style={t.topbar}>
        <button style={t.backBtn} onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div style={t.brand}>
          <div style={s.brandMark}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 14s-5.2-3.2-6.8-6.4C-0.2 4.6 1.6 1.6 4.6 1.4 6 1.3 7.2 2 8 3.2 8.8 2 10 1.3 11.4 1.4c3 0.2 4.8 3.2 3.4 6.2C13.2 10.8 8 14 8 14z"
                fill="url(#heartGrad)" />
              <defs>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="16" y2="16">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          Saved Drives
        </div>

        <button style={t.darkBtn} onClick={() => setDark(!dark)} title="Toggle theme">
          {dark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {/* ── BODY ── */}
      <main style={s.main}>
        <div style={s.feedHeader}>
          <div>
            <div style={t.feedTitle}>Your saved drives</div>
            <div style={t.feedSub}>Most recently saved first</div>
          </div>
          <span style={t.countBadge}>
            <span style={s.countNumber}>{savedDrives.length}</span> saved
          </span>
        </div>

        {loading && <div style={s.state}>Loading your saved drives…</div>}

        {!loading && savedDrives.length === 0 && (
          <div style={t.emptyState}>
            <div style={s.emptyIconWrap}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "#a5b4fc" }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div style={t.emptyTitle}>No saved drives yet</div>
            <div style={t.emptySub}>Tap the heart on any drive card to save it here for quick access later.</div>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>
              Browse drives
            </button>
          </div>
        )}

        {savedDrives.length > 0 && (
          <div style={s.grid}>
            {savedDrives.map((drive, i) => (
              <div
                key={drive.id}
                style={{
                  animation: `savedFadeIn 0.4s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 8) * 0.05}s both`,
                }}
              >
                <DriveCard
                  drive={drive}
                  dark={dark}
                  favorites={favorites}
                  onToggleFav={toggleFav}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes savedFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── LIGHT ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
  },
  topbar: {
    position: "sticky", top: 0, zIndex: 50,
    background: "white",
    borderBottom: "1px solid #f1f5f9",
    padding: "11px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  },
  darkBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "10px", padding: "6px 8px", cursor: "pointer",
    color: "#64748b", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
    transition: "border-color 0.15s, color 0.15s",
  },
  brandMark: {
    width: 24, height: 24, borderRadius: 7,
    background: "rgba(99,102,241,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },

  main: {
    maxWidth: "1300px", margin: "0 auto",
    padding: "24px",
  },
  feedHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: "18px",
  },
  feedTitle: {
    fontSize: "18px", fontWeight: "700",
    letterSpacing: "-0.5px", color: "#0f172a", lineHeight: "1.2",
  },
  feedSub: {
    fontSize: "12.5px", color: "#94a3b8",
    marginTop: "3px", letterSpacing: "-0.1px",
  },
  countBadge: {
    fontSize: "12px", color: "#64748b",
    background: "#eef2ff", padding: "5px 14px",
    borderRadius: "999px", border: "1px solid #e0e7ff",
    fontWeight: "500", whiteSpace: "nowrap", alignSelf: "center",
  },
  countNumber: {
    fontWeight: "700", color: "#4f46e5", letterSpacing: "-0.2px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "14px",
  },
  state: {
    padding: "60px 20px", textAlign: "center",
    color: "#94a3b8", fontSize: "14px", letterSpacing: "-0.1px",
  },

  emptyIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(244,114,182,0.1))",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "14px",
  },
  emptyBtn: {
    marginTop: "18px", padding: "10px 22px",
    fontSize: "13px", fontWeight: "600",
    background: "#6366f1", color: "white",
    border: "none", borderRadius: "10px", cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 8px 20px rgba(99,102,241,0.25)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
};

s.backBtn = {
  display: "flex", alignItems: "center", gap: "6px",
  background: "transparent", border: "1px solid #e2e8f0",
  borderRadius: "10px", padding: "6px 12px", cursor: "pointer",
  fontSize: "13px", fontWeight: "600", color: "#374151",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};
s.brand = {
  display: "flex", alignItems: "center", gap: "8px",
  fontSize: "15px", fontWeight: "700",
  letterSpacing: "-0.4px", color: "#0f172a", whiteSpace: "nowrap",
};
s.emptyState = {
  display: "flex", flexDirection: "column", alignItems: "center",
  textAlign: "center", padding: "70px 20px",
  background: "white", borderRadius: "20px",
  border: "1px solid #f1f5f9",
};
s.emptyTitle = { fontSize: "16px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" };
s.emptySub = { fontSize: "13px", color: "#94a3b8", marginTop: "6px", maxWidth: "360px", lineHeight: "1.5" };

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page: { ...s.page, background: "#0c0b2b" },
  topbar: { ...s.topbar, background: "rgba(255,255,255,0.03)", borderBottom: "0.5px solid rgba(255,255,255,0.08)", boxShadow: "none" },
  darkBtn: { ...s.darkBtn, borderColor: "rgba(255,255,255,0.14)", color: "#94a3b8" },
  backBtn: { ...s.backBtn, borderColor: "rgba(255,255,255,0.14)", color: "#cbd5e1" },
  brand: { ...s.brand, color: "#f1f5f9" },
  brandMark: { ...s.brandMark, background: "rgba(129,140,248,0.15)" },
  feedTitle: { ...s.feedTitle, color: "#f1f5f9" },
  feedSub: { ...s.feedSub, color: "#64748b" },
  countBadge: { ...s.countBadge, background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)", color: "#a5b4fc" },
  emptyState: { ...s.emptyState, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" },
  emptyTitle: { ...s.emptyTitle, color: "#f1f5f9" },
  emptySub: { ...s.emptySub, color: "#64748b" },
};