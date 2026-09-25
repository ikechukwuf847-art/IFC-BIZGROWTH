"use client";

import Link from "next/link";
import Image from "next/image";
import "./contact.css";

export default function ContactPage(): React.JSX.Element {
  const whatsappNumber: string = "2349129809527";
  const phoneNumber: string = "09129809527";

  return (
    <main className="contact-page">

      {/* HEADER */}
      <header className="contact-header">
        <div className="contact-header-inner">
          <Link href="/" className="contact-logo">
            <Image
              src="/ifc-biz-growth.png"
              alt="IFC BIZGROWTH"
              width={170}
              height={55}
              priority
            />
          </Link>

          <nav className="contact-nav">
            <Link href="/">Home</Link>
            <Link href="/businesses">Businesses</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact" className="active">
              Contact
            </Link>
          </nav>

          <Link href="/business/login" className="contact-business-btn">
            Business Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-content">
            <span className="contact-eyebrow">CONTACT IFC BIZGROWTH</span>

            <h1>
              We&apos;re here to help
              <span> your business grow.</span>
            </h1>

            <p>
              Have a question about IFC BIZGROWTH, business promotion,
              marketing services, or partnerships? Reach out to our team
              through any of the channels below.
            </p>
          </div>

          <div className="contact-hero-image">
            <Image
              src="/ifc-biz-growth.png"
              alt="IFC BIZGROWTH"
              width={320}
              height={110}
              priority
            />
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="contact-options-section">
        <div className="contact-container">

          <div className="contact-section-heading">
            <span>GET IN TOUCH</span>
            <h2>How can we help?</h2>
            <p>
              Choose the contact channel that best matches your enquiry.
            </p>
          </div>

          <div className="contact-options-grid">

            {/* GENERAL EMAIL */}
            <a
              href="mailto:email@ifcbizgrowth.africa"
              className="contact-card"
            >
              <div className="contact-card-icon">✉</div>

              <div>
                <span className="contact-card-label">
                  General Enquiries
                </span>

                <h3>email@ifcbizgrowth.africa</h3>

                <p>
                  For general questions and information about IFC BIZGROWTH.
                </p>
              </div>

              <span className="contact-arrow">→</span>
            </a>

            {/* SUPPORT */}
            <a
              href="mailto:support@ifcbizgrowth.africa"
              className="contact-card"
            >
              <div className="contact-card-icon">?</div>

              <div>
                <span className="contact-card-label">
                  Customer Support
                </span>

                <h3>support@ifcbizgrowth.africa</h3>

                <p>
                  For support relating to your IFC BIZGROWTH experience.
                </p>
              </div>

              <span className="contact-arrow">→</span>
            </a>

            {/* PARTNERSHIP */}
            <a
              href="mailto:partnership@ifcbizgrowth.africa"
              className="contact-card"
            >
              <div className="contact-card-icon">↗</div>

              <div>
                <span className="contact-card-label">
                  Partnerships
                </span>

                <h3>partnership@ifcbizgrowth.africa</h3>

                <p>
                  For partnership and business collaboration enquiries.
                </p>
              </div>

              <span className="contact-arrow">→</span>
            </a>

            {/* PHONE */}
            <a
              href={`tel:${phoneNumber}`}
              className="contact-card"
            >
              <div className="contact-card-icon">☎</div>

              <div>
                <span className="contact-card-label">
                  Phone
                </span>

                <h3>09129809527</h3>

                <p>
                  Speak with the IFC BIZGROWTH team directly.
                </p>
              </div>

              <span className="contact-arrow">→</span>
            </a>

          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section className="contact-whatsapp-section">
        <div className="contact-container">
          <div className="contact-whatsapp-card">

            <div className="whatsapp-content">
              <span className="whatsapp-label">
                QUICK SUPPORT
              </span>

              <h2>Chat with us on WhatsApp</h2>

              <p>
                For quick enquiries, you can contact the IFC BIZGROWTH
                team directly on WhatsApp.
              </p>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button"
              >
                Chat on WhatsApp
                <span>→</span>
              </a>
            </div>

            <div className="whatsapp-number">
              <span>WhatsApp</span>
              <strong>09129809527</strong>
            </div>

          </div>
        </div>
      </section>

      {/* BUSINESS ENQUIRIES */}
      <section className="contact-business-section">
        <div className="contact-container">

          <div className="business-contact-grid">

            <div>
              <span className="contact-eyebrow">
                FOR BUSINESSES
              </span>

              <h2>
                Looking to grow your business?
              </h2>

              <p>
                IFC BIZGROWTH helps businesses build visibility,
                reach customers and promote their products and services.
              </p>

              <Link
                href="/business/register"
                className="business-contact-button"
              >
                Get Started
                <span>→</span>
              </Link>
            </div>

            <div className="business-info-box">

              <div className="business-info-item">
                <span>Business enquiries</span>
                <strong>email@ifcbizgrowth.africa</strong>
              </div>

              <div className="business-info-item">
                <span>Partnerships</span>
                <strong>partnership@ifcbizgrowth.africa</strong>
              </div>

              <div className="business-info-item">
                <span>Support</span>
                <strong>support@ifcbizgrowth.africa</strong>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* OPENING HOURS */}
      <section className="contact-hours-section">
        <div className="contact-container">

          <div className="hours-card">

            <div className="hours-icon">
              ◷
            </div>

            <div className="hours-content">
              <span>OFFICE HOURS</span>

              <h2>Monday – Friday</h2>

              <p>
                8:00 AM – 6:00 PM
              </p>
            </div>

            <div className="hours-status">
              <span className="status-dot"></span>
              <span>Available during business hours</span>
            </div>

          </div>

        </div>
      </section>

      {/* SOCIAL MEDIA */}
      <section className="contact-social-section">
        <div className="contact-container">

          <div className="contact-section-heading">
            <span>STAY CONNECTED</span>

            <h2>Follow IFC BIZGROWTH</h2>

            <p>
              Our official social media channels will be available here.
            </p>
          </div>

          <div className="social-placeholder-grid">

            <div className="social-placeholder">
              <div className="social-icon">f</div>
              <div>
                <strong>Facebook</strong>
                <span>Coming soon</span>
              </div>
            </div>

            <div className="social-placeholder">
              <div className="social-icon">◎</div>
              <div>
                <strong>Instagram</strong>
                <span>Coming soon</span>
              </div>
            </div>

            <div className="social-placeholder">
              <div className="social-icon">♪</div>
              <div>
                <strong>TikTok</strong>
                <span>Coming soon</span>
              </div>
            </div>

            <div className="social-placeholder">
              <div className="social-icon">in</div>
              <div>
                <strong>LinkedIn</strong>
                <span>Coming soon</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="contact-footer">

        <div className="contact-container">

          <div className="footer-main">

            <div className="footer-brand">

              <Image
                src="/ifc-biz-growth.png"
                alt="IFC BIZGROWTH"
                width={160}
                height={52}
              />

              <p>
                Building opportunities for African businesses
                to grow, connect and reach more customers.
              </p>

              <span className="parent-company">
                An IFC Bridge Lab company
              </span>

            </div>

            <div className="footer-column">
              <h3>Company</h3>

              <Link href="/about">About Us</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div className="footer-column">
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

            <div className="footer-column">
              <h3>Contact</h3>

              <a href="mailto:email@ifcbizgrowth.africa">
                email@ifcbizgrowth.africa
              </a>

              <a href="mailto:support@ifcbizgrowth.africa">
                support@ifcbizgrowth.africa
              </a>

              <a href="tel:09129809527">
                09129809527
              </a>
            </div>

          </div>

          <div className="footer-bottom">

            <span>
              © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
            </span>

            <div>
              <Link href="/privacy">
                Privacy Policy
              </Link>

              <Link href="/terms">
                Terms &amp; Conditions
              </Link>
            </div>

          </div>

        </div>

      </footer>

    </main>
  );
        }
