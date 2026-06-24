import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import DriveCard from "../components/DriveCard";
import ExpiringDrives from "./ExpiringDrives";
import useFavorites from "../UseFavorites";
import Hero from "./Hero";
import Logo from "../components/Logo";

const CATEGORIES = ["All", "IT_SOFTWARE", "CORE_ENGINEERING", "GOVERNMENT", "BANKING", "MANAGEMENT", "INTERNSHIP", "OTHERS"];
const PAGE_SIZE = 9;

const CATEGORY_LABELS = {
  All:              "All",
  IT_SOFTWARE:      "IT / Software",
  CORE_ENGINEERING: "Core Engineering",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OTHERS:           "Others",
};

const HERO_CATEGORY_MAP = {
  "IT Services":       "IT_SOFTWARE",
  "Core Engineering":  "CORE_ENGINEERING",
  "Internships":       "INTERNSHIP",
  "Government":        "GOVERNMENT",
};

const BRANCH_OPTIONS = [
  "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL", "CHEM", "AIDS",
  "AIML", "CSD", "IOT", "BME", "AERO", "AUTO", "OTHER",
];

const BATCH_OPTIONS = ["2025", "2026", "2027", "2028"];
const PROFILE_KEY = "fd_user_profile";

// ── Design tokens ──────────────────────────────────────────────────────────
const DARK = {
  bg:               "#080820",
  bgAlt:            "#0d0d2b",
  glass:            "rgba(255,255,255,0.04)",
  glassMid:         "rgba(255,255,255,0.06)",
  glassHover:       "rgba(255,255,255,0.08)",
  glassBorder:      "rgba(255,255,255,0.09)",
  glassBorderHover: "rgba(255,255,255,0.18)",
  text:             "#f0f0ff",
  textSecondary:    "rgba(240,240,255,0.55)",
  textMuted:        "rgba(240,240,255,0.32)",
  accent:           "#6366f1",
  accentLight:      "#818cf8",
  accentSoft:       "rgba(99,102,241,0.15)",
  gradient:         "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  gradientSubtle:   "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
  warning:          "#f59e0b",
  warningTint:      "rgba(245,158,11,0.12)",
  success:          "#10b981",
  successTint:      "rgba(16,185,129,0.12)",
  pink:             "#ec4899",
  pinkTint:         "rgba(236,72,153,0.12)",
  divider:          "rgba(255,255,255,0.07)",
  inputBg:          "rgba(255,255,255,0.06)",
  inputText:        "#f0f0ff",
  inputBorder:      "rgba(255,255,255,0.12)",
  shadow:           "0 4px 24px rgba(0,0,0,0.4)",
  shadowLg:         "0 20px 60px rgba(0,0,0,0.5)",
  highlightGradient:"linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.07) 100%)",
  highlightBorder:  "rgba(99,102,241,0.22)",
  colorScheme:      "dark",
};

const LIGHT = {
  bg:               "#f4f3fa",
  bgAlt:            "#ffffff",
  glass:            "#ffffff",
  glassMid:         "#fafafa",
  glassHover:       "#f8f7ff",
  glassBorder:      "rgba(99,102,241,0.10)",
  glassBorderHover: "rgba(99,102,241,0.25)",
  text:             "#1a1740",
  textSecondary:    "rgba(26,23,64,0.55)",
  textMuted:        "rgba(26,23,64,0.38)",
  accent:           "#6366f1",
  accentLight:      "#6366f1",
  accentSoft:       "rgba(99,102,241,0.08)",
  gradient:         "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
  gradientSubtle:   "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.03) 100%)",
  warning:          "#d97706",
  warningTint:      "rgba(217,119,6,0.08)",
  success:          "#059669",
  successTint:      "rgba(5,150,105,0.08)",
  pink:             "#db2777",
  pinkTint:         "rgba(219,39,119,0.08)",
  divider:          "rgba(99,102,241,0.08)",
  inputBg:          "#f8f7fc",
  inputText:        "#1a1740",
  inputBorder:      "rgba(99,102,241,0.10)",
  shadow:           "0 4px 24px rgba(99,102,241,0.08)",
  shadowLg:         "0 20px 60px rgba(76,29,149,0.10)",
  highlightGradient:"linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.03) 100%)",
  highlightBorder:  "rgba(99,102,241,0.15)",
  colorScheme:      "light",
};

// ── Global styles ──────────────────────────────────────────────────────────
const STYLE_BLOCK = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  @keyframes fd2-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes fd2-card-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fd2-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fd2-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes fd2-slide-in {
    from { opacity: 0; transform: translateX(18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fd2-hl-progress {
    from { width: 0%; }
    to   { width: 100%; }
  }

  .fd2-skel {
    background: linear-gradient(90deg,
      rgba(129,140,248,0.06) 25%,
      rgba(129,140,248,0.14) 37%,
      rgba(129,140,248,0.06) 63%
    );
    background-size: 600px 100%;
    animation: fd2-shimmer 1.6s ease-in-out infinite;
    border-radius: 10px;
  }
  .fd2-card-in   { animation: fd2-card-in 0.45s ease both; }
  .fd2-slide-in  { animation: fd2-slide-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
  .fd2-fade-in   { animation: fd2-fade-in 0.3s ease both; }

  .fd2-focus:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 3px;
    border-radius: 8px;
  }
  .fd2-glass-card {
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .fd2-glass-card:hover {
    transform: translateY(-1px);
  }
  .fd2-search-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    border-radius: 12px;
  }
  .fd2-page-btn {
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }
  .fd2-page-btn:hover { transform: translateY(-1px); }
  .fd2-fav-row   { transition: background 0.15s ease; }
  .fd2-dot-btn   { transition: width 0.3s ease, background 0.3s ease, transform 0.15s ease; }
  .fd2-dot-btn:hover { transform: scale(1.2); }

  .fd2-stat-card {
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  }
  .fd2-stat-card:hover {
    transform: translateY(-2px);
  }

  .fd2-hl-card-wrap {
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
  }

  .fd2-arrow-btn {
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  }
  .fd2-arrow-btn:hover {
    transform: scale(1.08);
  }

  /* Scrollbar hide for rec track */
  .fd2-no-scroll::-webkit-scrollbar { display: none; }
  .fd2-no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* Dark-mode aware select/option */
  select.fd2-select-dark {
    color-scheme: dark;
    background-color: rgba(255,255,255,0.06);
    color: #f0f0ff;
  }
  select.fd2-select-dark option {
    background-color: #1a1a3e;
    color: #f0f0ff;
  }
  select.fd2-select-light {
    color-scheme: light;
    background-color: #f8f7fc;
    color: #1a1740;
  }
  select.fd2-select-light option {
    background-color: #ffffff;
    color: #1a1740;
  }

  @media (prefers-reduced-motion: reduce) {
    .fd2-skel     { animation: none; }
    .fd2-card-in,
    .fd2-slide-in,
    .fd2-fade-in  { animation: none; }
    .fd2-glass-card:hover,
    .fd2-page-btn:hover,
    .fd2-stat-card:hover { transform: none; }
  }

  /* Responsive overrides */
  @media (max-width: 900px) {
    .fd-layout { grid-template-columns: 1fr !important; }
    .fd-sidebar { position: static !important; }
  }
  @media (max-width: 640px) {
    .fd-topbar { padding: 10px 16px !important; gap: 10px !important; }
    .fd-layout  { padding: 14px 16px !important; }
    .fd2-kbd-hint { display: none !important; }
  }
`;

// ── Ambient glow (dark mode only) ─────────────────────────────────────────
function AmbientGlow() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-10%", right: "-5%",  width: "45%", height: "45%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "5%",  left: "-10%", width: "40%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: "50%",   left: "50%",  width: "30%", height: "30%", borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)" }} />
    </div>
  );
}

// ── Category tabs with animated pill ──────────────────────────────────────
function CategoryTabs({ categories, labels, active, onChange, tk }) {
  const btnRefs = useRef({});
  const [box, setBox] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const measure = () => {
    const el = btnRefs.current[active];
    if (el) setBox({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight });
  };

  useLayoutEffect(() => { measure(); }, [active]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <div style={{
      position: "relative", display: "flex", gap: 3, flexWrap: "wrap",
      background: tk.glass, border: `1px solid ${tk.glassBorder}`,
      borderRadius: 14, padding: 4, marginBottom: 20,
    }}>
      <div style={{
        position: "absolute",
        top: box.top, left: box.left, width: box.width, height: box.height,
        borderRadius: 10, background: tk.gradient,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: 0,
        boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
      }} />
      {categories.map((c) => (
        <button
          key={c}
          ref={(el) => (btnRefs.current[c] = el)}
          type="button"
          className="fd2-focus"
          onClick={() => onChange(c)}
          style={{
            position: "relative", zIndex: 1,
            padding: "8px 15px", fontSize: 12.5, fontWeight: active === c ? 700 : 500,
            fontFamily: "inherit", letterSpacing: "-0.1px", whiteSpace: "nowrap",
            border: "none", borderRadius: 10, cursor: "pointer",
            background: "transparent",
            color: active === c ? "#fff" : tk.textSecondary,
            transition: "color 0.2s ease",
          }}
        >
          {labels[c] || c}
        </button>
      ))}
    </div>
  );
}

// ── Panel header ──────────────────────────────────────────────────────────
function PanelHeader({ icon, iconBg, title, badge, onClick, tk }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      className={onClick ? "fd2-focus" : undefined}
      style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.2px", color: tk.text }}>
        {title}
      </span>
      {!!badge && (
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: tk.pink,
          background: tk.pinkTint, borderRadius: 999, padding: "2px 8px",
          border: `1px solid ${tk.pink}22`,
        }}>
          {badge}
        </span>
      )}
      {onClick && (
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: tk.accentLight, whiteSpace: "nowrap" }}>
          View all ›
        </span>
      )}
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────
function SkeletonCard({ tk }) {
  return (
    <div style={{ background: tk.glass, border: `1px solid ${tk.glassBorder}`, borderRadius: 16, padding: 18, minHeight: 172 }}>
      <div className="fd2-skel" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14 }} />
      <div className="fd2-skel" style={{ width: "68%", height: 13, marginBottom: 8 }} />
      <div className="fd2-skel" style={{ width: "48%", height: 11, marginBottom: 20 }} />
      <div className="fd2-skel" style={{ width: "38%", height: 11 }} />
    </div>
  );
}

// ── Highlighted Drives Slider — 2 at a time ───────────────────────────────
function HighlightedDrivesSlider({ drives, dark, favorites, onToggleFav, tk, isAdmin, onManage }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const total = drives.length;
  const pageCount = Math.ceil(total / 2);

  const go = (pageIdx) => {
    const clamped = ((pageIdx % pageCount) + pageCount) % pageCount;
    setCurrent(clamped);
  };

  useEffect(() => {
    if (pageCount <= 1 || paused) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % pageCount);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [current, pageCount, paused]);

  if (total === 0 && !isAdmin) return null;

  const startIdx = current * 2;
  const visibleDrives = drives.slice(startIdx, startIdx + 2);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        background: tk.highlightGradient,
        border: `1px solid ${tk.highlightBorder}`,
        borderRadius: 20,
        padding: "22px 22px 18px",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative corner accent */}
      <div aria-hidden style={{
        position: "absolute", top: 0, right: 0,
        width: 200, height: 200,
        background: "radial-gradient(circle at top right, rgba(139,92,246,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: total > 0 ? 18 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: tk.gradient, display: "inline-block",
            animation: "fd2-pulse-dot 2s ease-in-out infinite",
            boxShadow: `0 0 0 3px ${tk.accent}22`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 14.5, fontWeight: 700, color: tk.text, letterSpacing: "-0.3px" }}>
            Highlighted Drives
          </span>
          {total > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: tk.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              border: `1px solid ${tk.highlightBorder}`,
              borderRadius: 999, padding: "2px 10px",
            }}>
              {total} highlighted
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAdmin && (
            <button
              className="fd2-focus fd2-arrow-btn"
              title="Manage highlighted drives"
              onClick={onManage}
              style={{
                fontSize: 11, fontWeight: 600, color: tk.accentLight,
                background: tk.accentSoft, border: `1px solid ${tk.accent}30`,
                borderRadius: 8, padding: "5px 12px", cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✦ Manage
            </button>
          )}
          {pageCount > 1 && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="fd2-focus fd2-arrow-btn"
                onClick={() => go(current - 1)}
                aria-label="Previous"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: tk.glass, border: `1px solid ${tk.glassBorder}`,
                  cursor: "pointer", color: tk.textSecondary, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}
              >‹</button>
              <button
                className="fd2-focus fd2-arrow-btn"
                onClick={() => go(current + 1)}
                aria-label="Next"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: tk.glass, border: `1px solid ${tk.glassBorder}`,
                  cursor: "pointer", color: tk.textSecondary, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}
              >›</button>
            </div>
          )}
        </div>
      </div>

      {/* Empty state for admin */}
      {total === 0 && isAdmin && (
        <div style={{
          padding: "24px 0 8px",
          textAlign: "center",
          color: tk.textMuted,
          fontSize: 13,
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>✦</div>
          <div style={{ fontWeight: 600, color: tk.textSecondary, marginBottom: 4 }}>No highlighted drives yet</div>
          <div>Click <strong>Manage</strong> to pin drives to this section.</div>
        </div>
      )}

      {/* 2-card grid */}
      {total > 0 && (
        <div
          key={current}
          className="fd2-slide-in"
          style={{
            display: "grid",
            gridTemplateColumns: visibleDrives.length === 2 ? "1fr 1fr" : "1fr",
            gap: 14,
          }}
        >
          {visibleDrives.map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              dark={dark}
              favorites={favorites}
              onToggleFav={onToggleFav}
            />
          ))}
        </div>
      )}

      {/* Dot indicators + progress bar */}
      {pageCount > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 16 }}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              className="fd2-dot-btn fd2-focus"
              onClick={() => go(i)}
              aria-label={`Page ${i + 1}`}
              style={{
                width: i === current ? 22 : 6, height: 6,
                borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                background: i === current ? tk.accent : tk.glassBorder,
              }}
            />
          ))}

          {!paused && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, overflow: "hidden", borderRadius: "0 0 20px 20px" }}>
              <div
                key={`${current}-progress`}
                style={{
                  height: "100%",
                  background: tk.gradient,
                  animation: "fd2-hl-progress 5s linear forwards",
                  transformOrigin: "left",
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Quick stats sidebar panel ─────────────────────────────────────────────
function QuickStats({ drives, tk }) {
  const newThisWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    return drives.filter((d) => d.postedAt && new Date(d.postedAt).getTime() > cutoff).length;
  }, [drives]);

  const catCounts = useMemo(() => {
    const map = {};
    drives.forEach((d) => { if (d.category) map[d.category] = (map[d.category] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [drives]);

  const stats = [
    { label: "Total drives",  value: drives.length, color: tk.accent,   bg: tk.accentSoft },
    { label: "New this week", value: newThisWeek,    color: tk.success,  bg: tk.successTint },
  ];

  return (
    <div>
      <PanelHeader
        tk={tk}
        iconBg={tk.accentSoft}
        title="At a glance"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={tk.accentLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="fd2-stat-card"
            style={{
              background: s.bg,
              border: `1px solid ${s.color}22`,
              borderRadius: 12, padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>
              {drives.length === 0 ? "—" : s.value}
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: tk.textMuted, marginTop: 4, letterSpacing: "0.2px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {catCounts.length > 0 && (
        <>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: tk.textMuted, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 8 }}>
            Top sectors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {catCounts.map(([cat, count]) => {
              const pct = Math.round((count / drives.length) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: tk.textSecondary }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted }}>{count}</span>
                  </div>
                  <div style={{ height: 3, background: tk.divider, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      background: tk.gradient,
                      width: `${pct}%`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Home component ────────────────────────────────────────────────────
export default function Home() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const tk = dark ? DARK : LIGHT;

  // Check admin / employer role
  const isAdmin = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("fd_user") || "{}");
      return user?.role === "ADMIN" || user?.role === "EMPLOYER";
    } catch { return false; }
  }, []);

  const browseDrivesRef = useRef(null);
  const howItWorksRef   = useRef(null);
  const searchInputRef  = useRef(null);

  const scrollToBrowse    = () => browseDrivesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToHowItWorks = () => howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });

  const [drives,      setDrives]      = useState([]);
  const [highlighted, setHighlighted] = useState([]);  // ← replaces "featured"
  const [search,      setSearch]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState("All");
  const [location,    setLocation]    = useState("All");
  const [page,        setPage]        = useState(1);

  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
  })();
  const [branch,      setBranch]      = useState(savedProfile.branch || "");
  const [batch,       setBatch]       = useState(savedProfile.batch  || "");
  const [showBanner,  setShowBanner]  = useState(!savedProfile.branch || !savedProfile.batch);
  const [recommended, setRecommended] = useState([]);
  const [recLoading,  setRecLoading]  = useState(false);

  const { favorites, toggleFav, lastAddedId } = useFavorites();
  const recTrackRef = useRef(null);
  const scrollRec = (dir) => recTrackRef.current?.scrollBy({ left: dir * 290, behavior: "smooth" });

  // ── FIX 1: Deduplicated, sorted locations (case-insensitive, first-seen canonical form) ──
  const locations = useMemo(() => {
    const seen = new Map(); // key = lowercase → canonical display value
    drives.forEach((d) => {
      if (!d.location) return;
      const norm = d.location.trim();
      const key  = norm.toLowerCase();
      if (!seen.has(key)) seen.set(key, norm); // keep first-seen casing
    });
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [drives]);

  useEffect(() => {
    axios.get("/drives")
      .then((res) => { setDrives(res.data); setLoading(false); })
      .catch(()   => setLoading(false));

    // Fetch highlighted drives — adjust endpoint to match your backend
    axios.get("/drives/highlighted")
      .then((res) => setHighlighted(res.data))
      .catch(()   => setHighlighted([]));
  }, []);

  useEffect(() => {
    if (!branch || !batch) return;
    setRecLoading(true);
    axios
      .get(`/drives/recommended?branch=${encodeURIComponent(branch)}&batch=${encodeURIComponent(batch)}`)
      .then((res) => setRecommended(res.data))
      .catch(()   => setRecommended([]))
      .finally(() => setRecLoading(false));
  }, [branch, batch]);

  useEffect(() => { setPage(1); }, [search, category, location]);

  // "/" shortcut to focus search
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = drives.filter((d) => {
    const q  = search.toLowerCase();
    const sm = d.companyName?.toLowerCase().includes(q) || d.jobRole?.toLowerCase().includes(q);
    const cm = category === "All" || d.category === category;
    // ── FIX 1 continued: compare lowercase so "Pan India" === "pan india"
    const lm = location === "All" || d.location?.trim().toLowerCase() === location.trim().toLowerCase();
    return sm && cm && lm;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageDrives = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSaveProfile = () => {
    if (!branch || !batch) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ branch, batch }));
    setShowBanner(false);
  };

  const handleResetProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
    setBranch(""); setBatch(""); setRecommended([]); setShowBanner(true);
  };

  const handleClearFilters = () => { setSearch(""); setCategory("All"); setLocation("All"); };

  const handleHeroCategoryClick = (label) => {
    const mapped = HERO_CATEGORY_MAP[label];
    if (mapped) setCategory(mapped);
    scrollToBrowse();
  };

  // Admin: navigate to manage highlighted drives page
  const handleManageHighlighted = () => navigate("/admin/highlighted-drives");

  const lastFavDrive = drives.find((d) => d.id === lastAddedId) || null;

  // ── FIX 2: select class helper for dark-mode theming ──
  const selectClass = dark ? "fd2-select-dark" : "fd2-select-light";

  const t = buildStyles(tk);

  return (
    <div style={t.page}>
      <style>{STYLE_BLOCK}</style>
      {dark && <AmbientGlow />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <Hero
          dark={dark}
          onBrowseClick={scrollToBrowse}
          onHowItWorksClick={scrollToHowItWorks}
          onCategoryClick={handleHeroCategoryClick}
        />

        {/* ── TOP BAR ── */}
        <header style={t.topbar} className="fd-topbar">
          <Logo size={28} textSize={14.5} textColor={tk.text} />

          <div style={t.searchWrap} className="fd2-search-wrap">
            <svg style={t.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchInputRef}
              style={t.search}
              placeholder="Search companies, roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search drives"
            />
            <span className="fd2-kbd-hint" style={t.kbdHint}>/</span>
          </div>

          <button style={t.darkBtn} className="fd2-focus" onClick={() => setDark(!dark)} title="Toggle theme" aria-label="Toggle theme">
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </header>

        {/* ── PROFILE BANNER ── */}
        {showBanner && (
          <div style={t.banner}>
            <div style={t.bannerInner}>
              <div style={t.bannerLeft}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: tk.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}>✨</div>
                <div>
                  <div style={t.bannerTitle}>Get personalised recommendations</div>
                  <div style={t.bannerSub}>Select your department and batch to surface the most relevant drives.</div>
                </div>
              </div>
              <div style={t.bannerControls} className="fd-banner-controls">
                <select
                  className={selectClass}
                  style={t.bannerSelect}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  aria-label="Select department"
                >
                  <option value="">Department</option>
                  {BRANCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                  className={selectClass}
                  style={t.bannerSelect}
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  aria-label="Select batch"
                >
                  <option value="">Batch year</option>
                  {BATCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <button
                  className="fd2-focus"
                  style={{
                    ...t.bannerBtn,
                    opacity: branch && batch ? 1 : 0.42,
                    cursor: branch && batch ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSaveProfile}
                  disabled={!branch || !batch}
                >
                  Show recommendations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN LAYOUT ── */}
        <div style={t.layout} className="fd-layout">

          {/* LEFT SIDEBAR */}
          <aside style={t.sidebar} className="fd-sidebar">

            {/* Filters card */}
            <div style={t.card} className="fd2-glass-card">
              <PanelHeader
                tk={tk}
                iconBg={tk.accentSoft}
                title="Filter drives"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={tk.accentLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                }
              />

              <p style={t.filterHeading}>Location</p>
              {/* ── FIX 2: dark-mode select via CSS class ── */}
              <select
                className={selectClass}
                style={t.dropDown}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filter by location"
              >
                <option value="All">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {(search || category !== "All" || location !== "All") && (
                <button
                  className="fd2-focus"
                  style={t.clearFiltersSmall}
                  onClick={handleClearFilters}
                >
                  ✕ Clear filters
                </button>
              )}

              {!showBanner && branch && batch && (
                <div style={t.profileChip}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: tk.gradient, flexShrink: 0,
                    }} />
                    <span style={t.profileChipText}>{branch} · {batch}</span>
                  </div>
                  <button style={t.profileChipReset} className="fd2-focus" onClick={handleResetProfile} title="Change profile">✕</button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div style={t.card} className="fd2-glass-card">
              <QuickStats drives={drives} tk={tk} />
            </div>

            {/* Expiring Soon */}
            <div style={t.card} className="fd2-glass-card">
              <PanelHeader
                tk={tk}
                iconBg={tk.warningTint}
                title="Expiring soon"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={tk.warning} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                }
              />
              <ExpiringDrives />
            </div>

            {/* Saved Drives */}
            <div style={t.card} className="fd2-glass-card">
              <PanelHeader
                tk={tk}
                iconBg={tk.pinkTint}
                title="Saved drives"
                badge={favorites.size || undefined}
                onClick={() => navigate("/saved-drives")}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={tk.pink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                }
              />
              {!lastFavDrive ? (
                <p style={{ fontSize: 12, color: tk.textMuted, lineHeight: 1.65, margin: 0 }}>
                  Tap the heart on any drive card to save it here.
                </p>
              ) : (
                <div>
                  <div
                    style={t.favItem}
                    className="fd2-fav-row"
                    onClick={() => navigate(`/drives/${lastFavDrive.id}`)}
                  >
                    <div style={t.favDot}>{lastFavDrive.companyName?.charAt(0)?.toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={t.favCompany}>{lastFavDrive.companyName}</div>
                      <div style={t.favRole}>{lastFavDrive.jobRole}</div>
                    </div>
                    <button
                      style={t.favRemove}
                      className="fd2-focus"
                      title="Remove"
                      onClick={(e) => { e.stopPropagation(); toggleFav(lastFavDrive.id); }}
                    >✕</button>
                  </div>
                  {favorites.size > 1 && (
                    <button style={t.favMoreBtn} className="fd2-focus" onClick={() => navigate("/saved-drives")}>
                      +{favorites.size - 1} more saved →
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ── FEED ── */}
          <main style={t.feed}>

            {/* RECOMMENDED */}
            {!showBanner && branch && batch && (
              <section style={{ marginBottom: 8 }}>
                <div style={t.feedHeader}>
                  <div>
                    <div style={t.feedTitle}>
                      <span style={t.eyebrowDot} />
                      Recommended for {branch} · {batch}
                    </div>
                    <div style={t.feedSub}>Matched to your department and batch year</div>
                  </div>
                  {!recLoading && (
                    <span style={t.countBadge}>
                      {recommended.length} match{recommended.length !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>

                {recLoading && (
                  <div style={t.sliderWrap}>
                    <div style={t.recTrack} className="fd2-no-scroll">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={t.recCardWrap}><SkeletonCard tk={tk} /></div>
                      ))}
                    </div>
                  </div>
                )}

                {!recLoading && recommended.length === 0 && (
                  <div style={t.emptyState}>No drives match your department or batch yet — check back soon.</div>
                )}

                {!recLoading && recommended.length > 0 && (
                  <div style={t.sliderWrap}>
                    <button
                      style={{ ...t.sliderArrow, left: "-14px" }}
                      className="fd2-arrow-btn fd2-focus"
                      onClick={() => scrollRec(-1)}
                      aria-label="Scroll recommended left"
                    >‹</button>
                    <div ref={recTrackRef} style={t.recTrack} className="fd2-no-scroll">
                      {recommended.map((drive, i) => (
                        <div key={drive.id} className="fd2-card-in" style={{ ...t.recCardWrap, animationDelay: `${i * 40}ms` }}>
                          <DriveCard drive={drive} dark={dark} favorites={favorites} onToggleFav={toggleFav} />
                        </div>
                      ))}
                    </div>
                    <button
                      style={{ ...t.sliderArrow, right: "-14px" }}
                      className="fd2-arrow-btn fd2-focus"
                      onClick={() => scrollRec(1)}
                      aria-label="Scroll recommended right"
                    >›</button>
                  </div>
                )}

                <div style={t.recDivider} />
              </section>
            )}

            {/* ── FIX 3: HIGHLIGHTED DRIVES — between Recommended and Open Drives ── */}
            {(highlighted.length > 0 || isAdmin) && (
              <HighlightedDrivesSlider
                drives={highlighted}
                dark={dark}
                favorites={favorites}
                onToggleFav={toggleFav}
                tk={tk}
                isAdmin={isAdmin}
                onManage={handleManageHighlighted}
              />
            )}

            {/* ALL DRIVES */}
            <div ref={browseDrivesRef}>
              <div style={t.feedHeader}>
                <div>
                  <div style={t.feedTitle}>
                    <span style={t.eyebrowDot} />
                    Open Drives
                  </div>
                  <div style={t.feedSub}>Freshest opportunities, updated daily</div>
                </div>
                <span style={t.countBadge}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CategoryTabs
                categories={CATEGORIES}
                labels={CATEGORY_LABELS}
                active={category}
                onChange={setCategory}
                tk={tk}
              />
            </div>

            <div ref={howItWorksRef} />

            {loading && (
              <div style={t.grid}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} tk={tk} />)}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={t.emptyState}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 6 }}>No drives match these filters</div>
                <div style={{ marginBottom: 20, fontSize: 13 }}>Try widening your search or clearing filters.</div>
                <button className="fd2-focus" style={t.clearFiltersBtn} onClick={handleClearFilters}>Clear filters</button>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div style={t.grid}>
                {pageDrives.map((drive, i) => (
                  <div key={drive.id} className="fd2-card-in" style={{ animationDelay: `${i * 35}ms` }}>
                    <DriveCard drive={drive} dark={dark} favorites={favorites} onToggleFav={toggleFav} />
                  </div>
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div style={t.pagination}>
                <button
                  className="fd2-page-btn fd2-focus"
                  style={{ ...t.pageBtn, ...(page === 1 ? t.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >← Prev</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="fd2-page-btn fd2-focus"
                    style={{ ...t.pageBtn, ...(n === page ? t.pageBtnActive : {}) }}
                    onClick={() => setPage(n)}
                  >{n}</button>
                ))}

                <button
                  className="fd2-page-btn fd2-focus"
                  style={{ ...t.pageBtn, ...(page === totalPages ? t.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >Next →</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Styles factory ────────────────────────────────────────────────────────
function buildStyles(tk) {
  return {
    page: {
      minHeight: "100vh",
      background: tk.bg,
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      position: "relative",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 50,
      background: tk.glass,
      borderBottom: `1px solid ${tk.divider}`,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "11px 24px",
      display: "flex", alignItems: "center", gap: 14,
    },
    searchWrap: { flex: 1, position: "relative", maxWidth: 520 },
    searchIcon: {
      position: "absolute", left: 13, top: "50%",
      transform: "translateY(-50%)", color: tk.textMuted, pointerEvents: "none",
    },
    search: {
      width: "100%", padding: "9px 38px 9px 38px",
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: 11, fontSize: 13.5,
      fontFamily: "inherit", letterSpacing: "-0.1px",
      background: tk.inputBg, color: tk.text,
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s ease",
    },
    kbdHint: {
      position: "absolute", right: 11, top: "50%",
      transform: "translateY(-50%)", fontSize: 10.5, fontWeight: 600,
      color: tk.textMuted, border: `1px solid ${tk.glassBorder}`,
      borderRadius: 5, padding: "1px 6px", pointerEvents: "none",
      letterSpacing: "0.1px",
    },
    darkBtn: {
      background: tk.glass,
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: 10, padding: "8px 10px",
      cursor: "pointer", color: tk.textSecondary,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      transition: "border-color 0.15s ease, background 0.15s ease",
    },
    banner: {
      background: tk.glass,
      borderBottom: `1px solid ${tk.divider}`,
      padding: "14px 24px",
    },
    bannerInner: {
      maxWidth: 1300, margin: "0 auto",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 20, flexWrap: "wrap",
    },
    bannerLeft: { display: "flex", alignItems: "center", gap: 14 },
    bannerTitle: { fontSize: 13.5, fontWeight: 700, color: tk.text, letterSpacing: "-0.2px" },
    bannerSub:   { fontSize: 12.5, color: tk.textSecondary, marginTop: 2 },
    bannerControls: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    bannerSelect: {
      padding: "8px 12px", fontSize: 13,
      border: `1px solid ${tk.inputBorder}`,
      borderRadius: 10,
      fontFamily: "inherit",
      outline: "none", cursor: "pointer",
      transition: "border-color 0.15s ease",
    },
    bannerBtn: {
      padding: "8px 20px", fontSize: 13, fontWeight: 700,
      background: tk.gradient, color: "#fff",
      border: "none", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap",
      fontFamily: "inherit", boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
      transition: "opacity 0.15s ease, transform 0.15s ease",
    },
    layout: {
      display: "grid", gridTemplateColumns: "230px 1fr",
      gap: 20, padding: "22px 24px",
      maxWidth: 1340, margin: "0 auto",
    },
    sidebar: {
      display: "flex", flexDirection: "column", gap: 14,
      position: "sticky", top: 78, height: "fit-content",
    },
    card: {
      background: tk.glass,
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: 16, padding: "16px 16px",
      boxShadow: tk.shadow,
    },
    filterHeading: {
      fontSize: 10.5, fontWeight: 700, color: tk.textMuted,
      textTransform: "uppercase", letterSpacing: "0.7px",
      marginBottom: 8, marginTop: 0,
    },
    dropDown: {
      width: "100%", padding: "9px 10px",
      border: `1px solid ${tk.inputBorder}`,
      borderRadius: 10, fontSize: 13,
      fontFamily: "inherit", letterSpacing: "-0.1px",
      outline: "none", cursor: "pointer",
      transition: "border-color 0.15s ease",
    },
    clearFiltersSmall: {
      marginTop: 12, width: "100%",
      padding: "7px 0", fontSize: 11.5, fontWeight: 600,
      color: tk.textMuted, background: "transparent",
      border: `1px solid ${tk.glassBorder}`, borderRadius: 9,
      cursor: "pointer", fontFamily: "inherit",
      transition: "border-color 0.15s ease, color 0.15s ease",
    },
    profileChip: {
      marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
      background: tk.accentSoft, border: `1px solid ${tk.accent}30`,
      borderRadius: 10, padding: "7px 10px",
    },
    profileChipText: { fontSize: 12, fontWeight: 700, color: tk.accentLight },
    profileChipReset: {
      background: "none", border: "none", cursor: "pointer",
      color: tk.textMuted, fontSize: 11, padding: "0 2px", lineHeight: 1,
    },
    favItem: {
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 6px", borderRadius: 10, cursor: "pointer",
      transition: "background 0.15s ease",
    },
    favDot: {
      width: 30, height: 30, borderRadius: 9,
      background: tk.accentSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, color: tk.accentLight, flexShrink: 0,
    },
    favCompany: {
      fontSize: 12.5, fontWeight: 700, color: tk.text,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    favRole: {
      fontSize: 11, color: tk.textMuted,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    favRemove: {
      background: "none", border: "none", cursor: "pointer",
      color: tk.textMuted, fontSize: 11, padding: "2px 4px", flexShrink: 0,
    },
    favMoreBtn: {
      display: "block", width: "100%", marginTop: 8,
      padding: "8px 0", fontSize: 12, fontWeight: 700,
      color: tk.accentLight, background: "transparent",
      border: `1px dashed ${tk.accent}40`, borderRadius: 10,
      cursor: "pointer", fontFamily: "inherit", textAlign: "center",
      transition: "border-color 0.15s ease",
    },
    feed: { minWidth: 0 },
    feedHeader: {
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 16, gap: 12, flexWrap: "wrap",
    },
    feedTitle: {
      fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px",
      color: tk.text, lineHeight: 1.15,
      display: "flex", alignItems: "center", gap: 9,
    },
    eyebrowDot: {
      width: 7, height: 7, borderRadius: "50%",
      background: tk.gradient, flexShrink: 0,
      boxShadow: `0 0 0 3px ${tk.accent}22`,
    },
    feedSub: { fontSize: 12.5, color: tk.textMuted, marginTop: 3, letterSpacing: "-0.1px" },
    countBadge: {
      fontSize: 12, color: tk.textSecondary,
      background: tk.accentSoft, padding: "5px 14px",
      borderRadius: 999, border: `1px solid ${tk.accent}22`,
      fontWeight: 600, whiteSpace: "nowrap", alignSelf: "center",
    },
    sliderWrap: { position: "relative", padding: "0 18px", marginBottom: 4 },
    recTrack: {
      display: "flex", gap: 14, overflowX: "auto", scrollBehavior: "smooth",
      paddingBottom: 10,
    },
    recCardWrap: { minWidth: 270, maxWidth: 270, flexShrink: 0 },
    sliderArrow: {
      position: "absolute", top: "38%", transform: "translateY(-50%)",
      width: 30, height: 30,
      background: tk.glass, border: `1px solid ${tk.glassBorder}`,
      borderRadius: "50%", fontSize: 17,
      cursor: "pointer", zIndex: 2, color: tk.textSecondary,
      boxShadow: tk.shadow,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
      backdropFilter: "blur(8px)",
    },
    recDivider: { borderTop: `1px solid ${tk.divider}`, margin: "24px 0 28px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))",
      gap: 14,
    },
    emptyState: {
      padding: "60px 20px", textAlign: "center",
      color: tk.textMuted, fontSize: 13.5, letterSpacing: "-0.1px",
    },
    clearFiltersBtn: {
      padding: "9px 22px", fontSize: 13, fontWeight: 700,
      background: tk.accentSoft, color: tk.accentLight,
      border: `1px solid ${tk.accent}30`, borderRadius: 10,
      cursor: "pointer", fontFamily: "inherit",
      transition: "background 0.15s ease",
    },
    pagination: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 6, marginTop: 36, paddingBottom: 10, flexWrap: "wrap",
    },
    pageBtn: {
      padding: "8px 15px", fontSize: 13, fontWeight: 600,
      fontFamily: "inherit", letterSpacing: "-0.1px",
      border: `1px solid ${tk.glassBorder}`,
      borderRadius: 10, cursor: "pointer",
      background: tk.glass, color: tk.textSecondary,
    },
    pageBtnActive: {
      background: tk.gradient, borderColor: "transparent",
      color: "#fff", fontWeight: 700,
      boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
    },
    pageBtnDisabled: { opacity: 0.32, cursor: "not-allowed" },
  };
}