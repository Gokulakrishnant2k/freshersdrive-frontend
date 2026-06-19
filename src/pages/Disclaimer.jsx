import { Link } from "react-router-dom";

export default function Disclaimer() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← FreshersDrive
        </Link>
        <span style={styles.separator}>/</span>
        <span style={styles.breadcrumb}>Disclaimer</span>
      </header>

      <div style={styles.container}>
        <h1 style={styles.title}>Disclaimer</h1>

        <p style={styles.meta}>
          Effective Date: June 19, 2025 | Last Updated: June 19, 2025
        </p>

        <div style={styles.highlightBox}>
          FreshersDrive aggregates publicly available job and internship
          listings for informational purposes only. We are not affiliated with
          any company or recruiter. Always verify job details on the official
          source before applying.
        </div>

        <h2 style={styles.heading}>General</h2>
        <p style={styles.paragraph}>
          The information provided on <strong>FreshersDrive</strong> is
          aggregated from publicly available sources including company career
          pages, official portals, and public job boards. While we make every
          effort to ensure listings are accurate and current, we cannot
          guarantee completeness, accuracy, or timeliness of the information
          displayed.
        </p>

        <h2 style={styles.heading}>No Partnership or Endorsement</h2>
        <p style={styles.paragraph}>
          FreshersDrive is an independent platform and is not affiliated with,
          endorsed by, sponsored by, or in any way officially connected with
          any company, recruiter, or organization whose listings appear on this
          site. All company names, logos, and trademarks are the property of
          their respective owners.
        </p>

        <h2 style={styles.heading}>Job Listing Accuracy</h2>
        <p style={styles.paragraph}>
          Job openings can close without notice. Eligibility criteria,
          application deadlines, and other details may change. FreshersDrive is
          not responsible for:
        </p>

        <ul style={styles.list}>
          <li>Listings that are expired or no longer active.</li>
          <li>
            Changes made to a listing on the original source after we indexed
            it.
          </li>
          <li>
            Errors or discrepancies between our listing and the original
            source.
          </li>
        </ul>

        <p style={styles.paragraph}>
          Users are strongly advised to verify all details on the official
          company career page or the original source link provided before
          submitting any application.
        </p>

        <h2 style={styles.heading}>No Recruitment Service</h2>
        <p style={styles.paragraph}>
          FreshersDrive does not conduct interviews, shortlist candidates, or
          facilitate the hiring process in any way. We are a discovery and
          indexing platform only. Any communication about recruitment should be
          directed to the respective company.
        </p>

        <h2 style={styles.heading}>External Links</h2>
        <p style={styles.paragraph}>
          This site contains links to external websites. FreshersDrive has no
          control over and takes no responsibility for the content, privacy
          practices, or availability of those websites. Inclusion of a link
          does not constitute endorsement.
        </p>

        <h2 style={styles.heading}>Beware of Fraud</h2>
        <p style={styles.paragraph}>
          We strongly advise users to exercise caution when applying for jobs
          online. Legitimate employers will never ask for payment to apply for
          a job. If a listing looks suspicious, do not share personal or
          financial information and report it to us via the contact details
          below.
        </p>

        <h2 style={styles.heading}>Contact</h2>
        <p style={styles.paragraph}>
          To report an inaccurate listing, request removal, or for any other
          queries, contact us at:
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
          This disclaimer is subject to change. Last updated June 19, 2025.
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

  highlightBox: {
    background: "#eff6ff",
    borderLeft: "4px solid #2563eb",
    borderRadius: "6px",
    padding: "18px 22px",
    margin: "24px 0",
    fontSize: "15px",
    color: "#1e3a5f",
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

