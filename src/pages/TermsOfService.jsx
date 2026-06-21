import LegalPageShell, { Section, ContactLine, legalText } from "./LegalPageShell";

export default function TermsOfService() {
  return (
    <LegalPageShell
      breadcrumb="Terms of Service"
      title="Terms of Service"
      meta="Effective Date: June 19, 2026  ·  Last updated: June 19, 2026"
      footerNote="These Terms of Service apply to the FreshersDrive website only."
    >
      <p style={legalText.p}>
        By accessing or using <strong style={legalText.strong}>FreshersDrive</strong> ("the Site"), you
        agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.
      </p>

      <Section heading="1. About FreshersDrive">
        <p style={legalText.p}>
          FreshersDrive is a free job aggregator that indexes publicly available job and internship
          opportunities for freshers. We collect basic listing information (company name, role,
          location, eligibility, deadline, and source link) from official career pages and other public
          sources and display it in one place for convenience.
        </p>
      </Section>

      <Section heading="2. Informational Purpose Only">
        <p style={legalText.p}>All content on this Site is provided for informational purposes only. We do not guarantee:</p>
        <ul style={legalText.ul}>
          <li>The accuracy, completeness, or currency of any job listing.</li>
          <li>That any position is still open at the time you view it.</li>
          <li>That applying through the source link will result in employment.</li>
        </ul>
        <p style={legalText.p}>
          Always verify job details directly on the company's official website before applying.
        </p>
      </Section>

      <Section heading="3. No Affiliation with Companies">
        <p style={legalText.p}>
          FreshersDrive is not affiliated with, endorsed by, or partnered with any company whose job
          listings appear on this Site. All company names, logos, and trademarks are the property of
          their respective owners.
        </p>
      </Section>

      <Section heading="4. User Responsibilities">
        <p style={legalText.p}>By using this Site, you agree to:</p>
        <ul style={legalText.ul}>
          <li>Use the Site for lawful purposes only.</li>
          <li>Not attempt to scrape, copy, or reproduce the Site's content in bulk without permission.</li>
          <li>Not misrepresent yourself or your affiliation when applying to any listed job.</li>
          <li>Verify the legitimacy of any job opportunity before sharing personal information with any third party.</li>
        </ul>
      </Section>

      <Section heading="5. Third-Party Links">
        <p style={legalText.p}>
          The Site contains links to external websites (company career pages, job portals, etc.). These
          are provided for convenience. We have no control over third-party content, privacy practices,
          or availability. Accessing external links is at your own risk.
        </p>
      </Section>

      <Section heading="6. Intellectual Property">
        <p style={legalText.p}>
          The design, layout, and original text content of FreshersDrive are owned by the site operator.
          Job listing data (titles, locations, eligibility criteria) is factual information derived from
          public sources and is not claimed as original content.
        </p>
      </Section>

      <Section heading="7. Disclaimer of Warranties">
        <p style={legalText.p}>
          The Site is provided "as is" without warranties of any kind, express or implied. We do not
          warrant that the Site will be uninterrupted, error-free, or free of harmful components.
        </p>
      </Section>

      <Section heading="8. Limitation of Liability">
        <p style={legalText.p}>
          To the fullest extent permitted by law, FreshersDrive and its operator shall not be liable for
          any direct, indirect, incidental, or consequential damages arising from your use of the Site
          or reliance on any information provided here.
        </p>
      </Section>

      <Section heading="9. Content Removal Requests">
        <p style={legalText.p}>
          If you are a company representative and believe a listing is inaccurate or should be removed,
          please contact us and we will address your request promptly.
        </p>
      </Section>

      <Section heading="10. Changes to These Terms">
        <p style={legalText.p}>
          We may update these Terms at any time. Continued use of the Site after changes are posted
          constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section heading="11. Contact">
        <p style={legalText.p}>For any questions about these Terms, contact us at:</p>
        <ContactLine email="gokulakrishnant2004@gmail.com" note="(replace with your actual email)" />
      </Section>
    </LegalPageShell>
  );
}