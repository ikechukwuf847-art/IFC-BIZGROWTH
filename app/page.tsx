import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      {/* NAVIGATION */}
      <header className="landing-nav">
        <div className="landing-container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">
              IFC
              <span className="logo-arrow">↗</span>
            </span>

            <span className="logo-text">
              <strong>IFC BIZGROWTH</strong>
              <small>CONNECT · PROMOTE · GROW</small>
            </span>
          </Link>

          <nav className="nav-links">
            <Link href="/businesses">Businesses</Link>
            <Link href="/categories">Categories</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#for-businesses">For Businesses</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">
              Log in
            </Link>

            <Link href="/signup" className="nav-cta">
              List Your Business
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-grid" />

        <div className="landing-container hero-container">
          <div className="hero-copy">
            <div className="hero-badge">
              <span />
              Built for African businesses and customers
            </div>

            <h1>
              Discover businesses.
              <br />
              <em>Connect with confidence.</em>
            </h1>

            <p>
              IFC BIZGROWTH helps people discover businesses, products and
              services while giving businesses the opportunity to become more
              visible, reach new customers and grow.
            </p>

            <div className="hero-buttons">
              <Link href="/businesses" className="hero-primary">
                Explore Businesses
                <span>→</span>
              </Link>

              <Link href="/signup" className="hero-secondary">
                List Your Business
              </Link>
            </div>

            <div className="hero-trust">
              <div>
                <span className="check">✓</span>
                Verified businesses
              </div>

              <div>
                <span className="check">✓</span>
                Business information
              </div>

              <div>
                <span className="check">✓</span>
                Easy connections
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="visual-glow" />

            <div className="business-preview">
              <div className="preview-topbar">
                <div className="preview-brand">
                  <span className="preview-avatar">GT</span>

                  <div>
                    <strong>Golden Touch Spa</strong>
                    <small>Abuja, Nigeria</small>
                  </div>
                </div>

                <span className="verified-badge">
                  ✓ Verified
                </span>
              </div>

              <div className="preview-image">
                <div className="image-overlay">
                  <span>Beauty & Wellness</span>
                </div>
              </div>

              <div className="preview-content">
                <h3>Golden Touch Spa</h3>

                <p>
                  Beauty, wellness and professional spa services.
                </p>

                <div className="preview-details">
                  <span>● Open</span>
                  <span>Abuja</span>
                </div>

                <div className="preview-buttons">
                  <button type="button">View Business</button>
                  <button type="button">Contact</button>
                </div>
              </div>
            </div>

            <div className="floating-card floating-one">
              <span className="floating-icon">✓</span>

              <div>
                <strong>Verified Business</strong>
                <small>Information reviewed</small>
              </div>
            </div>

            <div className="floating-card floating-two">
              <span className="floating-icon gold">↗</span>

              <div>
                <strong>Get discovered</strong>
                <small>Reach more customers</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="landing-container">
          <p>
            A better way to discover and connect with businesses
          </p>

          <div className="trust-items">
            <span>BUSINESS DISCOVERY</span>
            <i />
            <span>VERIFIED BUSINESSES</span>
            <i />
            <span>PRODUCTS & SERVICES</span>
            <i />
            <span>DIRECT CONNECTION</span>
          </div>
        </div>
      </section>

      {/* WHY BIZGROWTH */}
      <section className="landing-section why-section">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-label">WHY IFC BIZGROWTH</span>

            <h2>
              Find what you need.
              <br />
              <span>Connect with businesses.</span>
            </h2>

            <p>
              Whether you are looking for a local business or trying to grow
              your own, IFC BIZGROWTH brings businesses and customers closer
              together.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card dark-feature">
              <span className="feature-number">01</span>

              <div className="feature-icon">⌕</div>

              <h3>Discover businesses</h3>

              <p>
                Find businesses, products and services in the categories that
                matter to you.
              </p>

              <Link href="/businesses">
                Explore businesses →
              </Link>
            </article>

            <article className="feature-card">
              <span className="feature-number">02</span>

              <div className="feature-icon dark-icon">✓</div>

              <h3>Verified businesses</h3>

              <p>
                Look for businesses that have completed IFC BIZGROWTH's
                verification process.
              </p>

              <Link href="/businesses">
                Find verified businesses →
              </Link>
            </article>

            <article className="feature-card">
              <span className="feature-number">03</span>

              <div className="feature-icon dark-icon">↗</div>

              <h3>Connect directly</h3>

              <p>
                Contact businesses through the information they provide,
                including phone, WhatsApp, websites and locations.
              </p>

              <Link href="/businesses">
                Start discovering →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* VERIFIED BUSINESSES */}
      <section className="verified-section">
        <div className="landing-container verified-container">
          <div className="verified-copy">
            <span className="section-label">BUILT AROUND TRUST</span>

            <h2>
              Discover businesses
              <span> with confidence.</span>
            </h2>

            <p>
              We want customers to have better information when deciding
              which businesses to contact. Businesses can submit their
              information for verification and display their verification
              status on their profile once approved.
            </p>

            <div className="verified-list">
              <div>
                <span>✓</span>
                Business information
              </div>

              <div>
                <span>✓</span>
                Verification status
              </div>

              <div>
                <span>✓</span>
                Products and services
              </div>

              <div>
                <span>✓</span>
                Contact and location details
              </div>
            </div>

            <Link href="/businesses" className="dark-button">
              Explore Businesses
              <span>→</span>
            </Link>
          </div>

          <div className="verification-card">
            <div className="verification-card-top">
              <span>BUSINESS PROFILE</span>

              <span className="verified-pill">
                ✓ VERIFIED
              </span>
            </div>

            <div className="verification-profile">
              <div className="large-avatar">GT</div>

              <div>
                <h3>Golden Touch Spa</h3>
                <p>Beauty & Wellness · Abuja</p>
              </div>
            </div>

            <div className="verification-divider" />

            <div className="verification-row">
              <span>Business status</span>
              <strong className="active-status">
                ● Active
              </strong>
            </div>

            <div className="verification-row">
              <span>Verification</span>
              <strong>Approved</strong>
            </div>

            <div className="verification-row">
              <span>Services</span>
              <strong>View services</strong>
            </div>

            <div className="verification-footer">
              <span>Verified through IFC BIZGROWTH</span>
              <span>✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section how-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-intro centered">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              Simple for customers.
              <br />
              <span>Powerful for businesses.</span>
            </h2>

            <p>
              We make discovering and connecting with businesses simple.
            </p>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <div className="how-number">01</div>

              <div className="how-icon">⌕</div>

              <h3>Discover</h3>

              <p>
                Browse businesses and explore products and services that
                match what you need.
              </p>
            </div>

            <div className="how-connector">
              <span>→</span>
            </div>

            <div className="how-card">
              <div className="how-number">02</div>

              <div className="how-icon">✓</div>

              <h3>Check</h3>

              <p>
                Review the business profile, information and verification
                status.
              </p>
            </div>

            <div className="how-connector">
              <span>→</span>
            </div>

            <div className="how-card">
              <div className="how-number">03</div>

              <div className="how-icon">↗</div>

              <h3>Connect</h3>

              <p>
                Contact the business, visit its website or find its location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="business-section" id="for-businesses">
        <div className="business-background" />

        <div className="landing-container business-container">
          <div className="business-copy">
            <span className="section-label">FOR BUSINESS OWNERS</span>

            <h2>
              Your business
              <br />
              <span>deserves to be discovered.</span>
            </h2>

            <p>
              Create your business presence on IFC BIZGROWTH and give
              potential customers a place to discover what you offer.
            </p>

            <div className="business-benefits">
              <div>
                <span>01</span>
                <div>
                  <strong>Build your business profile</strong>
                  <p>Show customers who you are and what you offer.</p>
                </div>
              </div>

              <div>
                <span>02</span>
                <div>
                  <strong>Show your products and services</strong>
                  <p>Give customers useful information before they contact you.</p>
                </div>
              </div>

              <div>
                <span>03</span>
                <div>
                  <strong>Promote your business</strong>
                  <p>Advertise your business and reach more potential customers.</p>
                </div>
              </div>

              <div>
                <span>04</span>
                <div>
                  <strong>Get marketing support</strong>
                  <p>Request help with social media, content, branding and campaigns.</p>
                </div>
              </div>
            </div>

            <Link href="/signup" className="gold-button">
              List Your Business
              <span>→</span>
            </Link>
          </div>

          <div className="business-panel">
            <div className="panel-header">
              <span>IFC BIZGROWTH</span>
              <span>BUSINESS</span>
            </div>

            <div className="panel-content">
              <span className="panel-label">YOUR BUSINESS PRESENCE</span>

              <h3>
                Connect.
                <br />
                Promote.
                <br />
                Grow.
              </h3>

              <div className="panel-line" />

              <div className="panel-stat">
                <span>Business profile</span>
                <strong>Ready to build</strong>
              </div>

              <div className="panel-stat">
                <span>Customer discovery</span>
                <strong>Available</strong>
              </div>

              <div className="panel-stat">
                <span>Growth opportunities</span>
                <strong>Start today</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-section">
        <div className="final-glow" />

        <div className="landing-container final-content">
          <span className="section-label">IFC BIZGROWTH</span>

          <h2>
            Better discovery.
            <br />
            <span>Better connections.</span>
          </h2>

          <p>
            Discover businesses around you or put your own business in front
            of more potential customers.
          </p>

          <div className="final-buttons">
            <Link href="/businesses" className="hero-primary">
              Explore Businesses
              <span>→</span>
            </Link>

            <Link href="/signup" className="final-outline">
              List Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container footer-main">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span className="logo-mark">
                IFC
                <span className="logo-arrow">↗</span>
              </span>

              <span className="logo-text">
                <strong>BIZGROWTH</strong>
                <small>CONNECT · PROMOTE · GROW</small>
              </span>
            </Link>

            <p>
              Helping businesses become more visible and helping customers
              discover businesses across Africa.
            </p>
          </div>

          <div className="footer-column">
            <h4>Discover</h4>
            <Link href="/businesses">Businesses</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/businesses">Verified Businesses</Link>
          </div>

          <div className="footer-column">
            <h4>For Businesses</h4>
            <Link href="/signup">List Your Business</Link>
            <Link href="/advertising">Advertising</Link>
            <Link href="/marketing">Marketing Services</Link>
            <Link href="/login">Business Login</Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        <div className="landing-container footer-bottom">
          <span>
            © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
          </span>

          <span>
            A product of IFC Bridge Lab
          </span>
        </div>
      </footer>
    </main>
  );
    }
