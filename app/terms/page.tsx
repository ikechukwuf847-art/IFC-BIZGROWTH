"use client";

import Link from "next/link";
import Image from "next/image";
import "./terms.css";

export default function TermsPage(): React.JSX.Element {
  const lastUpdated = "25 September 2026";

  return (
    <main className="terms-page">

      {/* HEADER */}
      <header className="terms-header">
        <div className="terms-header-inner">

          <Link href="/" className="terms-logo">
            <Image
              src="/ifc-biz-growth.png"
              alt="IFC BIZGROWTH"
              width={170}
              height={55}
              priority
            />
          </Link>

          <nav className="terms-nav">
            <Link href="/">Home</Link>
            <Link href="/businesses">Businesses</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <Link
            href="/business/login"
            className="terms-business-btn"
          >
            Business Login
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="terms-hero">
        <div className="terms-container">

          <span className="terms-eyebrow">
            LEGAL
          </span>

          <h1>
            Terms &amp; Conditions
          </h1>

          <p>
            These Terms &amp; Conditions govern your access to and use
            of IFC BIZGROWTH and the services made available through
            the platform.
          </p>

          <div className="terms-updated">
            <span>Last Updated</span>
            <strong>{lastUpdated}</strong>
          </div>

        </div>
      </section>

      {/* CONTENT */}
      <section className="terms-content-section">
        <div className="terms-layout">

          {/* SIDEBAR */}
          <aside className="terms-sidebar">

            <div className="terms-sidebar-card">

              <span>ON THIS PAGE</span>

              <a href="#introduction">1. Introduction</a>
              <a href="#definitions">2. Definitions</a>
              <a href="#acceptance">3. Acceptance of Terms</a>
              <a href="#eligibility">4. Eligibility</a>
              <a href="#accounts">5. Accounts</a>
              <a href="#business-listings">6. Business Listings</a>
              <a href="#promotion">7. Advertising &amp; Promotion</a>
              <a href="#marketing">8. Marketing Services</a>
              <a href="#payments">9. Payments &amp; Billing</a>
              <a href="#prohibited">10. Prohibited Activities</a>
              <a href="#content">11. Content &amp; Intellectual Property</a>
              <a href="#verification">12. Verification</a>
              <a href="#third-party">13. Third-Party Services</a>
              <a href="#availability">14. Platform Availability</a>
              <a href="#disclaimer">15. Disclaimers</a>
              <a href="#liability">16. Liability</a>
              <a href="#indemnification">17. Indemnification</a>
              <a href="#termination">18. Suspension &amp; Termination</a>
              <a href="#privacy">19. Privacy</a>
              <a href="#changes">20. Changes to Terms</a>
              <a href="#law">21. Governing Law</a>
              <a href="#contact">22. Contact</a>

            </div>

          </aside>

          {/* MAIN DOCUMENT */}
          <article className="terms-document">

            {/* 1 */}
            <section id="introduction" className="terms-section">
              <span className="terms-number">01</span>

              <h2>Introduction</h2>

              <p>
                Welcome to IFC BIZGROWTH. IFC BIZGROWTH is an African
                business-growth platform operated by IFC Bridge Lab.
                The platform is designed to help businesses build
                visibility, promote their products and services, reach
                potential customers and access business-growth services.
              </p>

              <p>
                These Terms &amp; Conditions (&quot;Terms&quot;) govern
                your access to and use of the IFC BIZGROWTH website,
                applications, business services, advertising services,
                marketing services and other services that we may make
                available from time to time.
              </p>

              <p>
                By accessing, registering for, or using IFC BIZGROWTH,
                you agree to comply with these Terms and any applicable
                policies referenced in them.
              </p>
            </section>

            {/* 2 */}
            <section id="definitions" className="terms-section">
              <span className="terms-number">02</span>

              <h2>Definitions</h2>

              <p>
                In these Terms:
              </p>

              <ul>
                <li>
                  <strong>&quot;IFC BIZGROWTH&quot;</strong> means the
                  IFC BIZGROWTH platform, website, applications and
                  services operated by IFC Bridge Lab.
                </li>

                <li>
                  <strong>&quot;Business&quot;</strong> means a company,
                  organisation, entrepreneur, merchant or other business
                  entity using or seeking to use IFC BIZGROWTH.
                </li>

                <li>
                  <strong>&quot;User&quot;</strong> means any person
                  accessing or using the platform.
                </li>

                <li>
                  <strong>&quot;Customer&quot;</strong> means a person
                  using the platform to discover or interact with a
                  business.
                </li>

                <li>
                  <strong>&quot;Services&quot;</strong> means the
                  business-growth, advertising, promotion, marketing,
                  directory and other services provided through
                  IFC BIZGROWTH.
                </li>

                <li>
                  <strong>&quot;Platform&quot;</strong> means the
                  websites, applications and digital systems through
                  which IFC BIZGROWTH services are provided.
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section id="acceptance" className="terms-section">
              <span className="terms-number">03</span>

              <h2>Acceptance of Terms</h2>

              <p>
                By using IFC BIZGROWTH, you confirm that you have read,
                understood and agreed to these Terms.
              </p>

              <p>
                If you do not agree with these Terms, you should not
                use the platform or any IFC BIZGROWTH service.
              </p>

              <p>
                Certain services may have additional terms, conditions,
                pricing rules or requirements. Where additional terms
                apply, they will form part of your agreement with
                IFC BIZGROWTH for that service.
              </p>
            </section>

            {/* 4 */}
            <section id="eligibility" className="terms-section">
              <span className="terms-number">04</span>

              <h2>Eligibility</h2>

              <p>
                You may use IFC BIZGROWTH only where you are legally
                permitted to enter into an agreement of this nature
                under the laws applicable to you.
              </p>

              <p>
                If you register or act on behalf of a business, you
                represent that you have the authority to act for that
                business and to accept these Terms on its behalf.
              </p>

              <p>
                You are responsible for ensuring that your use of the
                platform complies with all laws, regulations and
                professional requirements applicable to you.
              </p>
            </section>

            {/* 5 */}
            <section id="accounts" className="terms-section">
              <span className="terms-number">05</span>

              <h2>Accounts &amp; Registration</h2>

              <p>
                Certain IFC BIZGROWTH services require an account.
                When creating an account, you must provide information
                that is accurate, complete and current.
              </p>

              <p>
                You are responsible for maintaining the confidentiality
                of your account credentials and for activity carried
                out through your account.
              </p>

              <p>
                You must notify IFC BIZGROWTH if you reasonably believe
                that your account has been accessed without your
                permission or that your account credentials have been
                compromised.
              </p>

              <p>
                You must not create an account using another person's
                identity, impersonate another person or business, or
                provide information intended to mislead IFC BIZGROWTH
                or other users.
              </p>
            </section>

            {/* 6 */}
            <section id="business-listings" className="terms-section">
              <span className="terms-number">06</span>

              <h2>Business Listings</h2>

              <p>
                Businesses may provide information about their business,
                products, services, locations, operating hours, contact
                information and other permitted information for display
                on IFC BIZGROWTH.
              </p>

              <p>
                Businesses are responsible for ensuring that information
                submitted to the platform is accurate, current and not
                misleading.
              </p>

              <p>
                A business must not submit information that infringes
                another person's rights, contains unlawful material,
                impersonates another business or is intended to deceive
                customers.
              </p>

              <p>
                IFC BIZGROWTH may review, restrict, edit where
                appropriate, reject or remove information that violates
                these Terms, applicable law or our platform requirements.
              </p>
            </section>

            {/* 7 */}
            <section id="promotion" className="terms-section">
              <span className="terms-number">07</span>

              <h2>Advertising &amp; Promotion</h2>

              <p>
                IFC BIZGROWTH may provide businesses with advertising,
                promotional placement, customer-acquisition and other
                visibility services.
              </p>

              <p>
                Businesses are responsible for ensuring that advertising
                information, promotional claims, prices, offers and
                other materials submitted for publication are accurate
                and comply with applicable laws and regulations.
              </p>

              <p>
                IFC BIZGROWTH may refuse, suspend or remove advertising
                material that does not meet applicable requirements.
              </p>

              <div className="terms-notice">
                <strong>No guaranteed business results</strong>
                <p>
                  Advertising or promotional services do not guarantee
                  a specific number of customers, leads, impressions,
                  enquiries, sales, revenue or other commercial results.
                </p>
              </div>
            </section>

            {/* 8 */}
            <section id="marketing" className="terms-section">
              <span className="terms-number">08</span>

              <h2>Marketing Services</h2>

              <p>
                Where available, IFC BIZGROWTH may provide marketing,
                promotional-content, advertising-management, social
                media or related business-growth services.
              </p>

              <p>
                The exact scope of a marketing service may depend on the
                service purchased, agreed deliverables, campaign
                requirements and information supplied by the business.
              </p>

              <p>
                Businesses are responsible for providing accurate
                information, necessary approvals and materials required
                to perform the agreed service.
              </p>

              <p>
                Marketing services are provided to support business
                growth and visibility and do not constitute a guarantee
                of particular commercial outcomes.
              </p>
            </section>

            {/* 9 */}
            <section id="payments" className="terms-section">
              <span className="terms-number">09</span>

              <h2>Payments, Pricing &amp; Billing</h2>

              <p>
                Some IFC BIZGROWTH services may require payment. Where
                payment is required, the applicable price and material
                payment conditions will be presented before or at the
                point of purchase.
              </p>

              <p>
                You are responsible for providing accurate payment
                information and ensuring that the payment method used
                is authorised for the transaction.
              </p>

              <p>
                Prices may change from time to time. A price change will
                not alter a transaction that has already been completed,
                except where otherwise permitted or required by law.
              </p>

              <p>
                Where refunds are available, they will be handled
                according to the applicable service terms, refund
                policy and applicable law.
              </p>

              <p>
                IFC BIZGROWTH may use third-party payment providers to
                process transactions. Payment processing may therefore
                also be subject to the terms and policies of the
                applicable payment provider.
              </p>
            </section>

            {/* 10 */}
            <section id="prohibited" className="terms-section">
              <span className="terms-number">10</span>

              <h2>Prohibited Activities</h2>

              <p>
                You must not use IFC BIZGROWTH to:
              </p>

              <ul>
                <li>
                  Commit, facilitate or promote unlawful activity.
                </li>

                <li>
                  Defraud, deceive or deliberately mislead another
                  person or business.
                </li>

                <li>
                  Impersonate another person, company or organisation.
                </li>

                <li>
                  Upload or distribute malicious software or harmful
                  code.
                </li>

                <li>
                  Attempt to gain unauthorised access to accounts,
                  systems or platform infrastructure.
                </li>

                <li>
                  Manipulate listings, advertising, reviews, rankings
                  or platform activity through fraudulent means.
                </li>

                <li>
                  Submit content that infringes intellectual-property,
                  privacy or other legal rights.
                </li>

                <li>
                  Use the platform in a manner that could damage,
                  disable, overburden or interfere with its operation.
                </li>

                <li>
                  Circumvent security, authentication or access
                  controls.
                </li>
              </ul>
            </section>

            {/* 11 */}
            <section id="content" className="terms-section">
              <span className="terms-number">11</span>

              <h2>Content &amp; Intellectual Property</h2>

              <p>
                IFC BIZGROWTH and its licensors retain rights in the
                platform, software, branding, logos, designs, text,
                graphics and other materials provided by IFC BIZGROWTH,
                except where ownership belongs to another party.
              </p>

              <p>
                You must not copy, reproduce, modify, distribute,
                reverse engineer, commercially exploit or otherwise use
                IFC BIZGROWTH materials except where permitted by law
                or expressly authorised by IFC BIZGROWTH.
              </p>

              <p>
                Businesses retain ownership of content and information
                that they lawfully own and submit to the platform.
              </p>

              <p>
                By submitting content to IFC BIZGROWTH, you grant IFC
                BIZGROWTH permission to host, reproduce, display,
                distribute and use that content as reasonably necessary
                to provide, operate, promote and improve the relevant
                platform services.
              </p>

              <p>
                You represent that you have the necessary rights and
                permissions to submit the content.
              </p>
            </section>

            {/* 12 */}
            <section id="verification" className="terms-section">
              <span className="terms-number">12</span>

              <h2>Business Verification</h2>

              <p>
                IFC BIZGROWTH may offer business verification or
                verification-related services.
              </p>

              <p>
                Where a business is marked as verified, verification
                indicates only that IFC BIZGROWTH has completed the
                applicable verification process or checks associated
                with that status.
              </p>

              <p>
                Verification does not constitute a guarantee,
                endorsement or certification of the business's products,
                services, financial position, quality, safety,
                legality, performance or future conduct.
              </p>
            </section>

            {/* 13 */}
            <section id="third-party" className="terms-section">
              <span className="terms-number">13</span>

              <h2>Third-Party Services &amp; Links</h2>

              <p>
                IFC BIZGROWTH may contain links to or integrations with
                third-party websites, applications, payment providers,
                communication services or other external services.
              </p>

              <p>
                Third-party services are operated independently from IFC
                BIZGROWTH and may have their own terms and privacy
                policies.
              </p>

              <p>
                You should review the terms applicable to a third-party
                service before using it.
              </p>
            </section>

            {/* 14 */}
            <section id="availability" className="terms-section">
              <span className="terms-number">14</span>

              <h2>Platform Availability</h2>

              <p>
                We aim to keep IFC BIZGROWTH available and functioning
                reliably, but we do not guarantee that the platform will
                always be available, uninterrupted, error-free or free
                from technical defects.
              </p>

              <p>
                The platform may occasionally be unavailable because
                of maintenance, upgrades, security measures, technical
                failures, third-party services, network issues or
                circumstances outside our reasonable control.
              </p>
            </section>

            {/* 15 */}
            <section id="disclaimer" className="terms-section">
              <span className="terms-number">15</span>

              <h2>Disclaimers</h2>

              <p>
                IFC BIZGROWTH provides a platform through which
                businesses may present information and promote their
                products and services.
              </p>

              <p>
                Information relating to a business may be supplied or
                maintained by that business. Users should independently
                evaluate a business, product or service before entering
                into a transaction.
              </p>

              <p>
                IFC BIZGROWTH does not, merely by listing or displaying
                a business, guarantee the quality, safety, legality,
                availability, suitability or performance of that
                business's products or services.
              </p>

              <p>
                Nothing in these Terms removes or limits any right,
                remedy, warranty or protection that cannot lawfully be
                excluded or limited under applicable law.
              </p>
            </section>

            {/* 16 */}
            <section id="liability" className="terms-section">
              <span className="terms-number">16</span>

              <h2>Limitation of Liability</h2>

              <p>
                To the extent permitted by applicable law, IFC BIZGROWTH
                and IFC Bridge Lab will not be responsible for losses
                arising solely from your use of or reliance on
                information supplied by another user or business,
                transactions between users and businesses, or the
                independent acts or omissions of third parties.
              </p>

              <p>
                Nothing in these Terms is intended to exclude or limit
                liability where such exclusion or limitation is
                prohibited by applicable law, including liability that
                cannot lawfully be excluded for fraud, certain forms of
                negligence, defective goods or services, or other
                protected rights.
              </p>
            </section>

            {/* 17 */}
            <section id="indemnification" className="terms-section">
              <span className="terms-number">17</span>

              <h2>Indemnification</h2>

              <p>
                To the extent permitted by applicable law, you agree to
                be responsible for claims, losses, liabilities, costs
                and reasonable expenses arising from your unlawful use
                of the platform, your violation of these Terms, or your
                infringement of another person's rights.
              </p>

              <p>
                This section does not require you to indemnify IFC
                BIZGROWTH for matters caused by IFC BIZGROWTH's own
                unlawful conduct or for obligations that cannot lawfully
                be transferred to you.
              </p>
            </section>

            {/* 18 */}
            <section id="termination" className="terms-section">
              <span className="terms-number">18</span>

              <h2>Suspension &amp; Termination</h2>

              <p>
                You may stop using IFC BIZGROWTH at any time, subject to
                any outstanding obligations relating to services already
                purchased.
              </p>

              <p>
                IFC BIZGROWTH may suspend or terminate an account,
                listing, campaign or service where reasonably necessary
                to address a violation of these Terms, suspected fraud,
                security concerns, unlawful activity, abuse of the
                platform or other circumstances permitted by applicable
                law.
              </p>

              <p>
                Where appropriate, IFC BIZGROWTH may provide notice and
                an opportunity to address an issue before taking action.
                This does not prevent immediate action where necessary
                for security, legal compliance or protection of users
                and the platform.
              </p>
            </section>

            {/* 19 */}
            <section id="privacy" className="terms-section">
              <span className="terms-number">19</span>

              <h2>Privacy</h2>

              <p>
                Your use of IFC BIZGROWTH may involve the collection
                and processing of personal information.
              </p>

              <p>
                Our handling of personal information is described in our
                Privacy Policy, which forms part of the legal information
                governing your use of the platform.
              </p>

              <p>
                You should review the Privacy Policy before using
                services that require personal information.
              </p>

              <Link
                href="/privacy"
                className="terms-inline-link"
              >
                Read our Privacy Policy →
              </Link>
            </section>

            {/* 20 */}
            <section id="changes" className="terms-section">
              <span className="terms-number">20</span>

              <h2>Changes to These Terms</h2>

              <p>
                We may update these Terms from time to time to reflect
                changes to our services, technology, legal requirements
                or business operations.
              </p>

              <p>
                When we make changes, we will update the
                &quot;Last Updated&quot; date shown on this page.
              </p>

              <p>
                Where applicable law requires additional notice for
                material changes, we will provide that notice using
                an appropriate method.
              </p>
            </section>

            {/* 21 */}
            <section id="law" className="terms-section">
              <span className="terms-number">21</span>

              <h2>Governing Law &amp; Disputes</h2>

              <p>
                These Terms are intended to operate in accordance with
                applicable laws and regulations of the Federal Republic
                of Nigeria, to the extent those laws apply to your use
                of IFC BIZGROWTH and the relevant transaction.
              </p>

              <p>
                Nothing in these Terms prevents a consumer or other
                protected person from exercising a mandatory legal right
                or remedy available under applicable law.
              </p>

              <p>
                Where a dispute cannot be resolved directly between the
                parties, it may be referred to a court or other
                competent dispute-resolution body with jurisdiction
                under applicable law.
              </p>
            </section>

            {/* 22 */}
            <section id="contact" className="terms-section">
              <span className="terms-number">22</span>

              <h2>Contact IFC BIZGROWTH</h2>

              <p>
                If you have questions about these Terms or require
                clarification about a service, you can contact us using
                the details below.
              </p>

              <div className="terms-contact-box">

                <div>
                  <span>General Enquiries</span>
                  <a href="mailto:email@ifcbizgrowth.africa">
                    email@ifcbizgrowth.africa
                  </a>
                </div>

                <div>
                  <span>Customer Support</span>
                  <a href="mailto:support@ifcbizgrowth.africa">
                    support@ifcbizgrowth.africa
                  </a>
                </div>

                <div>
                  <span>Partnerships</span>
                  <a href="mailto:partnership@ifcbizgrowth.africa">
                    partnership@ifcbizgrowth.africa
                  </a>
                </div>

                <div>
                  <span>Phone / WhatsApp</span>
                  <a href="tel:09129809527">
                    09129809527
                  </a>
                </div>

              </div>
            </section>

          </article>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="terms-footer">
        <div className="terms-container">

          <div className="terms-footer-main">

            <div className="terms-footer-brand">

              <Image
                src="/ifc-biz-growth.png"
                alt="IFC BIZGROWTH"
                width={160}
                height={52}
              />

              <p>
                Building opportunities for African businesses to grow,
                connect and reach more customers.
              </p>

              <span>
                An IFC Bridge Lab company
              </span>

            </div>

            <div className="terms-footer-column">
              <h3>Company</h3>

              <Link href="/about">About Us</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div className="terms-footer-column">
              <h3>Businesses</h3>

              <Link href="/businesses">
                Find Businesses
              </Link>

              <Link href="/business/register">
                Register Business
              </Link>

              <Link href="/business/login">
                Business Login
              </Link>
            </div>

            <div className="terms-footer-column">
              <h3>Legal</h3>

              <Link href="/terms">
                Terms &amp; Conditions
              </Link>

              <Link href="/privacy">
                Privacy Policy
              </Link>
            </div>

          </div>

          <div className="terms-footer-bottom">

            <span>
              © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
            </span>

            <span>
              An IFC Bridge Lab company
            </span>

          </div>

        </div>
      </footer>

    </main>
  );
  }
