import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const socialLinks = {
  instagram: "https://instagram.com/your_handle_here",
  youtube:   "https://youtube.com/@your_channel_here",
};

export default function Navbar() {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const isAdmin    = auth.role === "ROLE_ADMIN";
  const isEmployee = auth.role === "ROLE_EMPLOYEE";

  return (
    <div style={styles.nav}>
      <div style={styles.topRow}>
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          FreshersDrive
        </Link>
        <button
          className="fd-navbar-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className={`fd-navbar-panel${menuOpen ? " open" : ""}`} style={styles.panel}>
        {auth.user && (
          <div className="fd-navbar-links" style={styles.links}>
            <Link to="/" onClick={closeMenu} style={{ ...styles.link, ...(isActive("/") ? styles.active : {}) }}>Drives</Link>
            <Link to="/Updates" onClick={closeMenu} style={{ ...styles.link, ...(isActive("/Updates") ? styles.active : {}) }}>Updates</Link>
            <Link to="/calendar" onClick={closeMenu} style={{ ...styles.link, ...(isActive("/calendar") ? styles.active : {}) }}>Calendar</Link>
            <Link to="/saved-drives" onClick={closeMenu} style={{ ...styles.link, ...(isActive("/saved-drives") ? styles.active : {}) }}>Saved</Link>
            <Link to="/contact" onClick={closeMenu} style={{ ...styles.link, ...(isActive("/contact") ? styles.active : {}) }}>Contact</Link>
            {/* Admin dashboard link: visible to both Admin and Employee roles.
                AdminDashboard.jsx itself renders an "Admin dashboard" or
                "Employee dashboard" view depending on which role is logged in. */}
            {(isAdmin || isEmployee) && (
              <Link to="/admin" onClick={closeMenu} style={{ ...styles.admin, ...(isActive("/admin") ? styles.activeAdmin : {}) }}>
                {isAdmin ? "Admin" : "Dashboard"}
              </Link>
            )}
          </div>
        )}

        <div className="fd-navbar-right" style={styles.right}>
          <div className="fd-navbar-social" style={styles.socialRow}>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={styles.socialIcon} aria-label="Instagram" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={styles.socialIcon} aria-label="YouTube" title="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>

          {!auth.user ? (
            <>
              <Link style={styles.link} to="/login" onClick={closeMenu}>Login</Link>
              <Link style={styles.primary} to="/register" onClick={closeMenu}>Register</Link>
            </>
          ) : (
            <>
              <div style={styles.userBox}>
                <span style={styles.avatar}>👤</span>
                <span style={styles.user}>{auth.user.name}</span>
              </div>
              <button style={styles.logout} onClick={() => { closeMenu(); logout(); }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  nav: {
    display: "flex", flexDirection: "column",
    padding: "12px 24px",
    background: "rgba(15, 23, 42, 0.92)",
    backdropFilter: "blur(12px)",
    color: "white", position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  panel: { display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, marginLeft: "24px" },
  links: { display: "flex", alignItems: "center", gap: "14px" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  socialRow: { display: "flex", alignItems: "center", gap: "6px", paddingRight: "8px", marginRight: "4px", borderRight: "1px solid rgba(255,255,255,0.12)" },
  socialIcon: { display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", color: "#94a3b8", background: "rgba(255,255,255,0.05)" },
  logo: { fontWeight: "800", fontSize: "18px", color: "#38bdf8", textDecoration: "none", letterSpacing: "0.6px" },
  link: { color: "#cbd5e1", textDecoration: "none", fontSize: "14px", padding: "6px 10px", borderRadius: "8px" },
  active: { color: "#38bdf8", fontWeight: "600" },
  admin: { color: "#fbbf24", textDecoration: "none", fontSize: "14px", padding: "6px 10px", borderRadius: "8px", fontWeight: "600" },
  activeAdmin: { background: "rgba(251, 191, 36, 0.12)" },
  primary: { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", padding: "7px 12px", borderRadius: "10px", textDecoration: "none", fontSize: "14px" },
  logout: { background: "#ef4444", color: "white", border: "none", padding: "7px 12px", borderRadius: "10px", cursor: "pointer" },
  userBox: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.08)" },
  avatar: { fontSize: "14px" },
  user: { fontSize: "13px", color: "#e2e8f0" },
};