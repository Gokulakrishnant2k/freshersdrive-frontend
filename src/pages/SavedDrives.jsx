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

  const [drives,  setDrives]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/drives")
      .then((res) => { setDrives(res.data); setLoading(false); })
      .catch(()   => setLoading(false));
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Saved Drives
        </div>

        <button style={t.darkBtn} onClick={() => setDark(!dark)} title="Toggle theme">
          {dark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1"  x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1"  y1="12" x2="3"  y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64"  y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
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
            {savedDrives.length} saved
          </span>
        </div>

        {loading && <div style={s.state}>Loading your saved drives…</div>}

        {!loading && savedDrives.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>♡</div>
            <div style={t.emptyTitle}>No saved drives yet</div>
            <div style={t.emptySub}>Tap the heart on any drive card to save it here for quick access later.</div>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>
              Browse drives
            </button>
          </div>
        )}

        {savedDrives.length > 0 && (
          <div style={s.grid}>
            {savedDrives.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                dark={dark}
                favorites={favorites}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        )}
      </main>
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  darkBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", padding: "6px 8px", cursor: "pointer",
    color: "#64748b", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
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
    background: "#f1f5f9", padding: "4px 12px",
    borderRadius: "99px", border: "1px solid #e2e8f0",
    fontWeight: "500", whiteSpace: "nowrap", alignSelf: "center",
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

  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", padding: "70px 20px",
  },
  emptyIcon: {
    fontSize: "34px", color: "#ef4444", marginBottom: "10px",
  },
  emptyBtn: {
    marginTop: "18px", padding: "9px 20px",
    fontSize: "13px", fontWeight: "600",
    background: "#1d4ed8", color: "white",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontFamily: "inherit",
  },
};

s.backBtn = {
  display: "flex", alignItems: "center", gap: "6px",
  background: "transparent", border: "1px solid #e2e8f0",
  borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
  fontSize: "13px", fontWeight: "600", color: "#374151",
  fontFamily: "inherit",
};
s.brand = {
  display: "flex", alignItems: "center", gap: "8px",
  fontSize: "15px", fontWeight: "700",
  letterSpacing: "-0.4px", color: "#0f172a", whiteSpace: "nowrap",
};
s.emptyTitle = { fontSize: "16px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" };
s.emptySub   = { fontSize: "13px", color: "#94a3b8", marginTop: "6px", maxWidth: "360px", lineHeight: "1.5" };

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:       { ...s.page,       background: "#0f172a" },
  topbar:     { ...s.topbar,     background: "#1e293b", borderBottom: "1px solid #334155", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" },
  darkBtn:    { ...s.darkBtn,    borderColor: "#334155", color: "#94a3b8" },
  backBtn:    { ...s.backBtn,    borderColor: "#334155", color: "#94a3b8" },
  brand:      { ...s.brand,      color: "#f1f5f9" },
  feedTitle:  { ...s.feedTitle,  color: "#f1f5f9" },
  feedSub:    { ...s.feedSub,    color: "#64748b" },
  countBadge: { ...s.countBadge, background: "#1e293b", borderColor: "#334155", color: "#94a3b8" },
  emptyTitle: { ...s.emptyTitle, color: "#f1f5f9" },
  emptySub:   { ...s.emptySub,   color: "#64748b" },
};