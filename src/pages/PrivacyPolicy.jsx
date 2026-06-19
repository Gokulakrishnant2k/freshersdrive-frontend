```jsx
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← FreshersDrive
        </Link>
        <span style={styles.separator}>/</span>
        <span style={styles.breadcrumb}>Privacy Policy</span>
      </header>

      <div style={styles.container}>
        <h1 style={styles.title}>Privacy Policy</h1>

        <p style={styles.meta}>
          Effective Date: June 19, 2026 | Last Updated: June 19, 2026
        </p>

        <p style={styles.paragraph}>
          Welcome to <strong>FreshersDrive</strong> ("we", "our", "us"). This
          Privacy Policy explains how we handle information when you visit our
          website.
        </p>

        <h2 style={styles.heading}>1. Information We Collect</h2>

        <p style={styles.paragraph}>
          FreshersDrive is a job aggregator. We may collect:
        </p>

        <ul style={styles.list}>
          <li>
            Basic usage data (pages visited, time spent) through analytics tools
            if enabled.
          </li>
          <li>
            Technical information such as browser type, device type, and IP
            address collected automatically by hosting providers.
          </li>
        </ul>

        <p style={styles.paragraph}>
          We do not intentionally collect personal information unless you
          voluntarily provide it to us.
        </p>

        <h2 style={styles.heading}>2. How We Use Information</h2>

        <p style={styles.paragraph}>
          Any information collected is used only to:
        </p>

        <ul style={styles.list}>
          <li>Improve the website experience.</li>
          <li>Understand how users interact with the platform.</li>
          <li>Diagnose and fix technical issues.</li>
        </ul>

        <p style={styles.paragraph}>
          We do not sell, rent, or share user data for marketing purposes.
        </p>

        <h2 style={styles.heading}>3. Third-Party Links</h2>

        <p style={styles.paragraph}>
          FreshersDrive contains links to company career pages and other
          third-party websites. Once you leave our site, you are subject to the
          privacy policies of those websites.
        </p>

        <h2 style={styles.heading}>4. Cookies</h2>

        <p style={styles.paragraph}>
          We may use cookies or similar technologies through analytics services.
          You can disable cookies in your browser settings at any time.
        </p>

        <h2 style={styles.heading}>5. Hosting Services</h2>

        <p style={styles.paragraph}>
          Our website may be hosted by third-party providers who may collect
          limited technical information required to operate the service.
        </p>

        <h2 style={styles.heading}>6. Children's Privacy</h2>

        <p style={styles.paragraph}>
          This website is not intended for children under 13 years of age. We do
          not knowingly collect personal information from children.
        </p>

        <h2 style={styles.heading}>7. Changes to This Policy</h2>

        <p style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated revision date.
        </p>

        <h2 style={styles.heading}>8. Contact</h2>

        <p style={styles.paragraph}>
          For questions regarding this Privacy Policy, contact:
        </p>

        <p style={styles.contact}>
          gokulakrishnan@example.com
        </p>

        <div style={styles.footerNote}>
          This policy applies only to FreshersDrive and does not cover
          third-party websites linked from our platform.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f9fafb",
    minHeight: "100vh",
    color: "#1a1a2e",
  },

  header: {
    background: "#1a1a2e",
    color: "white",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  backLink: {
    color: "#60a5fa",
    textDecoration: "none",
    fontSize: "14px",
  },

  separator: {
    color: "#9ca3af",
    fontSize: "14px",
  },

  breadcrumb: {
    color: "#9ca3af",
    fontSize: "14px",
  },

  container: {
    maxWidth: "800px",
    margin: "40px auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: "48px 52px",
  },

  title: {
    fontSize: "28px",
    marginBottom: "8px",
  },

  meta: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "36px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "20px",
  },

  heading: {
    fontSize: "17px",
    fontWeight: "700",
    marginTop: "28px",
    marginBottom: "10px",
  },

  paragraph: {
    color: "#374151",
    marginBottom: "14px",
    lineHeight: "1.7",
  },

  list: {
    marginLeft: "20px",
    marginBottom: "14px",
    color: "#374151",
    lineHeight: "1.7",
  },

  contact: {
    color: "#2563eb",
    fontWeight: "600",
  },

  footerNote: {
    marginTop: "40px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#6b7280",
  },
};
```
