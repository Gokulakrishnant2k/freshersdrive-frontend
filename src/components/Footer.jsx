import { Link } from "react-router-dom";

// ── Social links — replace placeholders with real URLs when ready ──────────
const socialLinks = {
  instagram: "https://instagram.com/your_handle_here",
  youtube: "https://youtube.com/@your_channel_here",
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.inner} className="fd-footer-inner">

        {/* Brand */}
        <div style={styles.brandCol}>
          <div style={styles.logo}>FreshersDrive</div>
          <p style={styles.tagline}>
            Placement drive tracker for freshers — find drives, track deadlines,
            never miss an opportunity.
          </p>
        </div>

        {/* Quick links */}
        <div style={styles.col}>
          <div style={styles.colTitle}>Explore</div>
          <Link to="/" style={styles.footerLink}>Drives</Link>
          <Link to="/calendar" style={styles.footerLink}>Calendar</Link>
          <Link to="/saved-drives" style={styles.footerLink}>Saved</Link>
          <Link to="/contact" style={styles.footerLink}>Contact</Link>
        </div>

        {/* Social */}
        <div style={styles.col}>
          <div style={styles.colTitle}>Follow us</div>

          <div style={styles.socialRow} className="fd-footer-social">

            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
              aria-label="Instagram"
              title="Instagram"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIcon}
              aria-label="YouTube"
              title="YouTube"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>

          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <span style={styles.copyright}>
          © {year} FreshersDrive. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#0f172a",
    color: "#cbd5e1",
    fontFamily: "'Inter', system-ui, sans-serif",
    marginTop: "40px",
  },

  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px 28px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "32px",
  },

  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "320px",
  },

  logo: {
    fontWeight: "800",
    fontSize: "17px",
    color: "#38bdf8",
    letterSpacing: "0.6px",
  },

  tagline: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0,
  },

  col: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  colTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },

  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "13px",
  },

  socialRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  socialIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    color: "#94a3b8",
    background: "rgba(255,255,255,0.05)",
    transition: "all 0.2s ease",
  },

  bottomBar: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "16px 24px",
    textAlign: "center",
  },

  copyright: {
    fontSize: "12px",
    color: "#64748b",
  },
};