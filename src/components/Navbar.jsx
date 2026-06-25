// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { INK, MUTED, HAIRLINE, STATUS_INK, ACCENTS, getAccent } from "../utils/ticketTheme";
import Logo from "./Logo";

// ── Social links ────────────────────────────────────────────────────────────
const socialLinks = {
  instagram: "https://www.instagram.com/fresherspot/?hl=en-in",
  youtube:   "https://www.youtube.com/@FresherSpot",
  linkedin:  "https://www.linkedin.com/company/fresherspot", 
};

const BRAND_ACCENT = getAccent("FresherSpot");

const NAV_ITEMS = [
  { to: "/",             label: "Drives"   },
  { to: "/Updates",      label: "Updates"  },
  { to: "/calendar",     label: "Calendar" },
  { to: "/saved-drives", label: "Saved"    },
  { to: "/contact",      label: "Contact"  },
];

export default function Navbar() {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive  = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const isAdmin    = auth.role === "ROLE_ADMIN";
  const isEmployee = auth.role === "ROLE_EMPLOYEE";

  return (
    <div style={styles.nav} className="fd-navbar">
      <style>{STYLE_BLOCK}</style>

      {/* Livery stripe */}
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: BRAND_ACCENT }}
        aria-hidden="true"
      />

      <div style={styles.topRow}>
        <Link to="/" style={styles.logoLink} onClick={closeMenu}>
          <Logo size={28} textSize={19} />
        </Link>
        <button
          className="fd-navbar-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={styles.toggleBtn}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div
        className={`fd-navbar-panel${menuOpen ? " open" : ""}`}
        style={styles.panel}
        role="navigation"
        aria-label="Main navigation"
      >
        {auth.user && (
          <div className="fd-navbar-links" style={styles.links}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className="fd-nav-link-hover"
                style={{ ...styles.link, ...(isActive(item.to) ? styles.active : {}) }}
                aria-current={isActive(item.to) ? "page" : undefined}
              >
                {isActive(item.to) && (
                  <span style={{ ...styles.activeDot, background: BRAND_ACCENT }} aria-hidden="true" />
                )}
                {item.label}
              </Link>
            ))}

            {/* Admin / Employee dashboard link */}
            {(isAdmin || isEmployee) && (
              <Link
                to="/admin"
                onClick={closeMenu}
                style={{ ...styles.admin, ...(isActive("/admin") ? styles.activeAdmin : {}) }}
                aria-current={isActive("/admin") ? "page" : undefined}
              >
                {isAdmin ? "Admin" : "Dashboard"}
              </Link>
            )}
          </div>
        )}

        <div className="fd-navbar-right" style={styles.right}>

          {/* Social icons */}
          <div className="fd-navbar-social" style={styles.socialRow}>

            {/* Instagram */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-nav-social-icon"
              style={styles.socialIcon}
              aria-label="Instagram"
              title="Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-nav-social-icon"
              style={styles.socialIcon}
              aria-label="YouTube"
              title="YouTube"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-nav-social-icon"
              style={styles.socialIcon}
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
                <path d="M8 11v5" />
                <circle cx="8" cy="8" r="0.5" fill="currentColor" />
                <path d="M12 16v-5" />
                <path d="M12 11a3 3 0 0 1 6 0v5" />
              </svg>
            </a>

          </div>

          {/* Auth controls */}
          {!auth.user ? (
            <>
              <Link
                className="fd-nav-link-hover"
                style={styles.link}
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                style={{
                  ...styles.primary,
                  background: BRAND_ACCENT,
                  boxShadow: `0 8px 18px ${BRAND_ACCENT}40`,
                }}
                to="/register"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div style={styles.userBox}>
                <span
                  style={{ ...styles.avatar, background: BRAND_ACCENT + "22", color: BRAND_ACCENT }}
                  aria-hidden="true"
                >
                  {auth.user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
                <span style={styles.user}>{auth.user.name}</span>
              </div>
              <button
                className="fd-nav-logout"
                style={styles.logout}
                onClick={() => { closeMenu(); logout(); }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    padding: "12px 24px",
    background: INK,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },

  panel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    marginLeft: "24px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  socialRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    paddingRight: "10px",
    marginRight: "6px",
    borderRight: `1px solid ${HAIRLINE.dark}`,
  },

  socialIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    color: MUTED.dark,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid transparent",
    transition: "color 0.15s ease, border-color 0.15s ease",
  },

  toggleBtn: {
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${HAIRLINE.dark}`,
    color: "#fff",
    borderRadius: "8px",
    width: "34px",
    height: "34px",
    fontSize: "15px",
    cursor: "pointer",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: MUTED.dark,
    textDecoration: "none",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    padding: "8px 11px",
    borderRadius: "8px",
  },

  active: { color: "#fff" },

  activeDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  admin: {
    color: ACCENTS[6],
    textDecoration: "none",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    padding: "8px 11px",
    borderRadius: "8px",
  },

  activeAdmin: { background: ACCENTS[6] + "1A" },

  primary: {
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "9px",
    textDecoration: "none",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.4px",
  },

  logout: {
    background: STATUS_INK.urgent,
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "9px",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    fontWeight: 700,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 11px 5px 5px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${HAIRLINE.dark}`,
  },

  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },

  user: {
    fontSize: "12.5px",
    color: "#e7ecf5",
    fontWeight: 600,
  },
};

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.fd-navbar a:focus-visible,
.fd-navbar button:focus-visible {
  outline: 2px solid #1C7ED6;
  outline-offset: 2px;
  border-radius: 6px;
}
.fd-navbar .fd-nav-link-hover:hover { color: #fff; }
.fd-navbar .fd-nav-social-icon:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.2);
}
.fd-navbar .fd-nav-logout:hover { filter: brightness(1.1); }

/* Mobile */
@media (max-width: 768px) {
  .fd-navbar-toggle { display: flex !important; }
  .fd-navbar-panel {
    display: none !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px;
    margin-left: 0 !important;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .fd-navbar-panel.open { display: flex !important; }
  .fd-navbar-links {
    flex-direction: column !important;
    align-items: flex-start !important;
    width: 100%;
  }
  .fd-navbar-right {
    flex-direction: column !important;
    align-items: flex-start !important;
    width: 100%;
    gap: 8px !important;
  }
  .fd-navbar-social {
    border-right: none !important;
    padding-right: 0 !important;
    margin-right: 0 !important;
  }
}

/* Desktop: hide toggle */
@media (min-width: 769px) {
  .fd-navbar-toggle { display: none !important; }
  .fd-navbar-panel { display: flex !important; }
}

@media (prefers-reduced-motion: reduce) {
  .fd-navbar * { transition: none !important; }
}
`;