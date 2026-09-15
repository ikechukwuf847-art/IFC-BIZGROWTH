import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      {/* NAVBAR */}
      <header className="site-navbar">
        <div className="navbar-inner">
          <Link href="/" className="site-logo">
            IFC <span>BIZGROWTH</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/businesses">Businesses</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/how-it-works">How It Works</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">
              Log in
            </Link>

            <Link href="/signup" className="nav-primary">
              List Your Business
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              AFRICAN BUSINESS-GROWTH PLATFORM
            </div>

            <h1 className="hero-title">
              Discover businesses.
              <br />
              <span>Connect with confidence.</span>
            </h1>

            <p className="hero-description">
              IFC BIZGROWTH helps people discover businesses,
              products and services while giving businesses the
              tools and support they need to become easier to find,
              connect with customers and grow.
            </p>

            <div className="hero-actions">
              <Link
                href="/businesses"
                className="hero-primary-button"
              >
                Explore Businesses →
              </Link>

              <Link
                href="/signup"
                className="hero-secondary-button"
              >
                List Your Business
              </Link>
            </div>

            <div className="hero-trust">
              <div className="hero-trust-item">
                Business discovery
              </div>

              <div className="hero-trust-item">
                Verified businesses
              </div>

              <div className="hero-trust-item">
                Direct connections
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="business-preview">
              <div className="business-preview-header">
                <div className="business-avatar">
                  IFC
                </div>
              </div>

              <div className="business-preview-body">
                <div className="business-preview-title">
                  Business Profile
                </div>

                <div className="business-preview-location">
                  Your business information
                </div>

                <div className="business-verified">
                  ✓ Verification available
                </div>

                <p className="business-preview-description">
                  Create a professional business presence where
                  customers can discover your business, products,
                  services and contact information.
                </p>

                <div className="business-preview-tags">
                  <span className="business-preview-tag">
                    Business
                  </span>

                  <span className="business-preview-tag">
                    Products
                  </span>

                  <span className="business-preview-tag">
                    Services
                  </span>
                </div>

                <div className="business-preview-actions">
                  <div className="business-preview-button primary">
                    Business Profile
                  </div>

                  <div className="business-preview-button">
                    Connect
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="trust-strip-inner">
          <div className="trust-item">
            <span className="trust-icon">B</span>
            Business Discovery
          </div>

          <div className="trust-item">
            <span className="trust-icon">✓</span>
            Verified Businesses
          </div>

          <div className="trust-item">
            <span className="trust-icon">P</span>
            Products & Services
          </div>

          <div className="trust-item">
            <span className="trust-icon">→</span>
            Direct Connection
          </div>
        </div>
      </section>

      {/* WHY IFC BIZGROWTH */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">
              WHY IFC BIZGROWTH
            </span>

            <h2 className="section-title">
              A better way to discover and grow businesses.
            </h2>

            <p className="section-description">
              IFC BIZGROWTH brings business discovery, business
              visibility, advertising and marketing support together
              in one platform.
            </p>
          </div>

          <div className="why-grid">
            <article className="why-card">
              <div className="why-icon">◉</div>

              <h3>Discover businesses</h3>

              <p>
                Explore businesses across different industries,
                locations and categories from one place.
              </p>
            </article>

            <article className="why-card">
              <div className="why-icon">✓</div>

              <h3>Verified businesses</h3>

              <p>
                Businesses can go through our verification process
                so customers can identify their verification status
                before connecting.
              </p>
            </article>

            <article className="why-card">
              <div className="why-icon">→</div>

              <h3>Connect directly</h3>

              <p>
                Find the business information you need and connect
                using the contact options provided by the business.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* VERIFICATION */}
      <section className="section verified-section">
        <div className="section-container">
          <div className="verified-layout">
            <div className="verified-visual">
              <div className="verification-card">
                <div className="verification-top">
                  <div className="verification-company">
                    <div className="verification-logo">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Business Verification
                      </strong>

                      <span>
                        Verification status
                      </span>
                    </div>
                  </div>

                  <div className="verification-status">
                    VERIFIED
                  </div>
                </div>

                <div className="verification-list">
                  <div className="verification-list-item">
                    Business identity
                  </div>

                  <div className="verification-list-item">
                    Business information
                  </div>

                  <div className="verification-list-item">
                    Products and services
                  </div>

                  <div className="verification-list-item">
                    Contact information
                  </div>

                  <div className="verification-list-item">
                    Business location
                  </div>
                </div>
              </div>
            </div>

            <div className="verified-content">
              <span className="section-label">
                TRUST
              </span>

              <h2 className="section-title">
                Make better decisions before you connect.
              </h2>

              <p className="section-description">
                IFC BIZGROWTH is designed to give customers useful
                business information before they decide to connect.
                Businesses can submit information for verification
                and display their verification status on the platform.
              </p>

              <div className="verified-points">
                <div className="verified-point">
                  <div className="verified-point-icon">
                    ✓
                  </div>

                  <div>
                    <h4>Clear verification status</h4>

                    <p>
                      See whether a business has completed the
                      IFC BIZGROWTH verification process.
                    </p>
                  </div>
                </div>

                <div className="verified-point">
                  <div className="verified-point-icon">
                    B
                  </div>

                  <div>
                    <h4>Useful business information</h4>

                    <p>
                      View information about what a business
                      offers, where it operates and how to reach it.
                    </p>
                  </div>
                </div>

                <div className="verified-point">
                  <div className="verified-point-icon">
                    →
                  </div>

                  <div>
                    <h4>Connect with businesses</h4>

                    <p>
                      Use the available business contact options
                      to start a direct connection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2 className="section-title">
              Discover. Check. Connect.
            </h2>

            <p className="section-description">
              A simple way for customers to discover businesses
              and for businesses to build their presence.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">
                01
              </div>

              <h3>Discover</h3>

              <p>
                Explore businesses, categories, products and
                services available on IFC BIZGROWTH.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">
                02
              </div>

              <h3>Check</h3>

              <p>
                Review available business information and
                verification status before making a decision.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">
                03
              </div>

              <h3>Connect</h3>

              <p>
                Contact the business directly using the
                available contact options.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* BUSINESS OWNERS */}
      <section className="section business-owner-section">
        <div className="section-container">
          <div className="business-owner-layout">
            <div className="business-owner-content">
              <span className="section-label">
                FOR BUSINESS OWNERS
              </span>

              <h2 className="section-title">
                Give your business a place to be discovered.
              </h2>

              <p className="section-description">
                Create a professional business presence on
                IFC BIZGROWTH and make it easier for potential
                customers to find and connect with your business.
              </p>

              <div className="owner-benefits">
                <div className="owner-benefit">
                  Create your business profile
                </div>

                <div className="owner-benefit">
                  Add your products
                </div>

                <div className="owner-benefit">
                  Add your services
                </div>

                <div className="owner-benefit">
                  Provide business information
                </div>

                <div className="owner-benefit">
                  Promote your business
                </div>

                <div className="owner-benefit">
                  Get marketing support
                </div>
              </div>

              <div className="hero-actions">
                <Link
                  href="/signup"
                  className="hero-primary-button"
                >
                  List Your Business →
                </Link>
              </div>
            </div>

            <div className="owner-visual">
              <div className="owner-dashboard-card">
                <div className="owner-dashboard-header">
                  <strong>
                    Business Management
                  </strong>

                  <span className="owner-dashboard-status">
                    YOUR BUSINESS
                  </span>
                </div>

                <div className="owner-dashboard-items">
                  <div className="owner-dashboard-item">
                    <span>
                      Business profile
                    </span>

                    <span>
                      Manage
                    </span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>
                      Products
                    </span>

                    <span>
                      Manage
                    </span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>
                      Services
                    </span>

                    <span>
                      Manage
                    </span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>
                      Advertising
                    </span>

                    <span>
                      Promote
                    </span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>
                      Marketing
                    </span>

                    <span>
                      Get support
                    </span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>
                      Analytics
                    </span>

                    <span>
                      View
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <span className="section-label">
            IFC BIZGROWTH
          </span>

          <h2>
            Discover better.
            <br />
            Connect smarter.
          </h2>

          <p>
            Explore businesses across Africa or create your
            business presence and start building your visibility.
          </p>

          <div className="final-cta-actions">
            <Link
              href="/businesses"
              className="hero-primary-button"
            >
              Explore Businesses
            </Link>

            <Link
              href="/signup"
              className="hero-secondary-button"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="site-logo">
                IFC <span>BIZGROWTH</span>
              </Link>

              <p>
                An African business-growth platform helping
                businesses become easier to discover, connect
                with customers and grow their presence.
              </p>
            </div>

            <div className="footer-column">
              <h4>Discover</h4>

              <Link href="/businesses">
                Businesses
              </Link>

              <Link href="/categories">
                Categories
              </Link>

              <Link href="/how-it-works">
                How It Works
              </Link>
            </div>

            <div className="footer-column">
              <h4>Businesses</h4>

              <Link href="/signup">
                List Your Business
              </Link>

              <Link href="/login">
                Business Login
              </Link>

              <Link href="/business/marketing">
                Marketing Support
              </Link>
            </div>

            <div className="footer-column">
              <h4>Company</h4>

              <Link href="/about">
                About IFC BIZGROWTH
              </Link>

              <Link href="/contact">
                Contact
              </Link>

              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/terms">
                Terms
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} IFC BIZGROWTH.
              All rights reserved.
            </p>

            <p>
              A product of IFC Bridge Lab
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
        }
