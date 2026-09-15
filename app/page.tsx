import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">

      {/* =========================================
          NAVBAR
      ========================================= */}

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


      {/* =========================================
          HERO
      ========================================= */}

      <section className="hero-section">
        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-eyebrow">
              AFRICAN BUSINESS DISCOVERY PLATFORM
            </div>

            <h1 className="hero-title">
              Find businesses.
              <br />
              <span>Connect with confidence.</span>
            </h1>

            <p className="hero-description">
              Discover businesses, products and services across Africa.
              Explore trusted business information and connect directly
              with the businesses you need.
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
                Verified businesses
              </div>

              <div className="hero-trust-item">
                Business information
              </div>

              <div className="hero-trust-item">
                Direct connections
              </div>

            </div>

          </div>


          {/* =====================================
              BUSINESS PREVIEW
          ===================================== */}

          <div className="hero-visual">

            <div className="business-preview">

              <div className="business-preview-header">

                <div className="business-avatar">
                  GT
                </div>

              </div>

              <div className="business-preview-body">

                <h2 className="business-preview-title">
                  Golden Touch Spa
                </h2>

                <p className="business-preview-location">
                  Abuja, Nigeria
                </p>

                <div className="business-verified">
                  ✓ Verified Business
                </div>

                <p className="business-preview-description">
                  Beauty and wellness services for individuals,
                  families and businesses.
                </p>

                <div className="business-preview-tags">
                  <span className="business-preview-tag">
                    Beauty
                  </span>

                  <span className="business-preview-tag">
                    Wellness
                  </span>

                  <span className="business-preview-tag">
                    Services
                  </span>
                </div>

                <div className="business-preview-actions">

                  <div className="business-preview-button primary">
                    View Business
                  </div>

                  <div className="business-preview-button">
                    Contact
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          TRUST STRIP
      ========================================= */}

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


      {/* =========================================
          WHY IFC BIZGROWTH
      ========================================= */}

      <section className="section">
        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              WHY IFC BIZGROWTH
            </span>

            <h2 className="section-title">
              A simpler way to discover businesses.
            </h2>

            <p className="section-description">
              We make it easier for people to discover businesses
              and easier for businesses to put themselves in front
              of potential customers.
            </p>

          </div>


          <div className="why-grid">

            <article className="why-card">

              <div className="why-icon">
                ◉
              </div>

              <h3>
                Discover businesses
              </h3>

              <p>
                Find businesses across different industries,
                locations and categories in one place.
              </p>

            </article>


            <article className="why-card">

              <div className="why-icon">
                ✓
              </div>

              <h3>
                Find verified businesses
              </h3>

              <p>
                Verification helps customers identify businesses
                that have gone through our verification process.
              </p>

            </article>


            <article className="why-card">

              <div className="why-icon">
                →
              </div>

              <h3>
                Connect directly
              </h3>

              <p>
                View business information and connect directly
                through the contact options provided by the business.
              </p>

            </article>

          </div>

        </div>
      </section>


      {/* =========================================
          VERIFIED BUSINESSES
      ========================================= */}

      <section className="section verified-section">
        <div className="section-container">

          <div className="verified-layout">

            <div className="verified-visual">

              <div className="verification-card">

                <div className="verification-top">

                  <div className="verification-company">

                    <div className="verification-logo">
                      B
                    </div>

                    <div>
                      <strong>
                        Business Profile
                      </strong>

                      <span>
                        Business information
                      </span>
                    </div>

                  </div>

                  <div className="verification-status">
                    ✓ VERIFIED
                  </div>

                </div>


                <div className="verification-list">

                  <div className="verification-list-item">
                    Business identity checked
                  </div>

                  <div className="verification-list-item">
                    Business information available
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
                Know who you are connecting with.
              </h2>

              <p className="section-description">
                IFC BIZGROWTH is designed to help customers
                make better decisions when discovering businesses.
                Business profiles can show important information,
                products, services and verification status.
              </p>


              <div className="verified-points">

                <div className="verified-point">

                  <div className="verified-point-icon">
                    ✓
                  </div>

                  <div>
                    <h4>
                      Verification status
                    </h4>

                    <p>
                      Quickly see whether a business has been
                      verified on the platform.
                    </p>
                  </div>

                </div>


                <div className="verified-point">

                  <div className="verified-point-icon">
                    B
                  </div>

                  <div>
                    <h4>
                      Complete business information
                    </h4>

                    <p>
                      Learn about the business, what it offers
                      and where it operates.
                    </p>
                  </div>

                </div>


                <div className="verified-point">

                  <div className="verified-point-icon">
                    →
                  </div>

                  <div>
                    <h4>
                      Easy connection
                    </h4>

                    <p>
                      Contact businesses directly using the
                      available contact options.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          HOW IT WORKS
      ========================================= */}

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
              Finding the right business doesn't need to be complicated.
            </p>

          </div>


          <div className="steps-grid">

            <article className="step-card">

              <div className="step-number">
                01
              </div>

              <h3>
                Discover
              </h3>

              <p>
                Explore businesses, categories, products and
                services available on IFC BIZGROWTH.
              </p>

            </article>


            <article className="step-card">

              <div className="step-number">
                02
              </div>

              <h3>
                Check
              </h3>

              <p>
                Review the business profile, information and
                verification status before making a decision.
              </p>

            </article>


            <article className="step-card">

              <div className="step-number">
                03
              </div>

              <h3>
                Connect
              </h3>

              <p>
                Contact the business directly and start your
                conversation.
              </p>

            </article>

          </div>

        </div>
      </section>


      {/* =========================================
          BUSINESS OWNERS
      ========================================= */}

      <section className="section business-owner-section">
        <div className="section-container">

          <div className="business-owner-layout">

            <div className="business-owner-content">

              <span className="section-label">
                FOR BUSINESS OWNERS
              </span>

              <h2 className="section-title">
                Put your business where customers can find it.
              </h2>

              <p className="section-description">
                Create a professional business presence on
                IFC BIZGROWTH and give potential customers
                a simple way to discover and connect with you.
              </p>


              <div className="owner-benefits">

                <div className="owner-benefit">
                  Create your business profile
                </div>

                <div className="owner-benefit">
                  Add your products and services
                </div>

                <div className="owner-benefit">
                  Show your business information
                </div>

                <div className="owner-benefit">
                  Promote your business
                </div>

                <div className="owner-benefit">
                  Get professional marketing support
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
                    Business Profile
                  </strong>

                  <span className="owner-dashboard-status">
                    ACTIVE
                  </span>

                </div>


                <div className="owner-dashboard-items">

                  <div className="owner-dashboard-item">
                    <span>Business information</span>
                    <span>Complete</span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>Products</span>
                    <span>Added</span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>Services</span>
                    <span>Added</span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>Verification</span>
                    <span>Available</span>
                  </div>

                  <div className="owner-dashboard-item">
                    <span>Customer connections</span>
                    <span>Track</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          FINAL CTA
      ========================================= */}

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
            business presence and start reaching more customers.
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


      {/* =========================================
          FOOTER
      ========================================= */}

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

              <h4>
                Discover
              </h4>

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

              <h4>
                Businesses
              </h4>

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

              <h4>
                Company
              </h4>

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
