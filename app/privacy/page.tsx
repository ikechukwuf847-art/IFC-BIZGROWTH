import Link from "next/link";
import Image from "next/image";
import "./privacy.css";

export default function PrivacyPage(): React.JSX.Element {
  const lastUpdated = "25 September 2026";

  return (
    <main className="privacy-page">
      {/* HEADER */}
      <header className="privacy-header">
        <div className="privacy-header-inner">
          <Link
            href="/"
            className="privacy-logo-link"
            aria-label="IFC BIZGROWTH home"
          >
            <Image
              src="/ifc-biz-growth.png"
              alt="IFC BIZGROWTH"
              width={180}
              height={55}
              className="privacy-logo"
              priority
            />
          </Link>

          <nav className="privacy-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/businesses">Businesses</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <Link href="/business/login" className="privacy-login-btn">
            Business Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <span className="privacy-eyebrow">LEGAL &amp; PRIVACY</span>

          <h1>Privacy Policy</h1>

          <p>
            This Privacy Policy explains how IFC BIZGROWTH collects, uses,
            protects, stores, and shares information when you use our website,
            platform, applications, business services, and related services.
          </p>

          <div className="privacy-updated">
            <span>Last updated</span>
            <strong>{lastUpdated}</strong>
          </div>
        </div>
      </section>

      {/* DOCUMENT */}
      <section className="privacy-document">
        <div className="privacy-layout">
          {/* SIDEBAR */}
          <aside className="privacy-sidebar">
            <div className="privacy-sidebar-inner">
              <span className="privacy-sidebar-title">On this page</span>

              <nav aria-label="Privacy Policy sections">
                <a href="#introduction">1. Introduction</a>
                <a href="#controller">2. Who We Are</a>
                <a href="#information-we-collect">
                  3. Information We Collect
                </a>
                <a href="#information-you-provide">
                  4. Information You Provide
                </a>
                <a href="#automatic-information">
                  5. Automatically Collected Information
                </a>
                <a href="#lawful-basis">6. Lawful Basis</a>
                <a href="#how-we-use-information">
                  7. How We Use Information
                </a>
                <a href="#public-business-information">
                  8. Public Business Information
                </a>
                <a href="#payments">9. Payments</a>
                <a href="#cookies">10. Cookies</a>
                <a href="#sharing">11. Information Sharing</a>
                <a href="#third-party-services">
                  12. Third-Party Services
                </a>
                <a href="#security">13. Data Security</a>
                <a href="#retention">14. Data Retention</a>
                <a href="#your-rights">15. Your Privacy Rights</a>
                <a href="#requests">16. Privacy Requests</a>
                <a href="#children">17. Children</a>
                <a href="#international-transfers">
                  18. International Transfers
                </a>
                <a href="#marketing">19. Marketing Communications</a>
                <a href="#business-data">20. Business Data</a>
                <a href="#third-party-websites">
                  21. Third-Party Websites
                </a>
                <a href="#changes">22. Changes</a>
                <a href="#contact-privacy">23. Contact</a>
              </nav>
            </div>
          </aside>

          {/* MAIN */}
          <article className="privacy-content">
            {/* 1 */}
            <section id="introduction" className="privacy-section">
              <span className="privacy-section-number">01</span>

              <h2>Introduction</h2>

              <p>
                IFC BIZGROWTH is an African business-growth platform operated
                under IFC Bridge Lab. The platform is designed to help
                businesses improve visibility, reach customers, promote their
                products and services, and access business-growth services.
              </p>

              <p>
                This Privacy Policy explains how we process personal
                information when you visit our website, create or manage an
                account, submit a business listing, interact with businesses,
                purchase services, communicate with us, or otherwise use IFC
                BIZGROWTH.
              </p>

              <p>
                This Privacy Policy should be read together with our{" "}
                <Link href="/terms">Terms of Service</Link>.
              </p>
            </section>

            {/* 2 */}
            <section id="controller" className="privacy-section">
              <span className="privacy-section-number">02</span>

              <h2>Who We Are</h2>

              <p>
                IFC BIZGROWTH is the platform through which the relevant
                business-growth services described on this website are
                provided.
              </p>

              <p>
                IFC BIZGROWTH operates under its parent company, IFC Bridge
                Lab.
              </p>

              <div className="privacy-controller-card">
                <div>
                  <span>Platform</span>
                  <strong>IFC BIZGROWTH</strong>
                </div>

                <div>
                  <span>Parent Company</span>
                  <strong>IFC Bridge Lab</strong>
                </div>

                <div>
                  <span>General Email</span>
                  <a href="mailto:email@ifcbizgrowth.africa">
                    email@ifcbizgrowth.africa
                  </a>
                </div>

                <div>
                  <span>Privacy / Support</span>
                  <a href="mailto:support@ifcbizgrowth.africa">
                    support@ifcbizgrowth.africa
                  </a>
                </div>
              </div>

              <p>
                Where another organisation processes information on our behalf,
                that organisation may act as a data processor or other service
                provider according to the nature of the relationship.
              </p>
            </section>

            {/* 3 */}
            <section
              id="information-we-collect"
              className="privacy-section"
            >
              <span className="privacy-section-number">03</span>

              <h2>Information We Collect</h2>

              <p>
                The information we collect depends on how you interact with
                IFC BIZGROWTH.
              </p>

              <div className="privacy-card-grid">
                <div className="privacy-info-card">
                  <h3>Account information</h3>

                  <p>
                    This may include your name, email address, authentication
                    information, account status, verification information,
                    and other information needed to manage your account.
                  </p>
                </div>

                <div className="privacy-info-card">
                  <h3>Business information</h3>

                  <p>
                    This may include business name, description, category,
                    location, contact details, products, services, images,
                    logos, social links, promotions, and advertising
                    information.
                  </p>
                </div>

                <div className="privacy-info-card">
                  <h3>Transaction information</h3>

                  <p>
                    This may include invoices, payment references, transaction
                    status, advertising purchases, service requests, refunds,
                    and related financial records.
                  </p>
                </div>

                <div className="privacy-info-card">
                  <h3>Technical information</h3>

                  <p>
                    This may include device, browser, network, security,
                    diagnostic, performance, and platform-usage information.
                  </p>
                </div>
              </div>
            </section>

            {/* 4 */}
            <section
              id="information-you-provide"
              className="privacy-section"
            >
              <span className="privacy-section-number">04</span>

              <h2>Information You Provide</h2>

              <p>
                We may collect information that you voluntarily provide when
                you:
              </p>

              <ul>
                <li>Create or manage an account.</li>
                <li>Register or manage a business.</li>
                <li>Submit a business listing.</li>
                <li>Submit products or services.</li>
                <li>Create advertising campaigns.</li>
                <li>Request promotional or marketing services.</li>
                <li>Make a payment.</li>
                <li>Request a refund or transaction assistance.</li>
                <li>Submit documents or media for a requested service.</li>
                <li>Contact our support or business team.</li>
              </ul>

              <p>
                You should only provide information that you are authorised to
                provide. If you submit information about another individual,
                you are responsible for ensuring that you have the appropriate
                authority to do so.
              </p>
            </section>

            {/* 5 */}
            <section id="automatic-information" className="privacy-section">
              <span className="privacy-section-number">05</span>

              <h2>Automatically Collected Information</h2>

              <p>
                When you access or use IFC BIZGROWTH, certain technical
                information may be collected automatically.
              </p>

              <ul>
                <li>IP address or network information.</li>
                <li>Browser type and version.</li>
                <li>Device type and operating system.</li>
                <li>Pages and services accessed.</li>
                <li>Approximate usage information.</li>
                <li>Authentication and security events.</li>
                <li>Performance and diagnostic information.</li>
              </ul>

              <p>
                We use this information where appropriate to operate, secure,
                troubleshoot, maintain, and improve the platform.
              </p>
            </section>

            {/* 6 */}
            <section id="lawful-basis" className="privacy-section">
              <span className="privacy-section-number">06</span>

              <h2>Lawful Basis for Processing</h2>

              <p>
                We process personal information only for lawful, specific,
                relevant, and legitimate purposes.
              </p>

              <p>
                Depending on the circumstances, the applicable lawful basis
                may include:
              </p>

              <ul>
                <li>
                  <strong>Performance of a contract:</strong> where processing
                  is necessary to provide an account or requested service.
                </li>

                <li>
                  <strong>Consent:</strong> where applicable law requires us
                  to obtain your consent before processing.
                </li>

                <li>
                  <strong>Legal obligation:</strong> where processing is
                  necessary to comply with applicable legal or regulatory
                  requirements.
                </li>

                <li>
                  <strong>Legitimate interests:</strong> where applicable,
                  such as maintaining security, preventing abuse, or
                  improving the platform, while taking appropriate account of
                  your rights and interests.
                </li>
              </ul>

              <p>
                Where processing is based on consent, you may withdraw that
                consent where permitted by applicable law. Withdrawal of
                consent does not affect processing that was lawfully carried
                out before withdrawal.
              </p>
            </section>

            {/* 7 */}
            <section
              id="how-we-use-information"
              className="privacy-section"
            >
              <span className="privacy-section-number">07</span>

              <h2>How We Use Information</h2>

              <p>We may use information to:</p>

              <ul>
                <li>Create and manage accounts.</li>
                <li>Provide requested services.</li>
                <li>Manage business listings.</li>
                <li>Display public business information.</li>
                <li>Process advertising and promotions.</li>
                <li>Process payments and transactions.</li>
                <li>Provide marketing services.</li>
                <li>Verify accounts or submitted business information.</li>
                <li>Send important service communications.</li>
                <li>Respond to enquiries and support requests.</li>
                <li>Detect fraud, abuse, or security threats.</li>
                <li>Maintain platform security.</li>
                <li>Improve platform performance and functionality.</li>
                <li>Meet legal and regulatory requirements.</li>
              </ul>
            </section>

            {/* 8 */}
            <section
              id="public-business-information"
              className="privacy-section"
            >
              <span className="privacy-section-number">08</span>

              <h2>Public Business Information</h2>

              <p>
                Public business discovery is an important part of IFC
                BIZGROWTH. Information that a business chooses to publish as
                part of its public listing may be visible to visitors and
                users of the platform.
              </p>

              <p>This may include:</p>

              <ul>
                <li>Business name.</li>
                <li>Business description.</li>
                <li>Business category.</li>
                <li>Business location information.</li>
                <li>Business contact information.</li>
                <li>Products and services.</li>
                <li>Business logo and images.</li>
                <li>Website and social links.</li>
                <li>Public promotions and advertising information.</li>
              </ul>

              <div className="privacy-note">
                <strong>Business responsibility</strong>

                <span>
                  Businesses should not publish sensitive personal information
                  through their public listing unless there is a lawful and
                  appropriate reason to do so.
                </span>
              </div>
            </section>

            {/* 9 */}
            <section id="payments" className="privacy-section">
              <span className="privacy-section-number">09</span>

              <h2>Payments</h2>

              <p>
                Some IFC BIZGROWTH services may require payment, including
                advertising, promotional packages, and other business-growth
                services.
              </p>

              <p>
                Where a third-party payment provider processes payment-card or
                other payment information, that provider may process the
                information under its own terms and privacy practices.
              </p>

              <p>
                IFC BIZGROWTH may receive transaction information needed to
                confirm and manage a transaction, including transaction
                reference, payment status, amount, currency, and related
                records.
              </p>

              <p>
                We do not intend to store complete payment-card details when
                those details are handled directly by an authorised payment
                provider.
              </p>
            </section>

            {/* 10 */}
            <section id="cookies" className="privacy-section">
              <span className="privacy-section-number">10</span>

              <h2>Cookies &amp; Similar Technologies</h2>

              <p>
                IFC BIZGROWTH may use cookies, local storage, session
                technologies, and similar technologies.
              </p>

              <h3>Necessary technologies</h3>

              <p>
                Necessary technologies may be used where required for core
                functionality, authentication, security, session management,
                accessibility, or network stability.
              </p>

              <h3>Optional technologies</h3>

              <p>
                Where optional cookies or similar tracking technologies are
                used for purposes such as analytics or other non-essential
                functions, we will provide appropriate notice and, where
                required, request your consent before using them.
              </p>

              <p>
                You may withdraw or change your cookie preferences through the
                cookie controls made available on the platform.
              </p>

              <div className="privacy-note">
                <strong>Cookie control</strong>

                <span>
                  IFC BIZGROWTH will not treat consent to optional cookies as
                  mandatory for access to services that do not require those
                  cookies.
                </span>
              </div>
            </section>

            {/* 11 */}
            <section id="sharing" className="privacy-section">
              <span className="privacy-section-number">11</span>

              <h2>How We Share Information</h2>

              <p>
                We do not treat personal information as a product to be sold to
                unrelated third parties.
              </p>

              <p>
                Information may be disclosed where reasonably necessary to
                provide services, operate the platform, process transactions,
                maintain security, or comply with applicable law.
              </p>

              <p>This may include:</p>

              <ul>
                <li>Technology and infrastructure providers.</li>
                <li>Payment and transaction providers.</li>
                <li>Email and communication providers.</li>
                <li>Authentication providers.</li>
                <li>Cloud storage or hosting providers.</li>
                <li>Professional advisers where necessary.</li>
                <li>Government or regulatory authorities where legally required.</li>
              </ul>

              <p>
                Public business information may also be visible to visitors
                because public business discovery is a core function of the
                platform.
              </p>
            </section>

            {/* 12 */}
            <section id="third-party-services" className="privacy-section">
              <span className="privacy-section-number">12</span>

              <h2>Third-Party Services</h2>

              <p>
                IFC BIZGROWTH may use third-party technology providers to
                provide parts of the platform.
              </p>

              <p>
                Depending on the service being used, our technology
                architecture may include providers such as:
              </p>

              <div className="privacy-provider-grid">
                <div>
                  <strong>Supabase</strong>
                  <span>Authentication, database, storage and related infrastructure.</span>
                </div>

                <div>
                  <strong>Paystack</strong>
                  <span>Payment processing where enabled for applicable transactions.</span>
                </div>

                <div>
                  <strong>Resend</strong>
                  <span>Email delivery where enabled for platform communications.</span>
                </div>

                <div>
                  <strong>Google</strong>
                  <span>Authentication where a user chooses Google sign-in.</span>
                </div>
              </div>

              <p>
                The availability and use of a particular third-party service
                may depend on the feature, account type, location, and stage of
                the IFC BIZGROWTH platform.
              </p>

              <p>
                Third-party providers may process information according to
                their own privacy policies and contractual obligations.
              </p>
            </section>

            {/* 13 */}
            <section id="security" className="privacy-section">
              <span className="privacy-section-number">13</span>

              <h2>Data Security</h2>

              <p>
                We take reasonable technical and organisational measures
                designed to protect personal information against unauthorised
                access, alteration, disclosure, loss, misuse, or destruction.
              </p>

              <p>Security measures may include:</p>

              <ul>
                <li>Authentication and access controls.</li>
                <li>Secure connections.</li>
                <li>Database security controls.</li>
                <li>Restricted administrative access.</li>
                <li>Monitoring and security processes.</li>
                <li>Appropriate internal procedures.</li>
              </ul>

              <p>
                No online service, internet transmission, or electronic storage
                system can be guaranteed to be completely secure.
              </p>
            </section>

            {/* 14 */}
            <section id="retention" className="privacy-section">
              <span className="privacy-section-number">14</span>

              <h2>Data Retention</h2>

              <p>
                We retain personal information only for as long as reasonably
                necessary for the purposes for which it was collected,
                including:
              </p>

              <ul>
                <li>Providing services.</li>
                <li>Maintaining account records.</li>
                <li>Maintaining transaction records.</li>
                <li>Resolving disputes.</li>
                <li>Preventing fraud and abuse.</li>
                <li>Enforcing agreements.</li>
                <li>Meeting legal or regulatory requirements.</li>
              </ul>

              <p>
                Retention periods may differ depending on the type of
                information and the purpose for which it is retained.
              </p>

              <p>
                When information is no longer required, we may delete,
                anonymise, or securely dispose of it, subject to applicable
                legal requirements and legitimate operational needs.
              </p>
            </section>

            {/* 15 */}
            <section id="your-rights" className="privacy-section">
              <span className="privacy-section-number">15</span>

              <h2>Your Privacy Rights</h2>

              <p>
                Subject to applicable law and lawful limitations, you may have
                rights regarding personal information processed by IFC
                BIZGROWTH.
              </p>

              <p>These may include rights to:</p>

              <ul>
                <li>Request access to your personal information.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion where applicable.</li>
                <li>Object to certain processing.</li>
                <li>Request restriction of certain processing.</li>
                <li>Withdraw consent where processing relies on consent.</li>
                <li>Request relevant information about our processing.</li>
                <li>Exercise other rights provided by applicable law.</li>
              </ul>

              <p>
                These rights are subject to applicable legal exceptions and
                may not apply in every circumstance.
              </p>

              <div className="privacy-note">
                <strong>Nigeria</strong>

                <span>
                  IFC BIZGROWTH recognises applicable Nigerian data-protection
                  requirements, including the Nigeria Data Protection Act
                  2023.
                </span>
              </div>
            </section>

            {/* 16 */}
            <section id="requests" className="privacy-section">
              <span className="privacy-section-number">16</span>

              <h2>Privacy Requests</h2>

              <p>
                To submit a privacy request, contact our privacy/support team
                using the details provided at the end of this policy.
              </p>

              <p>
                To protect users against unauthorised disclosure, we may need
                to verify your identity before completing certain requests.
              </p>

              <p>
                A request should clearly explain the information or action you
                are requesting. We will handle requests in accordance with
                applicable law.
              </p>

              <p>
                Where a request cannot lawfully be fulfilled, we may explain
                the applicable reason or limitation.
              </p>
            </section>

            {/* 17 */}
            <section id="children" className="privacy-section">
              <span className="privacy-section-number">17</span>

              <h2>Children&apos;s Privacy</h2>

              <p>
                IFC BIZGROWTH is primarily designed for businesses,
                entrepreneurs, organisations, and other users who can lawfully
                use our services.
              </p>

              <p>
                We do not knowingly seek to collect personal information from
                children where such collection is prohibited by applicable
                law.
              </p>

              <p>
                If you believe that a child has provided personal information
                to us inappropriately, please contact us so that we can review
                the matter and take appropriate action.
              </p>
            </section>

            {/* 18 */}
            <section
              id="international-transfers"
              className="privacy-section"
            >
              <span className="privacy-section-number">18</span>

              <h2>International Data Transfers</h2>

              <p>
                IFC BIZGROWTH is intended to operate across Africa and may use
                service providers whose systems, infrastructure, or personnel
                are located outside the country where you are located.
              </p>

              <p>
                Where personal information is transferred or processed across
                borders, we aim to apply appropriate safeguards and comply with
                applicable data-protection requirements.
              </p>
            </section>

            {/* 19 */}
            <section id="marketing" className="privacy-section">
              <span className="privacy-section-number">19</span>

              <h2>Marketing Communications</h2>

              <p>
                We may send communications that are necessary for your account,
                security, transactions, or requested services.
              </p>

              <p>
                Where we send optional marketing communications, you may
                unsubscribe or request that such communications stop, subject
                to applicable law.
              </p>

              <p>
                You can contact our support team if you believe you are
                receiving unwanted marketing communications from us.
              </p>
            </section>

            {/* 20 */}
            <section id="business-data" className="privacy-section">
              <span className="privacy-section-number">20</span>

              <h2>Business Data vs Personal Data</h2>

              <p>
                Information about a business is not necessarily personal data.
                However, business information may contain personal information
                where it identifies or relates to an individual.
              </p>

              <p>
                For example, a business contact number may constitute personal
                information if it identifies an individual depending on the
                circumstances.
              </p>

              <p>
                Businesses using IFC BIZGROWTH are responsible for ensuring
                that information about individuals submitted through their
                account is handled lawfully.
              </p>
            </section>

            {/* 21 */}
            <section
              id="third-party-websites"
              className="privacy-section"
            >
              <span className="privacy-section-number">21</span>

              <h2>Third-Party Websites</h2>

              <p>
                IFC BIZGROWTH may contain links to business websites,
                social-media profiles, payment pages, and other external
                services.
              </p>

              <p>
                Once you leave our platform and access a third-party service,
                that service&apos;s own privacy policy and terms may apply.
              </p>

              <p>
                IFC BIZGROWTH is not responsible for the privacy practices or
                security of third-party websites that we do not control.
              </p>
            </section>

            {/* 22 */}
            <section id="changes" className="privacy-section">
              <span className="privacy-section-number">22</span>

              <h2>Changes to This Privacy Policy</h2>

              <p>
                We may update this Privacy Policy when our services,
                technology, business operations, legal requirements, or data
                practices change.
              </p>

              <p>
                The latest version will be published on this page and the
                &quot;Last updated&quot; date will be changed accordingly.
              </p>

              <p>
                We encourage users to review this policy periodically.
              </p>
            </section>

            {/* 23 */}
            <section id="contact-privacy" className="privacy-section">
              <span className="privacy-section-number">23</span>

              <h2>Contact &amp; Privacy Enquiries</h2>

              <p>
                For privacy questions, data-subject requests, complaints about
                the handling of personal information, or questions about this
                Privacy Policy, contact IFC BIZGROWTH using the details below.
              </p>

              <div className="privacy-contact-card">
                <div className="privacy-contact-item">
                  <span>General Email</span>

                  <a href="mailto:email@ifcbizgrowth.africa">
                    email@ifcbizgrowth.africa
                  </a>
                </div>

                <div className="privacy-contact-item">
                  <span>Privacy &amp; Support</span>

                  <a href="mailto:support@ifcbizgrowth.africa">
                    support@ifcbizgrowth.africa
                  </a>
                </div>

                <div className="privacy-contact-item">
                  <span>Partnerships</span>

                  <a href="mailto:partnership@ifcbizgrowth.africa">
                    partnership@ifcbizgrowth.africa
                  </a>
                </div>

                <div className="privacy-contact-item">
                  <span>Phone / WhatsApp</span>

                  <a href="tel:+2349129809527">09129809527</a>
                </div>

                <div className="privacy-contact-item">
                  <span>Support Hours</span>

                  <strong>Monday – Friday, 8:00 AM – 6:00 PM</strong>
                </div>
              </div>

              <p className="privacy-final-note">
                IFC BIZGROWTH is committed to handling information responsibly
                and providing users with clear information about how their
                personal data is processed.
              </p>
            </section>

            {/* RELATED LINKS */}
            <div className="privacy-bottom-links">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact IFC BIZGROWTH</Link>
              <Link href="/about">About IFC BIZGROWTH</Link>
            </div>
          </article>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="privacy-footer">
        <div className="privacy-footer-inner">
          <div className="privacy-footer-brand">
            <Image
              src="/ifc-biz-growth.png"
              alt="IFC BIZGROWTH"
              width={155}
              height={48}
              className="privacy-footer-logo"
            />

            <p>
              An African business-growth platform helping businesses improve
              visibility, reach customers, and grow.
            </p>
          </div>

          <div className="privacy-footer-links">
            <div>
              <h3>Company</h3>

              <Link href="/about">About</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div>
              <h3>Legal</h3>

              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>

            <div>
              <h3>Business</h3>

              <Link href="/business/login">Business Login</Link>
              <Link href="/business/register">Register Business</Link>
            </div>
          </div>
        </div>

        <div className="privacy-footer-bottom">
          <span>
            © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
          </span>

          <span>Powered by IFC Bridge Lab</span>
        </div>
      </footer>
    </main>
  );
  }
