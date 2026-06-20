import { Link } from "react-router-dom";

/**
 * Shared shell for the legal/info pages (Privacy Policy, Terms, Disclaimer).
 * Pulls its palette and material straight from Hero.js so these read as
 * the same product, not a bolted-on legal template:
 *   page canvas       #0c0b2b
 *   headline gradient  #818cf8 → #c084fc → #f472b6
 *   glass panels        rgba(255,255,255,0.04–0.10) + blur
 *   accent indigo        #6366f1 / #818cf8 / #a5b4fc
 *
 * Drop this file alongside the three page files. Each page only supplies
 * its own copy via <Section>, <Callout>, and <ContactLine>, styled with
 * the exported `legalText` tokens.
 */

const GRADIENT_TEXT = "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)";

const STYLE_BLOCK = `
  .legal-link { transition: color 0.15s ease; }
  .legal-link:hover { color: #fff !important; }
  .legal-link:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 3px;
    border-radius: 6px;
  }
`;

function AmbientGlow() {
  // Same three glow positions/colors as Hero's particle canvas backdrop,
  // as a static CSS gradient (no canvas needed for a text-heavy page).
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <div style={{
        position: "absolute", top: "-12%", right: "-8%", width: "55%", height: "55%",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-18%", left: "-10%", width: "50%", height: "50%",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)",
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "30%", width: "45%", height: "45%",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(192,132,252,0.07), transparent 70%)",
      }} />
    </div>
  );
}

export default function LegalPageShell({ breadcrumb, title, meta, footerNote, children }) {
  return (
    <div style={styles.page}>
      <style>{STYLE_BLOCK}</style>
      <AmbientGlow />

      <div style={{ position: "relative", zIndex: 1 }}>
        <nav style={styles.nav}>
          <Link to="/" className="legal-link" style={styles.brand}>
            <span style={styles.logoMark}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            FreshersDrive
          </Link>
          <span style={styles.crumbSep}>/</span>
          <span style={styles.crumb}>{breadcrumb}</span>
        </nav>

        <div style={styles.container}>
          <h1 style={styles.title}>
            <span style={styles.titleGradient}>{title}</span>
          </h1>

          {meta && <p style={styles.meta}>{meta}</p>}

          {children}

          {footerNote && <div style={styles.footerNote}>{footerNote}</div>}
        </div>
      </div>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      {heading && (
        <h2 style={styles.heading}>
          <span style={styles.headingTick} />
          {heading}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Callout({ children }) {
  return (
    <div style={styles.callout}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="12" cy="12" r="9" stroke="#a5b4fc" strokeWidth="1.6" />
        <path d="M12 8v.01M12 11.5v4.5" stroke="#a5b4fc" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function ContactLine({ email, note }) {
  return (
    <p style={styles.contact}>
      <a href={`mailto:${email}`} className="legal-link" style={styles.emailLink}>
        {email}
      </a>
      {note && <span style={styles.contactNote}> {note}</span>}
    </p>
  );
}

// Shared typography tokens for body copy inside each page's <Section>.
export const legalText = {
  p: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 14,
  },
  ul: {
    margin: "8px 0 14px 20px",
    color: "rgba(255,255,255,0.64)",
    fontSize: 15,
    lineHeight: 1.7,
  },
  strong: { color: "#fff", fontWeight: 700 },
};

const styles = {
  page: {
    background: "#0c0b2b",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative",
  },

  nav: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "28px clamp(20px, 5vw, 48px) 0",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "-0.2px",
  },
  logoMark: {
    width: 28,
    height: 28,
    background: "#6366f1",
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  crumbSep: { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  crumb: { color: "rgba(255,255,255,0.55)", fontSize: 13 },

  container: {
    position: "relative",
    maxWidth: 760,
    margin: "32px auto 90px",
    background: "rgba(255,255,255,0.045)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "clamp(32px,5vw,56px) clamp(24px,6vw,60px) 48px",
  },

  title: { margin: "0 0 10px", lineHeight: 1.15 },
  titleGradient: {
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 700,
    letterSpacing: "-1px",
    background: GRADIENT_TEXT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  meta: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13.5,
    marginBottom: 34,
    paddingBottom: 18,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    letterSpacing: "0.1px",
  },

  heading: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 18,
    fontWeight: 700,
    color: "#f4f4fb",
    letterSpacing: "-0.2px",
    marginTop: 32,
    marginBottom: 12,
  },
  headingTick: {
    width: 4,
    height: 16,
    borderRadius: 2,
    background: "#818cf8",
    display: "inline-block",
    flexShrink: 0,
  },

  callout: {
    display: "flex",
    gap: 12,
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.28)",
    borderRadius: 14,
    padding: "16px 20px",
    margin: "22px 0 30px",
    color: "#c7d2fe",
    fontSize: 14.5,
    lineHeight: 1.65,
  },

  contact: { marginBottom: 14 },
  emailLink: {
    color: "#a5b4fc",
    fontWeight: 600,
    textDecoration: "none",
    borderBottom: "1px dashed rgba(165,180,252,0.45)",
  },
  contactNote: { color: "rgba(255,255,255,0.35)", fontSize: 13 },

  footerNote: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
};