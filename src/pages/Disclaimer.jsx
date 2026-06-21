import LegalPageShell, { Section, Callout, ContactLine, legalText } from "./LegalPageShell";

export default function Disclaimer() {
  return (
    <LegalPageShell
      breadcrumb="Disclaimer"
      title="Disclaimer"
      meta="Effective Date: June 19, 2026  ·  Last updated: June 19, 2026"
      footerNote="This disclaimer is subject to change. Last updated June 19, 2026."
    >
      <Callout>
        FreshersDrive aggregates publicly available job and internship listings for informational
        purposes only. We are not affiliated with any company or recruiter. Always verify job details on
        the official source before applying.
      </Callout>

      <Section heading="General">
        <p style={legalText.p}>
          The information provided on <strong style={legalText.strong}>FreshersDrive</strong> is
          aggregated from publicly available sources including company career pages, official portals,
          and public job boards. While we make every effort to ensure listings are accurate and current,
          we cannot guarantee completeness, accuracy, or timeliness of the information displayed.
        </p>
      </Section>

      <Section heading="No Partnership or Endorsement">
        <p style={legalText.p}>
          FreshersDrive is an independent platform and is not affiliated with, endorsed by, sponsored by,
          or in any way officially connected with any company, recruiter, or organization whose listings
          appear on this site. All company names, logos, and trademarks are the property of their
          respective owners.
        </p>
      </Section>

      <Section heading="Job Listing Accuracy">
        <p style={legalText.p}>
          Job openings can close without notice. Eligibility criteria, application deadlines, and other
          details may change. FreshersDrive is not responsible for:
        </p>
        <ul style={legalText.ul}>
          <li>Listings that are expired or no longer active.</li>
          <li>Changes made to a listing on the original source after we indexed it.</li>
          <li>Errors or discrepancies between our listing and the original source.</li>
        </ul>
        <p style={legalText.p}>
          Users are strongly advised to verify all details on the official company career page or the
          original source link provided before submitting any application.
        </p>
      </Section>

      <Section heading="No Recruitment Service">
        <p style={legalText.p}>
          FreshersDrive does not conduct interviews, shortlist candidates, or facilitate the hiring
          process in any way. We are a discovery and indexing platform only. Any communication about
          recruitment should be directed to the respective company.
        </p>
      </Section>

      <Section heading="External Links">
        <p style={legalText.p}>
          This site contains links to external websites. FreshersDrive has no control over and takes no
          responsibility for the content, privacy practices, or availability of those websites.
          Inclusion of a link does not constitute endorsement.
        </p>
      </Section>

      <Section heading="Beware of Fraud">
        <p style={legalText.p}>
          We strongly advise users to exercise caution when applying for jobs online. Legitimate
          employers will never ask for payment to apply for a job. If a listing looks suspicious, do not
          share personal or financial information and report it to us via the contact details below.
        </p>
      </Section>

      <Section heading="Contact">
        <p style={legalText.p}>
          To report an inaccurate listing, request removal, or for any other queries, contact us at:
        </p>
        <ContactLine email="gokulakrishnant2004@gmail.com" />
      </Section>
    </LegalPageShell>
  );
}