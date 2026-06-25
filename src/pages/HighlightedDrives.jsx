import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axiosInstance";

// ── Design tokens — mirrors Home.jsx so this page feels like part of the
// same product rather than a bolted-on admin tool ───────────────────────────
const DARK = {
  bg: "#080820", glass: "rgba(255,255,255,0.04)", glassHover: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.09)", glassBorderHover: "rgba(255,255,255,0.18)",
  text: "#f0f0ff", textSecondary: "rgba(240,240,255,0.55)", textMuted: "rgba(240,240,255,0.32)",
  accent: "#6366f1", accentLight: "#818cf8", accentSoft: "rgba(99,102,241,0.15)",
  gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  pink: "#ec4899", pinkTint: "rgba(236,72,153,0.12)",
  divider: "rgba(255,255,255,0.07)", inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(255,255,255,0.12)",
  success: "#10b981", successTint: "rgba(16,185,129,0.12)",
};
const LIGHT = {
  bg: "#f4f3fa", glass: "#ffffff", glassHover: "#f8f7ff",
  glassBorder: "rgba(99,102,241,0.10)", glassBorderHover: "rgba(99,102,241,0.25)",
  text: "#1a1740", textSecondary: "rgba(26,23,64,0.55)", textMuted: "rgba(26,23,64,0.38)",
  accent: "#6366f1", accentLight: "#6366f1", accentSoft: "rgba(99,102,241,0.08)",
  gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  pink: "#db2777", pinkTint: "rgba(219,39,119,0.08)",
  divider: "rgba(99,102,241,0.08)", inputBg: "#f8f7fc", inputBorder: "rgba(99,102,241,0.10)",
  success: "#059669", successTint: "rgba(5,150,105,0.08)",
};

const STYLE_BLOCK = `
  @keyframes mhd-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .mhd-row { animation: mhd-fade 0.25s ease both; transition: background 0.15s ease, border-color 0.15s ease; }
  .mhd-star-btn { transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
  .mhd-star-btn:hover { transform: scale(1.08); }
  .mhd-star-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .mhd-focus:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; border-radius: 8px; }
  .mhd-back:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { .mhd-row { animation: none !important; } }
`;

function StatusPill({ children, tone, tk }) {
  const tones = {
    accent: { bg: tk.accentSoft, color: tk.accentLight, border: `${tk.accent}30` },
    success: { bg: tk.successTint, color: tk.success, border: `${tk.success}30` },
    pink: { bg: tk.pinkTint, color: tk.pink, border: `${tk.pink}30` },
  };
  const c = tones[tone] || tones.accent;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function DriveRow({ drive, dark, tk, onToggle, busy }) {
  const isHighlighted = !!drive.isHighlighted;
  return (
    <div className="mhd-row" style={{
      display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
      borderRadius: 14, border: `1px solid ${isHighlighted ? tk.accent + "40" : tk.glassBorder}`,
      background: isHighlighted ? tk.accentSoft : tk.glass, marginBottom: 8,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: tk.gradient,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        fontWeight: 800, fontSize: 14,
      }}>
        {drive.companyName?.charAt(0)?.toUpperCase() || "?"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: tk.text }}>{drive.companyName}</span>
          {isHighlighted && <StatusPill tone="accent" tk={tk}>Highlighted</StatusPill>}
        </div>
        <div style={{ fontSize: 12, color: tk.textSecondary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {drive.jobRole} {drive.location ? `· ${drive.location}` : ""}
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: tk.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
        {drive.deadline ? `Due ${drive.deadline}` : "No deadline"}
      </div>

      <button
        className="mhd-star-btn mhd-focus"
        disabled={busy}
        onClick={() => onToggle(drive)}
        title={isHighlighted ? "Remove from Highlighted Drives" : "Add to Highlighted Drives"}
        style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10, cursor: busy ? "not-allowed" : "pointer",
          border: `1px solid ${isHighlighted ? tk.accent : tk.glassBorder}`,
          background: isHighlighted ? tk.gradient : tk.glass,
          color: isHighlighted ? "#fff" : tk.textSecondary,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
        {isHighlighted ? "★" : "☆"}
      </button>
    </div>
  );
}

export default function ManageHighlightedDrives() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const tk = dark ? DARK : LIGHT;

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    axios.get("/drives")
      .then((res) => setDrives(res.data))
      .catch(() => setError("Couldn't load drives. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const toggleHighlight = async (drive) => {
    setBusyId(drive.id);
    setError("");
    try {
      const res = await axios.patch(`/drives/${drive.id}/highlight`);
      setDrives((prev) => prev.map((d) => d.id === drive.id ? { ...d, isHighlighted: res.data.isHighlighted } : d));
    } catch {
      setError("Couldn't update that drive — you may not have permission, or it may have been deleted.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drives;
    return drives.filter((d) =>
      d.companyName?.toLowerCase().includes(q) ||
      d.jobRole?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q)
    );
  }, [drives, search]);

  const highlighted = filtered.filter((d) => d.isHighlighted);
  const others = filtered.filter((d) => !d.isHighlighted);

  const t = buildStyles(tk);

  return (
    <div style={t.page}>
      <style>{STYLE_BLOCK}</style>

      <header style={t.topbar}>
        <button className="mhd-back mhd-focus" style={t.backBtn} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
        <div style={{ flex: 1 }} />
      </header>

      <div style={t.container}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={t.title}>Manage Highlighted Drives</h1>
          <p style={t.subtitle}>
            Pick which drives show up in the Highlighted Drives slider on the Home page.
            It displays 2 at a time and rotates automatically — students can also flip through it manually.
          </p>
        </div>

        <div style={t.statsRow}>
          <div style={t.statCard}>
            <div style={t.statValue}>{highlighted.length}</div>
            <div style={t.statLabel}>Currently highlighted</div>
          </div>
          <div style={t.statCard}>
            <div style={t.statValue}>{drives.length}</div>
            <div style={t.statLabel}>Total active drives</div>
          </div>
        </div>

        <div style={t.searchWrap}>
          <input
            style={t.search}
            placeholder="Search by company, role, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div style={t.errorBanner}>{error}</div>}

        {loading && <div style={t.emptyState}>Loading drives…</div>}

        {!loading && filtered.length === 0 && (
          <div style={t.emptyState}>No drives match "{search}".</div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {highlighted.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <div style={t.sectionLabel}>Highlighted ({highlighted.length})</div>
                {highlighted.map((d) => (
                  <DriveRow key={d.id} drive={d} dark={dark} tk={tk} onToggle={toggleHighlight} busy={busyId === d.id} />
                ))}
              </section>
            )}

            <section>
              <div style={t.sectionLabel}>
                {highlighted.length > 0 ? `All other drives (${others.length})` : `All drives (${others.length})`}
              </div>
              {others.length === 0
                ? <div style={t.emptyState}>Everything matching your search is already highlighted.</div>
                : others.map((d) => (
                    <DriveRow key={d.id} drive={d} dark={dark} tk={tk} onToggle={toggleHighlight} busy={busyId === d.id} />
                  ))
              }
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function buildStyles(tk) {
  return {
    page: { minHeight: "100vh", background: tk.bg, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", color: tk.text },
    topbar: { display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${tk.divider}` },
    backBtn: { background: "none", border: "none", color: tk.accentLight, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 0 },
    container: { maxWidth: 760, margin: "0 auto", padding: "28px 24px 60px" },
    title: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", margin: 0, color: tk.text },
    subtitle: { fontSize: 13, color: tk.textSecondary, marginTop: 8, lineHeight: 1.6, maxWidth: 560 },
    statsRow: { display: "flex", gap: 10, marginBottom: 18 },
    statCard: { flex: 1, background: tk.glass, border: `1px solid ${tk.glassBorder}`, borderRadius: 14, padding: "14px 16px" },
    statValue: { fontSize: 24, fontWeight: 800, color: tk.accentLight, letterSpacing: "-0.5px" },
    statLabel: { fontSize: 11.5, color: tk.textMuted, marginTop: 2, fontWeight: 600 },
    searchWrap: { marginBottom: 18 },
    search: { width: "100%", padding: "10px 14px", border: `1px solid ${tk.inputBorder}`, borderRadius: 12, fontSize: 13.5, fontFamily: "inherit", background: tk.inputBg, color: tk.text, outline: "none", boxSizing: "border-box" },
    sectionLabel: { fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 },
    errorBanner: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, marginBottom: 16 },
    emptyState: { padding: "30px 0", textAlign: "center", color: tk.textMuted, fontSize: 13 },
  };
}