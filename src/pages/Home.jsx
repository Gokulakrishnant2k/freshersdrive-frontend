import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import DriveCard from "../components/DriveCard";
import ExpiringDrives from "./ExpiringDrives";
import useFavorites from "../UseFavorites";
import Hero from "./Hero";
import Logo from "../components/Logo";

const CATEGORIES = ["All", "IT_SOFTWARE", "CORE_ENGINEERING", "GOVERNMENT", "BANKING", "MANAGEMENT", "INTERNSHIP","OTHERS"];
const PAGE_SIZE = 9;

const CATEGORY_LABELS = {
  All:              "All",
  IT_SOFTWARE:      "IT / Software",
  CORE_ENGINEERING: "Core Engineering",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
  OTHERS:          "Others",
};

// Maps the labels used in Hero's category card to the enum values used
// here, so clicking a category in the Hero actually filters this page.
const HERO_CATEGORY_MAP = {
  "IT Services": "IT_SOFTWARE",
  "Core Engineering": "CORE_ENGINEERING",
  "Internships": "INTERNSHIP",
  "Government": "GOVERNMENT",
};

const BRANCH_OPTIONS = [
  "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL", "CHEM", "AIDS",
  "AIML", "CSD", "IOT", "BME", "AERO", "AUTO", "OTHER",
];

const BATCH_OPTIONS = ["2025", "2026", "2027", "2028"];

const PROFILE_KEY = "fd_user_profile";

// ── Design tokens ─────────────────────────────────────────────────────────
// Dark canvas matches Hero's #0c0b2b exactly so the page reads as one
// continuous surface instead of Hero + a different-feeling app below it.
const DARK = {
  bg: "#0c0b2b",
  glass: "rgba(255,255,255,0.045)",
  glassBorder: "rgba(255,255,255,0.1)",
  text: "#ffffff",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.38)",
  accent: "#6366f1",
  accentLight: "#818cf8",
  gradient: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
  warning: "#fbbf24",
  pink: "#f472b6",
  divider: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.05)",
  shadow: "0 20px 50px rgba(0,0,0,0.35)",
};

const LIGHT = {
  bg: "#f6f5fb",
  glass: "#ffffff",
  glassBorder: "rgba(99,102,241,0.1)",
  text: "#1e1b3a",
  textSecondary: "rgba(30,27,58,0.6)",
  textMuted: "rgba(30,27,58,0.4)",
  accent: "#6366f1",
  accentLight: "#6366f1",
  gradient: "linear-gradient(135deg, #6366f1 0%, #9333ea 50%, #db2777 100%)",
  warning: "#d97706",
  pink: "#db2777",
  divider: "rgba(99,102,241,0.1)",
  inputBg: "#f8f7fc",
  shadow: "0 20px 50px rgba(76,29,149,0.08)",
};

const STYLE_BLOCK = `
  @keyframes fd2-shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
  @keyframes fd2-card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fd2-skel {
    background: linear-gradient(90deg, rgba(129,140,248,0.08) 25%, rgba(129,140,248,0.18) 37%, rgba(129,140,248,0.08) 63%);
    background-size: 400px 100%;
    animation: fd2-shimmer 1.4s ease-in-out infinite;
    border-radius: 10px;
  }
  .fd2-card-in { animation: fd2-card-in 0.45s ease both; }
  .fd2-focus:focus-visible { outline: 2px solid #818cf8; outline-offset: 3px; border-radius: 8px; }
  .fd2-glass-card { transition: border-color 0.2s ease, transform 0.2s ease; }
  .fd2-glass-card:hover { transform: translateY(-2px); }
  .fd2-search-wrap:focus-within { box-shadow: 0 0 0 3px rgba(129,140,248,0.18); border-radius: 10px; }
  .fd2-page-btn { transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease; }
  .fd2-page-btn:hover { transform: translateY(-1px); }
  .fd2-fav-row { transition: background 0.15s ease; }
  .fd2-fav-row:hover { background: rgba(129,140,248,0.08); }
  @media (prefers-reduced-motion: reduce) {
    .fd2-skel { animation: none; }
    .fd2-card-in { animation: none; }
    .fd2-glass-card:hover, .fd2-page-btn:hover { transform: none; }
  }
`;

function AmbientGlow() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-8%", right: "-6%", width: "42%", height: "42%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "8%", left: "-8%", width: "38%", height: "38%", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,132,252,0.06), transparent 70%)" }} />
    </div>
  );
}

// Signature element: a sliding-pill tab control. The highlight physically
// moves to the selected category instead of just changing a background,
// which mirrors the "live tracking" idea already established in Hero.
function CategoryTabs({ categories, labels, active, onChange, tk }) {
  const containerRef = useRef(null);
  const btnRefs = useRef({});
  const [box, setBox] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const measure = () => {
    const el = btnRefs.current[active];
    if (el) {
      setBox({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight });
    }
  };

  useLayoutEffect(() => { measure(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [active]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", display: "flex", gap: 4, flexWrap: "wrap",
        background: tk.glass, border: `0.5px solid ${tk.glassBorder}`,
        borderRadius: 14, padding: 5, marginBottom: 18,
      }}
    >
      <div style={{
        position: "absolute", top: box.top, left: box.left, width: box.width, height: box.height,
        borderRadius: 10, background: tk.gradient,
        transition: "top 0.35s cubic-bezier(0.34,1.56,0.64,1), left 0.35s cubic-bezier(0.34,1.56,0.64,1), width 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: 0,
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
            padding: "8px 14px", fontSize: 13, fontWeight: active === c ? 700 : 500,
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
      <div style={{ width: 26, height: 26, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.2px", color: tk.text }}>
        {title}
      </span>
      {!!badge && (
        <span style={{ fontSize: 11, fontWeight: 700, color: tk.pink, background: tk.pink + "1A", borderRadius: 999, padding: "1px 7px" }}>
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

function SkeletonCard({ tk }) {
  return (
    <div style={{ background: tk.glass, border: `0.5px solid ${tk.glassBorder}`, borderRadius: 16, padding: 16, minHeight: 168 }}>
      <div className="fd2-skel" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 14 }} />
      <div className="fd2-skel" style={{ width: "70%", height: 13, marginBottom: 8 }} />
      <div className="fd2-skel" style={{ width: "50%", height: 11, marginBottom: 18 }} />
      <div className="fd2-skel" style={{ width: "40%", height: 11 }} />
    </div>
  );
}

export default function Home() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const tk = dark ? DARK : LIGHT;

  const browseDrivesRef = useRef(null);
  const howItWorksRef   = useRef(null);
  const searchInputRef  = useRef(null);

  const scrollToBrowse = () =>
    browseDrivesRef.current?.scrollIntoView({ behavior: "smooth" });

  const scrollToHowItWorks = () =>
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });

  const [drives,   setDrives]   = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [role,     setRole]     = useState("All");
  const [page,     setPage]     = useState(1);

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
  const scrollRec = (dir) => {
    recTrackRef.current?.scrollBy({ left: dir * 290, behavior: "smooth" });
  };

  const locations = useMemo(
    () => [...new Set(drives.map((d) => d.location).filter(Boolean))].sort(),
    [drives]
  );

  const roles = useMemo(
    () => [...new Set(drives.map((d) => d.jobRole).filter(Boolean))].sort(),
    [drives]
  );

  useEffect(() => {
    axios.get("/drives")
      .then((res) => { setDrives(res.data); setLoading(false); })
      .catch(()   => setLoading(false));
  }, []);

  useEffect(() => {
    if (!branch || !batch) return;
    setRecLoading(true);
    axios.get(`/drives/recommended?branch=${encodeURIComponent(branch)}&batch=${encodeURIComponent(batch)}`)
      .then((res) => setRecommended(res.data))
      .catch(()   => setRecommended([]))
      .finally(() => setRecLoading(false));
  }, [branch, batch]);

  useEffect(() => { setPage(1); }, [search, category, location, role]);

  // Press "/" anywhere on the page to jump into search — a small, common
  // power-user pattern that costs nothing and feels considered.
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
    const sm = d.companyName?.toLowerCase().includes(q) ||
               d.jobRole?.toLowerCase().includes(q);
    const cm = category === "All" || d.category === category;
    const lm = location === "All" || d.location === location;
    const rm = role     === "All" || d.jobRole  === role;
    return sm && cm && lm && rm;
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
    setBranch("");
    setBatch("");
    setRecommended([]);
    setShowBanner(true);
  };

  const handleClearFilters = () => {
    setSearch(""); setCategory("All"); setLocation("All"); setRole("All");
  };

  const handleHeroCategoryClick = (label) => {
    const mapped = HERO_CATEGORY_MAP[label];
    if (mapped) setCategory(mapped);
    scrollToBrowse();
  };

  const lastFavDrive = drives.find((d) => d.id === lastAddedId) || null;

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
              className="fd-search"
              placeholder="Search companies, roles, locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={t.kbdHint}>/</span>
          </div>

          <button style={t.darkBtn} className="fd2-focus" onClick={() => setDark(!dark)} title="Toggle theme">
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

        {/* ── PROFILE BANNER ── */}
        {showBanner && (
          <div style={t.banner}>
            <div style={t.bannerInner}>
              <div style={t.bannerLeft}>
                <div style={t.bannerIcon}>✨</div>
                <div>
                  <div style={t.bannerTitle}>Get personalised drive recommendations</div>
                  <div style={t.bannerSub}>Tell us your department and batch — we'll surface the most relevant drives for you.</div>
                </div>
              </div>
              <div style={t.bannerControls} className="fd-banner-controls">
                <select
                  style={t.bannerSelect}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select department</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select
                  style={t.bannerSelect}
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                >
                  <option value="">Select batch</option>
                  {BATCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <button
                  className="fd2-focus"
                  style={{
                    ...t.bannerBtn,
                    opacity: branch && batch ? 1 : 0.45,
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

            <div style={t.card} className="fd2-glass-card">
              <p style={t.filterHeading}>Location</p>
              <select
                style={t.dropDown}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="All">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              <p style={{ ...t.filterHeading, marginTop: "18px" }}>Job role</p>
              <select
                style={t.dropDown}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="All">All roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {!showBanner && branch && batch && (
                <div style={t.profileChip}>
                  <span style={t.profileChipText}>{branch} · {batch}</span>
                  <button style={t.profileChipReset} className="fd2-focus" onClick={handleResetProfile} title="Change">
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Expiring Soon */}
            <div style={t.card} className="fd2-glass-card">
              <PanelHeader
                tk={tk}
                iconBg={tk.warning + "20"}
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
                iconBg={tk.pink + "20"}
                title="Saved drives"
                badge={favorites.size}
                onClick={() => navigate("/saved-drives")}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={tk.pink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                }
              />

              {!lastFavDrive ? (
                <p style={{ fontSize: "12px", color: tk.textMuted, marginTop: "2px", lineHeight: "1.6" }}>
                  Tap the heart on any drive card to save it here.
                </p>
              ) : (
                <div>
                  <div
                    style={t.favItem}
                    className="fd2-fav-row"
                    onClick={() => navigate(`/drives/${lastFavDrive.id}`)}
                  >
                    <div style={t.favDot}>
                      {lastFavDrive.companyName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={t.favCompany}>{lastFavDrive.companyName}</div>
                      <div style={t.favRole}>{lastFavDrive.jobRole}</div>
                    </div>
                    <button
                      style={t.favRemove}
                      className="fd2-focus"
                      title="Remove"
                      onClick={(e) => { e.stopPropagation(); toggleFav(lastFavDrive.id); }}
                    >
                      ✕
                    </button>
                  </div>

                  {favorites.size > 1 && (
                    <button
                      style={t.favMoreBtn}
                      className="fd2-focus"
                      onClick={() => navigate("/saved-drives")}
                    >
                      +{favorites.size - 1} more saved →
                    </button>
                  )}
                </div>
              )}
            </div>

          </aside>

          {/* FEED */}
          <main style={t.feed}>

            {/* ── RECOMMENDED SECTION (SLIDER) ── */}
            {!showBanner && branch && batch && (
              <section style={t.recSection}>
                <div style={t.feedHeader}>
                  <div>
                    <div style={t.feedTitle}>
                      <span style={t.eyebrowDot} /> Recommended for {branch} · {batch}
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
                    <div style={t.recTrack}>
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
                  <div style={t.sliderWrap} className="fd-slider-wrap">
                    <button
                      style={{ ...t.sliderArrow, left: "-16px" }}
                      className="fd-slider-arrow fd2-focus"
                      onClick={() => scrollRec(-1)}
                      aria-label="Scroll left"
                    >
                      ‹
                    </button>

                    <div ref={recTrackRef} style={t.recTrack}>
                      {recommended.map((drive, i) => (
                        <div
                          key={drive.id}
                          className="fd2-card-in"
                          style={{ ...t.recCardWrap, animationDelay: `${i * 40}ms` }}
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

                    <button
                      style={{ ...t.sliderArrow, right: "-16px" }}
                      className="fd-slider-arrow fd2-focus"
                      onClick={() => scrollRec(1)}
                      aria-label="Scroll right"
                    >
                      ›
                    </button>
                  </div>
                )}

                <div style={t.recDivider} />
              </section>
            )}

            {/* ── ALL DRIVES ── */}
            <div ref={browseDrivesRef}>
              <div style={t.feedHeader}>
                <div>
                  <div style={t.feedTitle}><span style={t.eyebrowDot} /> Open drives</div>
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
              <div style={t.grid} className="fd-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} tk={tk} />
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={t.emptyState}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 700, color: tk.text, marginBottom: 4 }}>No drives match these filters</div>
                <div style={{ marginBottom: 16 }}>Try widening your search or clearing filters.</div>
                <button className="fd2-focus" style={t.clearFiltersBtn} onClick={handleClearFilters}>
                  Clear filters
                </button>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div style={t.grid} className="fd-grid">
                {pageDrives.map((drive, i) => (
                  <div key={drive.id} className="fd2-card-in" style={{ animationDelay: `${i * 35}ms` }}>
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

            {!loading && totalPages > 1 && (
              <div style={t.pagination}>
                <button
                  className="fd2-page-btn fd2-focus"
                  style={{ ...t.pageBtn, ...(page === 1 ? t.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="fd2-page-btn fd2-focus"
                    style={{ ...t.pageBtn, ...(n === page ? t.pageBtnActive : {}) }}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}

                <button
                  className="fd2-page-btn fd2-focus"
                  style={{ ...t.pageBtn, ...(page === totalPages ? t.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function buildStyles(tk) {
  return {
    page: {
      minHeight: "100vh",
      background: tk.bg,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      position: "relative",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 50,
      background: tk.glass,
      borderBottom: `0.5px solid ${tk.divider}`,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "12px 24px",
      display: "flex", alignItems: "center", gap: "14px",
    },
    searchWrap: { flex: 1, position: "relative" },
    searchIcon: {
      position: "absolute", left: "12px", top: "50%",
      transform: "translateY(-50%)", color: tk.textMuted, pointerEvents: "none",
    },
    search: {
      width: "100%", padding: "9px 38px 9px 36px",
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "10px", fontSize: "13.5px",
      fontFamily: "inherit", letterSpacing: "-0.1px",
      background: tk.inputBg, color: tk.text,
      outline: "none", boxSizing: "border-box",
    },
    kbdHint: {
      position: "absolute", right: "10px", top: "50%",
      transform: "translateY(-50%)", fontSize: "10.5px", fontWeight: "600",
      color: tk.textMuted, border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "5px", padding: "1px 6px", pointerEvents: "none",
    },
    darkBtn: {
      background: "transparent",
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "9px", padding: "7px 9px", cursor: "pointer",
      color: tk.textSecondary, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    },
    banner: { background: tk.glass, borderBottom: `0.5px solid ${tk.divider}`, padding: "14px 24px" },
    bannerInner: {
      maxWidth: "1300px", margin: "0 auto",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
    },
    bannerLeft: { display: "flex", alignItems: "center", gap: "14px" },
    bannerIcon: { fontSize: "20px", flexShrink: 0 },
    bannerTitle: { fontSize: "13.5px", fontWeight: "700", color: tk.text, letterSpacing: "-0.2px" },
    bannerSub: { fontSize: "12.5px", color: tk.textSecondary, marginTop: "2px" },
    bannerControls: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
    bannerSelect: {
      padding: "8px 12px", fontSize: "13px",
      border: `0.5px solid ${tk.glassBorder}`, borderRadius: "9px",
      fontFamily: "inherit", background: tk.inputBg,
      color: tk.text, outline: "none", cursor: "pointer",
      colorScheme: tk === DARK ? "dark" : "light",
    },
    bannerBtn: {
      padding: "8px 18px", fontSize: "13px", fontWeight: "700",
      background: tk.gradient, color: "white",
      border: "none", borderRadius: "9px", cursor: "pointer", whiteSpace: "nowrap",
    },
    layout: {
      display: "grid", gridTemplateColumns: "230px 1fr",
      gap: "18px", padding: "22px 24px",
      maxWidth: "1300px", margin: "0 auto",
    },
    sidebar: {
      display: "flex", flexDirection: "column", gap: "14px",
      position: "sticky", top: "78px", height: "fit-content",
    },
    card: {
      background: tk.glass,
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "16px", padding: "16px",
      boxShadow: tk.shadow,
    },
    filterHeading: {
      fontSize: "10.5px", fontWeight: "700", color: tk.textMuted,
      textTransform: "uppercase", letterSpacing: "0.7px",
      marginBottom: "8px", marginTop: 0,
    },
    dropDown: {
      width: "100%", padding: "9px 10px",
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "9px", fontSize: "13px",
      fontFamily: "inherit", letterSpacing: "-0.1px",
      background: tk.inputBg, color: tk.text,
      outline: "none", cursor: "pointer",
      colorScheme: tk === DARK ? "dark" : "light",
    },
    profileChip: {
      marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: tk.accent + "1A", border: `0.5px solid ${tk.accent}40`,
      borderRadius: "9px", padding: "7px 10px",
    },
    profileChipText: { fontSize: "12px", fontWeight: "700", color: tk.accentLight },
    profileChipReset: {
      background: "none", border: "none", cursor: "pointer",
      color: tk.textMuted, fontSize: "11px", padding: "0 2px", lineHeight: 1,
    },
    favItem: {
      display: "flex", alignItems: "center", gap: "8px",
      padding: "8px 6px", borderRadius: "9px", cursor: "pointer",
    },
    favDot: {
      width: "28px", height: "28px", borderRadius: "8px",
      background: tk.accent + "1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "13px", fontWeight: "700", color: tk.accentLight, flexShrink: 0,
    },
    favCompany: {
      fontSize: "12.5px", fontWeight: "700", color: tk.text,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    favRole: {
      fontSize: "11px", color: tk.textMuted,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    favRemove: {
      background: "none", border: "none", cursor: "pointer",
      color: tk.textMuted, fontSize: "11px", padding: "2px 4px", flexShrink: 0,
    },
    favMoreBtn: {
      display: "block", width: "100%", marginTop: "8px",
      padding: "8px 0", fontSize: "12px", fontWeight: "700",
      color: tk.accentLight, background: "transparent",
      border: `1px dashed ${tk.accent}50`, borderRadius: "9px",
      cursor: "pointer", fontFamily: "inherit", textAlign: "center",
    },
    feed: { minWidth: 0 },
    recSection: { marginBottom: "8px" },
    feedHeader: {
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: "14px", gap: "12px", flexWrap: "wrap",
    },
    feedTitle: {
      fontSize: "18px", fontWeight: "700", letterSpacing: "-0.4px",
      color: tk.text, lineHeight: "1.2", display: "flex", alignItems: "center", gap: "8px",
    },
    eyebrowDot: {
      width: "7px", height: "7px", borderRadius: "50%",
      background: tk.gradient, flexShrink: 0, boxShadow: `0 0 0 3px ${tk.accent}22`,
    },
    feedSub: { fontSize: "12.5px", color: tk.textMuted, marginTop: "3px", letterSpacing: "-0.1px" },
    countBadge: {
      fontSize: "12px", color: tk.textSecondary,
      background: tk.accent + "14", padding: "5px 13px",
      borderRadius: "999px", border: `0.5px solid ${tk.accent}33`,
      fontWeight: "600", whiteSpace: "nowrap", alignSelf: "center",
    },
    sliderWrap: { position: "relative", padding: "0 18px", marginBottom: "4px" },
    recTrack: {
      display: "flex", gap: "14px", overflowX: "auto", scrollBehavior: "smooth",
      paddingBottom: "10px", scrollbarWidth: "none", msOverflowStyle: "none",
    },
    recCardWrap: { minWidth: "270px", maxWidth: "270px", flexShrink: 0 },
    sliderArrow: {
      position: "absolute", top: "40%", transform: "translateY(-50%)",
      width: "32px", height: "32px",
      background: tk.glass, border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "50%", fontSize: "18px", textAlign: "center",
      cursor: "pointer", zIndex: 2, color: tk.textSecondary,
      boxShadow: tk.shadow,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
    },
    recDivider: { borderTop: `0.5px solid ${tk.divider}`, margin: "22px 0 26px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
      gap: "14px",
    },
    emptyState: {
      padding: "56px 20px", textAlign: "center",
      color: tk.textMuted, fontSize: "13.5px", letterSpacing: "-0.1px",
    },
    clearFiltersBtn: {
      padding: "8px 18px", fontSize: "13px", fontWeight: "700",
      background: tk.accent + "1A", color: tk.accentLight,
      border: `0.5px solid ${tk.accent}40`, borderRadius: "9px",
      cursor: "pointer", fontFamily: "inherit",
    },
    pagination: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "6px", marginTop: "32px", paddingBottom: "8px", flexWrap: "wrap",
    },
    pageBtn: {
      padding: "8px 14px", fontSize: "13px", fontWeight: "600",
      fontFamily: "inherit", letterSpacing: "-0.1px",
      border: `0.5px solid ${tk.glassBorder}`,
      borderRadius: "9px", cursor: "pointer",
      background: tk.glass, color: tk.textSecondary,
    },
    pageBtnActive: {
      background: tk.gradient, borderColor: "transparent",
      color: "white", fontWeight: "700",
    },
    pageBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  };
}
