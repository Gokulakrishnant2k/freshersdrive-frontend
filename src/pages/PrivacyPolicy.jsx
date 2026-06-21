import LegalPageShell, { Section, ContactLine, legalText } from "./LegalPageShell";

export default function PrivacyPolicy() {
  return (
    <LegalPageShell
      breadcrumb="Privacy Policy"
      title="Privacy Policy"
      meta="Effective Date: June 19, 2026  ·  Last updated: June 19, 2026"
      footerNote="This policy applies only to FreshersDrive and does not cover third-party websites linked from our platform."
    >
      <p style={legalText.p}>
        Welcome to <strong style={legalText.strong}>FreshersDrive</strong> ("we", "our", "us"). This
        Privacy Policy explains how we handle information when you visit our website.
      </p>

      <Section heading="1. Information We Collect">
        <p style={legalText.p}>FreshersDrive is a job aggregator. We may collect:</p>
        <ul style={legalText.ul}>
          <li>Basic usage data (pages visited, time spent) through analytics tools if enabled.</li>
          <li>
            Technical information such as browser type, device type, and IP address collected
            automatically by hosting providers.
          </li>
        </ul>
        <p style={legalText.p}>
          We do not intentionally collect personal information unless you voluntarily provide it to us.
        </p>
      </Section>

      <Section heading="2. How We Use Information">
        <p style={legalText.p}>Any information collected is used only to:</p>
        <ul style={legalText.ul}>
          <li>Improve the website experience.</li>
          <li>Understand how users interact with the platform.</li>
          <li>Diagnose and fix technical issues.</li>
        </ul>
        <p style={legalText.p}>We do not sell, rent, or share user data for marketing purposes.</p>
      </Section>

      <Section heading="3. Third-Party Links">
        <p style={legalText.p}>
          FreshersDrive contains links to company career pages and other third-party websites. Once you
          leave our site, you are subject to the privacy policies of those websites.
        </p>
      </Section>

      <Section heading="4. Cookies">
        <p style={legalText.p}>
          We may use cookies or similar technologies through analytics services. You can disable cookies
          in your browser settings at any time.
        </p>
      </Section>

      <Section heading="5. Hosting Services">
        <p style={legalText.p}>
          Our website may be hosted by third-party providers who may collect limited technical
          information required to operate the service.
        </p>
      </Section>

      <Section heading="6. Children's Privacy">
        <p style={legalText.p}>
          This website is not intended for children under 13 years of age. We do not knowingly collect
          personal information from children.
        </p>
      </Section>

      <Section heading="7. Changes to This Policy">
        <p style={legalText.p}>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with
          an updated revision date.
        </p>
      </Section>

      <Section heading="8. Contact">
        <p style={legalText.p}>For questions regarding this Privacy Policy, contact:</p>
        <ContactLine email="gokulakrishnant2004@gmail.com" />
      </Section>
    </LegalPageShell>
  );
}