import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import DriveCard from "../components/DriveCard";
import ExpiringDrives from "./ExpiringDrives";
import useFavorites from "../../UseFavorites";
import Hero from "./Hero";

const CATEGORIES = ["All", "IT_SOFTWARE", "CORE_ENGINEERING", "GOVERNMENT", "BANKING", "MANAGEMENT", "INTERNSHIP"];
const PAGE_SIZE = 9;

const CATEGORY_LABELS = {
  All:              "All Categories",
  IT_SOFTWARE:      "IT / Software",
  CORE_ENGINEERING: "Core Engineering",
  GOVERNMENT:       "Government",
  BANKING:          "Banking",
  MANAGEMENT:       "Management",
  INTERNSHIP:       "Internship",
};

const BRANCH_OPTIONS = [
  "CSE", "ECE", "EEE", "IT", "MECH", "CIVIL", "CHEM", "AIDS",
  "AIML", "CSD", "IOT", "BME", "AERO", "AUTO", "OTHER",
];

const BATCH_OPTIONS = ["2025", "2026", "2027", "2028"];

const PROFILE_KEY = "fd_user_profile";

export default function Home() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();

  // ── Scroll refs for Hero buttons ──────────────────────────────────────────
  const browseDrivesRef  = useRef(null);
  const howItWorksRef    = useRef(null);

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

  // ── User profile (branch + batch) ────────────────────────────────────────
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
  })();
  const [branch,      setBranch]      = useState(savedProfile.branch || "");
  const [batch,       setBatch]       = useState(savedProfile.batch  || "");
  const [showBanner,  setShowBanner]  = useState(!savedProfile.branch || !savedProfile.batch);
  const [recommended, setRecommended] = useState([]);
  const [recLoading,  setRecLoading]  = useState(false);

  // ── Favorites ─────────────────────────────────────────────────────────────
  const { favorites, toggleFav, lastAddedId } = useFavorites();

  // ── Recommended slider ref ────────────────────────────────────────────────
  const recTrackRef = useRef(null);
  const scrollRec = (dir) => {
    recTrackRef.current?.scrollBy({ left: dir * 290, behavior: "smooth" });
  };

  // ── Data ──────────────────────────────────────────────────────────────────
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

  const lastFavDrive = drives.find((d) => d.id === lastAddedId) || null;

  const t = dark ? dm : s;

  return (
    <div style={t.page}>

      {/* ── HERO ── */}
      <Hero
        dark={dark}
        onBrowseClick={scrollToBrowse}
        onHowItWorksClick={scrollToHowItWorks}
      />

      {/* ── TOP BAR ── */}
      <header style={t.topbar} className="fd-topbar">
        <div style={t.brand}>
          <div style={s.brandIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="fd-brand-text">FreshersDrive</span>
        </div>

        <div style={s.searchWrap}>
          <svg style={s.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={t.search}
            className="fd-search"
            placeholder="Search companies, roles, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      {/* ── PROFILE BANNER ── */}
      {showBanner && (
        <div style={t.banner}>
          <div style={s.bannerInner}>
            <div style={s.bannerLeft}>
              <div style={s.bannerIcon}>✨</div>
              <div>
                <div style={t.bannerTitle}>Get personalised drive recommendations</div>
                <div style={t.bannerSub}>Tell us your department and batch — we'll surface the most relevant drives for you.</div>
              </div>
            </div>
            <div style={s.bannerControls} className="fd-banner-controls">
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
                style={{
                  ...s.bannerBtn,
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
      <div style={s.layout} className="fd-layout">

        {/* LEFT SIDEBAR */}
        <aside style={s.sidebar} className="fd-sidebar">

          <div style={t.card}>
            {/* Category */}
            <p style={s.filterHeading}>Category</p>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                style={{ ...t.filterBtn, ...(category === c ? t.filterBtnActive : {}) }}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c] || c}
              </button>
            ))}

            {/* Location */}
            <p style={{ ...s.filterHeading, marginTop: "20px" }}>Location</p>
            <select
              style={t.dropDown}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            {/* Role */}
            <p style={{ ...s.filterHeading, marginTop: "20px" }}>Job Role</p>
            <select
              style={t.dropDown}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Profile chip */}
            {!showBanner && branch && batch && (
              <div style={t.profileChip}>
                <span style={s.profileChipText}>
                  {branch} · {batch}
                </span>
                <button style={s.profileChipReset} onClick={handleResetProfile} title="Change">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Expiring Soon */}
          <div style={t.card}>
            <div style={s.expiringHeader}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={t.expiringTitle}>Expiring soon</span>
            </div>
            <ExpiringDrives />
          </div>

          {/* ── SAVED DRIVES PANEL ── */}
          <div style={t.card}>
            <div
              style={s.expiringHeaderClickable}
              onClick={() => navigate("/saved-drives")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate("/saved-drives"); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span style={t.expiringTitle}>Saved drives</span>
              {favorites.size > 0 && (
                <span style={s.favCountBadge}>{favorites.size}</span>
              )}
              <span style={s.favViewAll}>View all ›</span>
            </div>

            {!lastFavDrive ? (
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", lineHeight: "1.5" }}>
                Tap the heart on any drive card to save it here.
              </p>
            ) : (
              <div style={{ marginTop: "4px" }}>
                <div
                  style={t.favItem}
                  onClick={() => navigate(`/drives/${lastFavDrive.id}`)}
                >
                  <div style={s.favDot}>
                    {lastFavDrive.companyName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={t.favCompany}>{lastFavDrive.companyName}</div>
                    <div style={s.favRole}>{lastFavDrive.jobRole}</div>
                  </div>
                  <button
                    style={s.favRemove}
                    title="Remove"
                    onClick={(e) => { e.stopPropagation(); toggleFav(lastFavDrive.id); }}
                  >
                    ✕
                  </button>
                </div>

                {favorites.size > 1 && (
                  <button
                    style={s.favMoreBtn}
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
        <main style={s.feed}>

          {/* ── RECOMMENDED SECTION (SLIDER) ── */}
          {!showBanner && branch && batch && (
            <section style={s.recSection}>
              <div style={s.feedHeader}>
                <div>
                  <div style={t.feedTitle}>
                    <span style={s.recStar}>★</span> Recommended for {branch} · {batch}
                  </div>
                  <div style={t.feedSub}>Drives matching your department and batch year</div>
                </div>
                {!recLoading && (
                  <span style={{ ...t.countBadge, background: dark ? "#1e3a5f" : "#eff6ff", borderColor: dark ? "#1d4ed8" : "#bfdbfe", color: dark ? "#93c5fd" : "#1d4ed8" }}>
                    {recommended.length} match{recommended.length !== 1 ? "es" : ""}
                  </span>
                )}
              </div>

              {recLoading && <div style={s.state}>Finding your matches…</div>}

              {!recLoading && recommended.length === 0 && (
                <div style={s.state}>No drives match your department/batch yet — check back soon.</div>
              )}

              {!recLoading && recommended.length > 0 && (
                <div style={s.sliderWrap} className="fd-slider-wrap">
                  <button
                    style={{ ...s.sliderArrow, left: "-16px" }}
                    className="fd-slider-arrow"
                    onClick={() => scrollRec(-1)}
                    aria-label="Scroll left"
                  >
                    ‹
                  </button>

                  <div ref={recTrackRef} style={t.recTrack}>
                    {recommended.map((drive) => (
                      <div key={drive.id} style={s.recCardWrap}>
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
                    style={{ ...s.sliderArrow, right: "-16px" }}
                    className="fd-slider-arrow"
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
          {/* ref here so "Browse drives" in Hero scrolls to this section */}
          <div ref={browseDrivesRef} style={s.feedHeader}>
            <div>
              <div style={t.feedTitle}>Open Drives</div>
              <div style={t.feedSub}>Freshest opportunities, updated daily</div>
            </div>
            <span style={t.countBadge}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ref here so "See how it works" in Hero scrolls to filters */}
          <div ref={howItWorksRef} />

          {loading && <div style={s.state}>Loading opportunities…</div>}

          {!loading && filtered.length === 0 && (
            <div style={s.state}>No drives match your filters.</div>
          )}

          <div style={s.grid} className="fd-grid">
            {pageDrives.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                dark={dark}
                favorites={favorites}
                onToggleFav={toggleFav}
              />
            ))}
          </div>

          {!loading && totalPages > 1 && (
            <div style={s.pagination}>
              <button
                style={{ ...t.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  style={{ ...t.pageBtn, ...(n === page ? s.pageBtnActive : {}) }}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}

              <button
                style={{ ...t.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
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
    display: "flex", alignItems: "center", gap: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  brand: {
    display: "flex", alignItems: "center", gap: "9px",
    fontSize: "15px", fontWeight: "700",
    letterSpacing: "-0.4px", color: "#0f172a", whiteSpace: "nowrap",
  },
  brandIcon: {
    width: "30px", height: "30px", background: "#1d4ed8",
    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  searchWrap: { flex: 1, position: "relative" },
  searchIcon: {
    position: "absolute", left: "12px", top: "50%",
    transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none",
  },
  search: {
    width: "100%", padding: "9px 14px 9px 36px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px", fontSize: "13.5px",
    fontFamily: "inherit", letterSpacing: "-0.1px",
    background: "#f8fafc", color: "#0f172a",
    outline: "none", boxSizing: "border-box",
  },
  darkBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", padding: "6px 8px", cursor: "pointer",
    color: "#64748b", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },

  // ── Banner ──
  bannerInner: {
    maxWidth: "1300px", margin: "0 auto",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "20px",
    flexWrap: "wrap",
  },
  bannerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  bannerIcon: { fontSize: "22px", flexShrink: 0 },
  bannerTitle: {
    fontSize: "14px", fontWeight: "700",
    color: "#0f172a", letterSpacing: "-0.3px",
  },
  bannerSub: { fontSize: "12.5px", color: "#64748b", marginTop: "2px" },
  bannerControls: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  bannerSelect: {
    padding: "8px 12px", fontSize: "13px",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    fontFamily: "inherit", background: "white",
    color: "#0f172a", outline: "none", cursor: "pointer",
  },
  bannerBtn: {
    padding: "8px 18px", fontSize: "13px", fontWeight: "600",
    background: "#1d4ed8", color: "white",
    border: "none", borderRadius: "8px", cursor: "pointer",
    whiteSpace: "nowrap",
  },

  layout: {
    display: "grid", gridTemplateColumns: "220px 1fr",
    gap: "18px", padding: "20px 24px",
    maxWidth: "1300px", margin: "0 auto",
  },
  sidebar: {
    display: "flex", flexDirection: "column", gap: "14px",
    position: "sticky", top: "62px", height: "fit-content",
  },
  card: {
    background: "white",
    border: "1px solid #f1f5f9",
    borderRadius: "14px", padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  filterHeading: {
    fontSize: "10.5px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.7px",
    marginBottom: "8px", marginTop: 0,
  },
  filterBtn: {
    display: "block", width: "100%", padding: "7px 10px",
    marginBottom: "3px",
    border: "1px solid transparent",
    borderRadius: "8px", fontSize: "13px",
    fontFamily: "inherit", letterSpacing: "-0.1px",
    textAlign: "left", cursor: "pointer",
    background: "transparent", color: "#64748b",
    transition: "background 0.12s, color 0.12s",
  },
  filterBtnActive: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8", fontWeight: "600",
  },
  dropDown: {
    width: "100%", padding: "8px 10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", fontSize: "13px",
    fontFamily: "inherit", letterSpacing: "-0.1px",
    background: "#f8fafc", color: "#0f172a",
    outline: "none", cursor: "pointer",
  },
  profileChipText: {
    fontSize: "12px", fontWeight: "600", color: "#1d4ed8",
  },
  profileChipReset: {
    background: "none", border: "none", cursor: "pointer",
    color: "#94a3b8", fontSize: "11px", padding: "0 2px",
    lineHeight: 1,
  },
  expiringHeader: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" },
  expiringHeaderClickable: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", cursor: "pointer" },
  expiringTitle: {
    fontSize: "13px", fontWeight: "700",
    letterSpacing: "-0.2px", color: "#0f172a",
  },

  // ── Favorites ──
  favCountBadge: {
    marginLeft: "6px",
    fontSize: "11px", fontWeight: "600",
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#b91c1c", borderRadius: "99px",
    padding: "1px 7px",
  },
  favViewAll: {
    marginLeft: "auto",
    fontSize: "11px", fontWeight: "600",
    color: "#1d4ed8", whiteSpace: "nowrap",
  },
  favItem: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "7px 0",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
  },
  favCompany: {
    fontSize: "12.5px", fontWeight: "600", color: "#0f172a",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  favDot: {
    width: "28px", height: "28px", borderRadius: "8px",
    background: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700", color: "#1d4ed8",
    flexShrink: 0,
  },
  favRole: {
    fontSize: "11px", color: "#94a3b8",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  favRemove: {
    background: "none", border: "none", cursor: "pointer",
    color: "#94a3b8", fontSize: "11px", padding: "2px 4px",
    flexShrink: 0,
  },
  favMoreBtn: {
    display: "block", width: "100%", marginTop: "8px",
    padding: "7px 0", fontSize: "12px", fontWeight: "600",
    color: "#1d4ed8", background: "transparent",
    border: "1px dashed #bfdbfe", borderRadius: "8px",
    cursor: "pointer", fontFamily: "inherit", textAlign: "center",
  },

  feed: { minWidth: 0 },

  // ── Slider ──
  sliderWrap: {
    position: "relative",
    padding: "0 20px",
  },
  recTrack: {
    display: "flex",
    gap: "14px",
    overflowX: "auto",
    scrollBehavior: "smooth",
    paddingBottom: "10px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  recCardWrap: {
    minWidth: "270px",
    maxWidth: "270px",
    flexShrink: 0,
  },
  sliderArrow: {
    position: "absolute", top: "40%", transform: "translateY(-50%)",
    width: "32px", height: "32px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "50%",
    fontSize: "20px", lineHeight: "30px", textAlign: "center",
    cursor: "pointer", zIndex: 2,
    color: "#374151",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 0,
  },

  recSection: { marginBottom: "28px" },
  recStar: { color: "#f59e0b", marginRight: "4px" },

  feedHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: "16px",
  },
  feedTitle: {
    fontSize: "17px", fontWeight: "700",
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
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "6px", marginTop: "32px", paddingBottom: "8px", flexWrap: "wrap",
  },
  pageBtn: {
    padding: "7px 13px", fontSize: "13px", fontWeight: "500",
    fontFamily: "inherit", letterSpacing: "-0.1px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px", cursor: "pointer",
    background: "white", color: "#374151",
    transition: "background 0.15s, border-color 0.15s",
  },
  pageBtnActive: {
    background: "#1d4ed8", borderColor: "#1d4ed8",
    color: "white", fontWeight: "600",
  },
  pageBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },
};

s.banner      = { background: "#eff6ff", borderBottom: "1px solid #dbeafe", padding: "14px 24px" };
s.profileChip = { marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "6px 10px" };
s.recDivider  = { borderTop: "1px solid #e2e8f0", margin: "24px 0 20px" };

// ── DARK ─────────────────────────────────────────────────────────────────────
const dm = {
  ...s,
  page:            { ...s.page,            background: "#0f172a" },
  topbar:          { ...s.topbar,          background: "#1e293b", borderBottom: "1px solid #334155", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" },
  brand:           { ...s.brand,           color: "#f1f5f9" },
  search:          { ...s.search,          background: "#0f172a", borderColor: "#334155", color: "#f1f5f9" },
  darkBtn:         { ...s.darkBtn,         borderColor: "#334155", color: "#94a3b8" },
  card:            { ...s.card,            background: "#1e293b", borderColor: "#334155", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
  filterBtn:       { ...s.filterBtn,       color: "#94a3b8" },
  filterBtnActive: { ...s.filterBtnActive, background: "#1e3a5f", borderColor: "#1d4ed8", color: "#93c5fd" },
  dropDown:        { ...s.dropDown,        background: "#0f172a", borderColor: "#334155", color: "#f1f5f9" },
  expiringTitle:   { ...s.expiringTitle,   color: "#f1f5f9" },
  feedTitle:       { ...s.feedTitle,       color: "#f1f5f9" },
  feedSub:         { ...s.feedSub,         color: "#64748b" },
  countBadge:      { ...s.countBadge,      background: "#1e293b", borderColor: "#334155", color: "#94a3b8" },
  pageBtn:         { ...s.pageBtn,         background: "#1e293b", borderColor: "#334155", color: "#94a3b8" },
  banner:          { background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 24px" },
  bannerTitle:     { ...s.bannerTitle,     color: "#f1f5f9" },
  bannerSub:       { ...s.bannerSub,       color: "#64748b" },
  bannerSelect:    { ...s.bannerSelect,    background: "#0f172a", borderColor: "#334155", color: "#f1f5f9" },
  profileChip:     { marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e3a5f", border: "1px solid #1d4ed8", borderRadius: "8px", padding: "6px 10px" },
  recDivider:      { borderTop: "1px solid #334155", margin: "24px 0 20px" },
  recTrack:        { ...s.recTrack },
  favItem:         { ...s.favItem,         borderBottom: "1px solid #334155" },
  favCompany:      { ...s.favCompany,      color: "#f1f5f9" },
};