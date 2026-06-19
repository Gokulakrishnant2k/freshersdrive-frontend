import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← FreshersDrive
        </Link>
        <span style={styles.separator}>/</span>
        <span style={styles.breadcrumb}>Terms of Service</span>
      </header>

      <div style={styles.container}>
        <h1 style={styles.title}>Terms of Service</h1>

        <p style={styles.meta}>
          Effective Date: June 19, 2025 | Last Updated: June 19, 2025
        </p>

        <p style={styles.paragraph}>
          By accessing or using <strong>FreshersDrive</strong> ("the Site"),
          you agree to be bound by these Terms of Service. If you do not agree,
          please do not use the Site.
        </p>

        <h2 style={styles.heading}>1. About FreshersDrive</h2>
        <p style={styles.paragraph}>
          FreshersDrive is a free job aggregator that indexes publicly available
          job and internship opportunities for freshers. We collect basic
          listing information (company name, role, location, eligibility,
          deadline, and source link) from official career pages and other public
          sources and display it in one place for convenience.
        </p>

        <h2 style={styles.heading}>2. Informational Purpose Only</h2>
        <p style={styles.paragraph}>
          All content on this Site is provided for informational purposes only.
          We do not guarantee:
        </p>

        <ul style={styles.list}>
          <li>The accuracy, completeness, or currency of any job listing.</li>
          <li>That any position is still open at the time you view it.</li>
          <li>
            That applying through the source link will result in employment.
          </li>
        </ul>

        <p style={styles.paragraph}>
          Always verify job details directly on the company's official website
          before applying.
        </p>

        <h2 style={styles.heading}>3. No Affiliation with Companies</h2>
        <p style={styles.paragraph}>
          FreshersDrive is not affiliated with, endorsed by, or partnered with
          any company whose job listings appear on this Site. All company names,
          logos, and trademarks are the property of their respective owners.
        </p>

        <h2 style={styles.heading}>4. User Responsibilities</h2>
        <p style={styles.paragraph}>By using this Site, you agree to:</p>

        <ul style={styles.list}>
          <li>Use the Site for lawful purposes only.</li>
          <li>
            Not attempt to scrape, copy, or reproduce the Site's content in bulk
            without permission.
          </li>
          <li>
            Not misrepresent yourself or your affiliation when applying to any
            listed job.
          </li>
          <li>
            Verify the legitimacy of any job opportunity before sharing personal
            information with any third party.
          </li>
        </ul>

        <h2 style={styles.heading}>5. Third-Party Links</h2>
        <p style={styles.paragraph}>
          The Site contains links to external websites (company career pages,
          job portals, etc.). These are provided for convenience. We have no
          control over third-party content, privacy practices, or availability.
          Accessing external links is at your own risk.
        </p>

        <h2 style={styles.heading}>6. Intellectual Property</h2>
        <p style={styles.paragraph}>
          The design, layout, and original text content of FreshersDrive are
          owned by the site operator. Job listing data (titles, locations,
          eligibility criteria) is factual information derived from public
          sources and is not claimed as original content.
        </p>

        <h2 style={styles.heading}>7. Disclaimer of Warranties</h2>
        <p style={styles.paragraph}>
          The Site is provided "as is" without warranties of any kind, express
          or implied. We do not warrant that the Site will be uninterrupted,
          error-free, or free of harmful components.
        </p>

        <h2 style={styles.heading}>8. Limitation of Liability</h2>
        <p style={styles.paragraph}>
          To the fullest extent permitted by law, FreshersDrive and its operator
          shall not be liable for any direct, indirect, incidental, or
          consequential damages arising from your use of the Site or reliance on
          any information provided here.
        </p>

        <h2 style={styles.heading}>9. Content Removal Requests</h2>
        <p style={styles.paragraph}>
          If you are a company representative and believe a listing is
          inaccurate or should be removed, please contact us and we will address
          your request promptly.
        </p>

        <h2 style={styles.heading}>10. Changes to These Terms</h2>
        <p style={styles.paragraph}>
          We may update these Terms at any time. Continued use of the Site after
          changes are posted constitutes acceptance of the revised Terms.
        </p>

        <h2 style={styles.heading}>11. Contact</h2>
        <p style={styles.paragraph}>
          For any questions about these Terms, contact us at:
        </p>

        <p style={styles.contact}>
          <a
            href="mailto:gokulakrishnan@example.com"
            style={styles.emailLink}
          >
            gokulakrishnan@example.com
          </a>
          {" "} (replace with your actual email)
        </p>

        <div style={styles.footerNote}>
          These Terms of Service apply to the FreshersDrive website only.
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
    marginBottom: "6px",
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
    margin: "28px 0 10px",
    fontWeight: "700",
  },

  paragraph: {
    color: "#374151",
    marginBottom: "14px",
    fontSize: "15px",
    lineHeight: "1.7",
  },

  list: {
    margin: "10px 0 14px 20px",
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7",
  },

  contact: {
    color: "#374151",
    marginBottom: "14px",
    fontSize: "15px",
  },

  emailLink: {
    color: "#2563eb",
  },

  footerNote: {
    marginTop: "40px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#6b7280",
  },
};

