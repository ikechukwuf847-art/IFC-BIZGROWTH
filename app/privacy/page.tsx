import type { Metadata } from "next";
import Link from "next/link";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy Policy | IFC BIZGROWTH",
  description:
    "Learn how IFC BIZGROWTH collects, uses, protects, and manages your personal information.",
  alternates: {
    canonical: "https://ifcbizgrowth.africa/privacy-policy",
  },
};

const lastUpdated = "October 18, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <Link href="/" className="privacy-brand">
            IFC <span>BIZGROWTH</span>
          </Link>

          <p className="privacy-label">LEGAL INFORMATION</p>

          <h1>Privacy Policy</h1>

          <p className="privacy-intro">
            Your privacy matters to us. This policy explains how IFC BIZGROWTH
            collects, uses, stores, and protects information when you use our
            website, mobile application, and services.
          </p>

          <p className="privacy-updated">
            Last updated: {lastUpdated}
          </p>
        </header>

        <nav className="privacy-toc" aria-label="Privacy policy contents">
          <h2>Contents</h2>

          <ol>
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#information">Information We Collect</a></li>
            <li><a href="#use">How We Use Information</a></li>
            <li><a href="#public-information">Public Business Information</a></li>
            <li><a href="#sharing">How We Share Information</a></li>
            <li><a href="#payments">Payments</a></li>
            <li><a href="#location">Business Location Information</a></li>
            <li><a href="#verification">Business Verification</a></li>
            <li><a href="#analytics">Analytics and Advertising</a></li>
            <li><a href="#storage">Data Storage and Security</a></li>
            <li><a href="#retention">Data Retention</a></li>
            <li><a href="#deletion">Account Deletion</a></li>
            <li><a href="#rights">Your Privacy Rights</a></li>
            <li><a href="#children">Children's Privacy</a></li>
            <li><a href="#third-parties">Third-Party Services</a></li>
            <li><a href="#international">International Data Transfers</a></li>
            <li><a href="#cookies">Cookies and Local Storage</a></li>
            <li><a href="#changes">Changes to This Policy</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ol>
        </nav>

        <article className="privacy-content">
          <section id="introduction">
            <h2>1. Introduction</h2>

            <p>
              IFC BIZGROWTH is a business discovery and growth platform
              operated by IFC Bridge Lab. It helps people discover businesses,
              products, services, and business opportunities.
            </p>

            <p>
              This policy applies to our website, mobile application, and
              related services. By using our services, you acknowledge that
              you have had the opportunity to read this policy.
            </p>

            <p>
              Where applicable, personal information is processed in
              accordance with relevant data protection laws.
            </p>
          </section>

          <section id="information">
            <h2>2. Information We Collect</h2>

            <p>Depending on how you use our services, we may collect:</p>

            <h3>A. Account information</h3>
            <ul>
              <li>Email address and account identifiers.</li>
              <li>Authentication information and session tokens.</li>
              <li>Information needed to authenticate your account.</li>
            </ul>

            <p>
              Your password is used for authentication. We do not intentionally
              display your password to other users.
            </p>

            <h3>B. Business information</h3>
            <ul>
              <li>Business name, description, and category.</li>
              <li>Business email address, telephone number, and website.</li>
              <li>Country and other business address information.</li>
              <li>Products, services, prices, currencies, and images.</li>
              <li>Business promotions and advertising campaign information.</li>
            </ul>

            <h3>C. Verification information</h3>
            <p>
              If you request business verification, we may process registration
              numbers, registration countries, submitted documents, notes, and
              the outcome of the verification review.
            </p>

            <h3>D. Location information</h3>
            <p>
              When you provide a business address, we may process that address
              and associated geographic coordinates to support business
              location features.
            </p>

            <h3>E. Transactions and service requests</h3>
            <p>
              We may process payment order identifiers, amounts, currencies,
              payment status, selected services, advertising packages, and
              related transaction records.
            </p>

            <h3>F. Usage and technical information</h3>
            <p>
              Depending on the features you use, we may process analytics
              events, interactions with business profiles, products, services,
              promotions, and technical information needed to operate and
              secure the platform.
            </p>

            <h3>G. Communications and uploaded files</h3>
            <p>
              We may process information you send through support requests,
              business forms, verification submissions, and other interactions
              with our services.
            </p>
          </section>

          <section id="use">
            <h2>3. How We Use Information</h2>

            <p>We may use information to:</p>

            <ul>
              <li>Create and manage user accounts.</li>
              <li>Authenticate users and maintain account sessions.</li>
              <li>Publish and manage business profiles.</li>
              <li>Help customers discover businesses, products, and services.</li>
              <li>Process business verification requests.</li>
              <li>Manage advertising campaigns and marketing requests.</li>
              <li>Coordinate payment processing and confirm payment status.</li>
              <li>Provide analytics and measure platform usage.</li>
              <li>Respond to support requests.</li>
              <li>Detect abuse, protect accounts, and maintain security.</li>
              <li>Meet legal obligations and enforce our policies.</li>
              <li>Improve the reliability and functionality of our services.</li>
            </ul>
          </section>

          <section id="public-information">
            <h2>4. Public Business Information</h2>

            <p>
              Business owners may choose to make business profiles and related
              information public. Depending on their settings and the features
              enabled, this information may include business names,
              descriptions, contact details, websites, locations, products,
              services, images, and promotions.
            </p>

            <p>
              Public business information may be accessible to visitors who do
              not have an account. Public pages may also be discovered or
              indexed by search engines.
            </p>

            <p>
              Do not submit sensitive personal information for public display.
              Business owners are responsible for ensuring that they have
              permission to publish information and images they submit.
            </p>
          </section>

          <section id="sharing">
            <h2>5. How We Share Information</h2>

            <p>Information may be shared in the following circumstances:</p>

            <ul>
              <li>
                <strong>Service providers:</strong> With providers that support
                hosting, authentication, databases, storage, and other
                platform operations.
              </li>
              <li>
                <strong>Payment providers:</strong> When necessary to process
                payments or verify transaction status.
              </li>
              <li>
                <strong>Public visitors:</strong> When business information is
                intentionally published publicly.
              </li>
              <li>
                <strong>Authorized personnel:</strong> When access is needed
                to administer the platform, review verification requests, or
                provide support.
              </li>
              <li>
                <strong>Legal and safety purposes:</strong> When disclosure is
                required by law or reasonably necessary to protect rights,
                users, or the platform.
              </li>
              <li>
                <strong>Business changes:</strong> In connection with a
                merger, restructuring, or transfer of business assets, subject
                to applicable legal requirements.
              </li>
            </ul>

            <p>
              We do not describe these circumstances as permission to share
              information indiscriminately. Information should only be
              disclosed where there is an appropriate operational or legal
              reason.
            </p>
          </section>

          <section id="payments">
            <h2>6. Payments</h2>

            <p>
              Some advertising and marketing services may require payment.
              Payment checkout may be provided by an external payment service.
            </p>

            <p>
              Payment providers may collect and process information under
              their own privacy policies and terms. IFC BIZGROWTH may receive
              transaction references, amounts, currencies, and payment status
              to manage orders and provide services.
            </p>

            <p>
              The precise information handled by a payment provider depends on
              the checkout method and the provider used for the transaction.
            </p>
          </section>

          <section id="location">
            <h2>7. Business Location Information</h2>

            <p>
              If you add a business location, we may process the address you
              enter and use a geocoding service to convert that address into
              geographic coordinates.
            </p>

            <p>
              Coordinates and address details may be used to display a
              business location and support location-related discovery
              features.
            </p>

            <p>
              Providing a business address is different from granting access to
              your device's live GPS location. Refer to your device settings
              and the permissions actually requested by the app to understand
              any device-level location access.
            </p>
          </section>

          <section id="verification">
            <h2>8. Business Verification</h2>

            <p>
              Businesses may submit registration details and supporting
              documents for verification. These materials may be stored and
              reviewed by authorized personnel for verification and related
              administrative purposes.
            </p>

            <p>
              Submit only documents you are authorized to provide. Access to
              verification materials should be restricted to personnel and
              service providers who need them for legitimate purposes.
            </p>
          </section>

          <section id="analytics">
            <h2>9. Analytics and Advertising</h2>

            <p>
              IFC BIZGROWTH may record interactions with business profiles,
              products, services, promotions, contact options, and advertising
              features to provide analytics and measure performance.
            </p>

            <p>
              Depending on the feature, these records may include event types,
              timestamps, business identifiers, campaign information, and
              visitor or session identifiers.
            </p>

            <p>
              Business owners may receive analytics about activity associated
              with their businesses. Access to analytics should be controlled
              according to the user's permissions.
            </p>

            <p>
              This section describes platform analytics. It does not mean that
              the app necessarily uses third-party advertising trackers or
              advertising SDKs.
            </p>
          </section>

          <section id="storage">
            <h2>10. Data Storage and Security</h2>

            <p>
              We use technical and organizational measures intended to protect
              information from unauthorized access, loss, misuse, alteration,
              or disclosure.
            </p>

            <p>
              Information may be processed using database, authentication,
              hosting, and file-storage services that support the platform.
              Access controls and security measures depend on the service and
              the type of information involved.
            </p>

            <p>
              No method of electronic storage or internet transmission can be
              guaranteed to be completely secure.
            </p>
          </section>

          <section id="retention">
            <h2>11. Data Retention</h2>

            <p>
              We retain information for as long as reasonably necessary to
              provide the services, maintain accounts, fulfil transactions,
              resolve disputes, protect the platform, and comply with
              applicable legal obligations.
            </p>

            <p>
              Retention periods may differ by information type. Some
              transaction or security records may need to be retained after an
              account is deleted where required or permitted by law.
            </p>
          </section>

          <section id="deletion">
            <h2>12. Account Deletion</h2>

            <p>
              You can initiate account deletion through the account deletion
              feature in the app, where available, or through our web-based
              deletion page.
            </p>

            <p>
              <Link href="/delete-account" className="privacy-inline-link">
                Visit the account deletion page
              </Link>
            </p>

            <p>
              The deletion process may require password verification and a
              one-time verification code to help protect your account.
            </p>

            <p>
              Deletion may remove your account and associated information,
              including business records and related content that you own,
              subject to the platform's data relationships and applicable
              retention obligations.
            </p>

            <p>
              A business owned by another person may remain on the platform
              when you are only a member of that business. Certain records may
              also be retained where legally required or otherwise permitted.
            </p>

            <p>
              Account deletion is intended to be permanent. Review the
              confirmation screen carefully before completing your request.
            </p>
          </section>

          <section id="rights">
            <h2>13. Your Privacy Rights</h2>

            <p>
              Depending on the laws that apply to you, you may have rights to
              request access to, correction of, deletion of, or information
              about the processing of your personal information.
            </p>

            <p>
              You may also have the right to object to or restrict certain
              processing, or to withdraw consent where processing relies on
              consent.
            </p>

            <p>
              To make a privacy-related request, contact us using the details
              in the Contact Us section. We may need to verify your identity
              before responding.
            </p>
          </section>

          <section id="children">
            <h2>14. Children's Privacy</h2>

            <p>
              Our services are intended for users who are legally permitted
              to use the relevant features under applicable law and our
              service terms.
            </p>

            <p>
              We do not knowingly collect personal information from children
              where doing so is prohibited by applicable law. If you believe
              that a child has provided personal information inappropriately,
              contact us so we can review the matter.
            </p>

            <p>
              Any minimum-age restrictions and parental-consent requirements
              applicable to a particular service must be followed.
            </p>
          </section>

          <section id="third-parties">
            <h2>15. Third-Party Services</h2>

            <p>
              Our services may depend on or link to third-party websites and
              services, including authentication, hosting, storage,
              geocoding, and payment services.
            </p>

            <p>
              Third-party services operate under their own terms and privacy
              policies. We encourage you to review those policies when using
              their services.
            </p>
          </section>

          <section id="international">
            <h2>16. International Data Transfers</h2>

            <p>
              Depending on the providers used and their infrastructure,
              information may be processed or stored in countries other than
              the country where you live.
            </p>

            <p>
              Where required, appropriate safeguards should be used for
              international transfers of personal information.
            </p>
          </section>

          <section id="cookies">
            <h2>17. Cookies and Local Storage</h2>

            <p>
              Our website and services may use cookies, browser storage, or
              device storage to maintain sessions, remember settings, and
              support essential functionality.
            </p>

            <p>
              The mobile application may use local device storage to maintain
              authentication sessions. Clearing application data or signing
              out may affect saved session information.
            </p>
          </section>

          <section id="changes">
            <h2>18. Changes to This Policy</h2>

            <p>
              We may update this policy when our services, data practices, or
              legal obligations change. The updated policy will be published
              on this page with a revised update date.
            </p>

            <p>
              If a change requires additional notice under applicable law, we
              will take appropriate steps to provide that notice.
            </p>
          </section>

          <section id="contact">
            <h2>19. Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy or how your
              information is handled, contact us:
            </p>

            <div className="privacy-contact-card">
              <p><strong>IFC BIZGROWTH</strong></p>
              <p>Operated by IFC Bridge Lab</p>
              <p>
                Email:{" "}
                <a href="mailto:support@ifcbizgrowth.africa">
                  support@ifcbizgrowth.africa
                </a>
              </p>
              <p>
                General enquiries:{" "}
                <a href="mailto:contactus@ifcbridgelab.com">
                  contactus@ifcbridgelab.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://ifcbizgrowth.africa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ifcbizgrowth.africa
                </a>
              </p>
            </div>
          </section>
        </article>

        <footer className="privacy-footer">
          <Link href="/">Home</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/delete-account">Delete Account</Link>

          <p>
            © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
  }
