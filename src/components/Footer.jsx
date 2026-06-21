// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { INK, MUTED, HAIRLINE, getAccent, barcodeBars } from "../utils/ticketTheme";

// ── Social links — replace placeholders with real URLs when ready ──────────
const socialLinks = {
  instagram: "https://instagram.com/your_handle_here",
  youtube: "https://youtube.com/@your_channel_here",
};

// Same deterministic accent Navbar computes for "FreshersDrive" — keeps
// both pieces of chrome in step without sharing extra state.
const BRAND_ACCENT = getAccent("FreshersDrive");

export default function Footer() {
  const year = new Date().getFullYear();
  const bars = barcodeBars(`freshersdrive-${year}`, 26);

  return (
    <footer style={styles.footer} className="fd-footer">
      <style>{STYLE_BLOCK}</style>

      {/* Perforation — the same tear-stub motif from every ticket, here
          marking the bottom edge of the page itself. */}
      <div style={styles.perfWrap}>
        <div style={styles.perfLine} />
        <div style={styles.perfNotchLeft} />
        <div style={styles.perfNotchRight} />
      </div>

      <div style={styles.inner} className="fd-footer-inner">

        {/* Brand */}
        <div style={styles.brandCol}>
          <div style={styles.logoRow}>
            <span style={{ ...styles.logoMark, background: BRAND_ACCENT }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="3" stroke="#fff" strokeWidth="2" />
                <circle cx="2.5" cy="12" r="2" fill={INK} />
                <circle cx="21.5" cy="12" r="2" fill={INK} />
              </svg>
            </span>
            <span style={styles.logo}>FreshersDrive</span>
          </div>
          <p style={styles.tagline}>
            Placement drive tracker for freshers — find drives, track deadlines,
            never miss an opportunity.
          </p>
        </div>

        {/* Quick links */}
        <div style={styles.col}>
          <div style={styles.colTitle}>Explore</div>
          <Link to="/" className="fd-footer-link" style={styles.footerLink}>Drives</Link>
          <Link to="/calendar" className="fd-footer-link" style={styles.footerLink}>Calendar</Link>
          <Link to="/saved-drives" className="fd-footer-link" style={styles.footerLink}>Saved</Link>
          <Link to="/contact" className="fd-footer-link" style={styles.footerLink}>Contact</Link>
        </div>

        {/* Social */}
        <div style={styles.col}>
          <div style={styles.colTitle}>Follow us</div>

          <div style={styles.socialRow} className="fd-footer-social">
            
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-footer-social-icon"
              style={styles.socialIcon}
              aria-label="Instagram"
              title="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-footer-social-icon"
              style={styles.socialIcon}
              aria-label="YouTube"
              title="YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <div style={styles.bottomLeft}>
          <div style={styles.barcodeRow} aria-hidden="true">
            {bars.map((w, i) => (
              <span key={i} style={{
                width: w, height: i % 6 === 0 ? 16 : 10,
                background: "#3a4666", display: "inline-block",
              }} />
            ))}
          </div>
          <span style={styles.copyright}>
            © {year} FreshersDrive. All rights reserved.
          </span>
        </div>

        <div style={styles.legalLinks}>
          <Link to="/privacy-policy" className="fd-footer-legal-link" style={styles.legalLink}>
            Privacy Policy
          </Link>
          <span style={styles.legalDivider}>·</span>
          <Link to="/terms-of-service" className="fd-footer-legal-link" style={styles.legalLink}>
            Terms of Service
          </Link>
          <span style={styles.legalDivider}>·</span>
          <Link to="/disclaimer" className="fd-footer-legal-link" style={styles.legalLink}>
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: INK,
    color: MUTED.dark,
    fontFamily: "'Inter', system-ui, sans-serif",
    marginTop: "40px",
    position: "relative",
  },

  perfWrap: { position: "relative", height: "0", maxWidth: "1200px", margin: "0 auto" },
  perfLine: {
    position: "absolute", left: "24px", right: "24px", top: "0",
    borderTop: `2px dashed ${HAIRLINE.dark}`,
  },
  perfNotchLeft: {
    position: "absolute", left: "10px", top: "0", transform: "translateY(-50%)",
    width: "9px", height: "9px", borderRadius: "50%",
    background: INK, border: `1.5px solid ${HAIRLINE.dark}`,
  },
  perfNotchRight: {
    position: "absolute", right: "10px", top: "0", transform: "translateY(-50%)",
    width: "9px", height: "9px", borderRadius: "50%",
    background: INK, border: `1.5px solid ${HAIRLINE.dark}`,
  },

  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px 28px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "32px",
  },

  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "320px",
  },

  logoRow: { display: "flex", alignItems: "center", gap: "9px" },
  logoMark: {
    width: "26px", height: "26px", borderRadius: "7px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logo: {
    fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
    fontWeight: "700", fontSize: "17px", color: "#fff",
    letterSpacing: "0.4px", textTransform: "uppercase",
  },

  tagline: {
    fontSize: "13px",
    color: MUTED.dark,
    lineHeight: "1.6",
    margin: 0,
  },

  col: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  colTitle: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    fontWeight: "700",
    color: "#e7ecf5",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "2px",
  },

  footerLink: {
    color: MUTED.dark,
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
    color: MUTED.dark,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid transparent",
  },

  bottomBar: {
    borderTop: `1px solid ${HAIRLINE.dark}`,
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  bottomLeft: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "center" },

  barcodeRow: { display: "flex", alignItems: "center", gap: "1.5px", height: "16px" },

  copyright: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "#7c8aa8",
    letterSpacing: "0.2px",
  },

  legalLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  legalLink: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "#7c8aa8",
    textDecoration: "none",
    letterSpacing: "0.2px",
  },

  legalDivider: {
    fontSize: "12px",
    color: "#334155",
  },
};

const STYLE_BLOCK = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.fd-footer a:focus-visible {
  outline: 2px solid #1C7ED6;
  outline-offset: 2px;
  border-radius: 4px;
}
.fd-footer .fd-footer-link:hover { color: #e7ecf5; }
.fd-footer .fd-footer-legal-link:hover { color: #cbd5e1; }
.fd-footer .fd-footer-social-icon:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

@media (max-width: 720px) {
  .fd-footer-inner { grid-template-columns: 1fr !important; }
}
`;