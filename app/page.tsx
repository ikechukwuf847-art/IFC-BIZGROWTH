import Link from "next/link";

export default function Home() {
  return (
    <main className="site">

      {/* ==================== NAVBAR ==================== */}
      <header className="navbar">
        <div className="nav-inner">

          <Link href="/" className="brand">
            <div className="brand-mark">
              IFC
              <span>↗</span>
            </div>

            <div className="brand-text">
              <strong>BIZGROWTH</strong>
              <small>CONNECT · PROMOTE · GROW</small>
            </div>
          </Link>

          <nav className="desktop-nav">
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#benefits">Benefits</Link>
            <Link href="#advertising">Advertising</Link>
            <Link href="#pricing">Pricing</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="login-link">
              Log in
            </Link>

            <Link href="/signup" className="nav-button">
              Get Started
            </Link>
          </div>

        </div>
      </header>


      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="hero-background" />

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot" />
            Built for African businesses
          </div>

          <h1>
            Put your business
            <span> in front of more customers.</span>
          </h1>

          <p className="hero-description">
            IFC BIZGROWTH helps businesses across Africa get discovered,
            build stronger brands, advertise their products and services,
            and grow their customer base.
          </p>

          <div className="hero-actions">
            <Link href="/signup" className="primary-button">
              Grow Your Business
              <span>→</span>
            </Link>

            <Link href="#how-it-works" className="secondary-button">
              See How It Works
            </Link>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-icon">✓</div>
              <span>Business-focused</span>
            </div>

            <div className="trust-item">
              <div className="trust-icon">✓</div>
              <span>Built for Africa</span>
            </div>

            <div className="trust-item">
              <div className="trust-icon">✓</div>
              <span>Simple to use</span>
            </div>
          </div>

        </div>


        {/* ==================== HERO DASHBOARD PREVIEW ==================== */}
        <div className="hero-preview">

          <div className="preview-top">
            <div>
              <span className="preview-label">Business Overview</span>
              <h3>Good morning 👋</h3>
            </div>

            <div className="preview-profile">
              <div className="mini-avatar">GT</div>
              <div>
                <strong>Golden Touch Spa</strong>
                <small>Business Owner</small>
              </div>
            </div>
          </div>


          <div className="preview-stats">

            <div className="stat-card">
              <div className="stat-icon">◉</div>
              <span>Profile Views</span>
              <strong>12,480</strong>
              <small>↑ 24% this month</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon">♟</div>
              <span>Customer Leads</span>
              <strong>347</strong>
              <small>↑ 32% this month</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon">◈</div>
              <span>Ad Reach</span>
              <strong>28,640</strong>
              <small>↑ 41% this month</small>
            </div>

          </div>


          <div className="preview-growth">

            <div className="growth-heading">
              <div>
                <span>Business Growth</span>
                <small>Track your complete growth journey.</small>
              </div>

              <div className="growth-tabs">
                <span>7D</span>
                <strong>30D</strong>
                <span>90D</span>
              </div>
            </div>

            <div className="growth-chart">
              <div className="chart-lines">
                <i />
                <i />
                <i />
                <i />
              </div>

              <svg
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                className="chart-svg"
              >
                <defs>
                  <linearGradient
                    id="growthFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#f5c542"
                      stopOpacity="0.45"
                    />
                    <stop
                      offset="100%"
                      stopColor="#f5c542"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 150
                     L35 132
                     L70 138
                     L105 120
                     L140 125
                     L175 105
                     L210 112
                     L245 82
                     L280 91
                     L315 65
                     L350 76
                     L385 55
                     L420 60
                     L455 43
                     L490 48
                     L525 25
                     L560 35
                     L600 8
                     L600 180
                     L0 180 Z"
                  fill="url(#growthFill)"
                />

                <path
                  d="M0 150
                     L35 132
                     L70 138
                     L105 120
                     L140 125
                     L175 105
                     L210 112
                     L245 82
                     L280 91
                     L315 65
                     L350 76
                     L385 55
                     L420 60
                     L455 43
                     L490 48
                     L525 25
                     L560 35
                     L600 8"
                  fill="none"
                  stroke="#f5c542"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="growth-bottom">
              <span>Aug 10</span>
              <span>Aug 18</span>
              <span>Aug 26</span>
              <span>Sep 03</span>
              <span>Sep 07</span>
            </div>

          </div>

        </div>

      </section>


      {/* ==================== BUSINESS TRUST ==================== */}
      <section className="trust-section">

        <p>Everything your business needs to get discovered and grow</p>

        <div className="trust-grid">
          <div>BUSINESS DISCOVERY</div>
          <div>SMART ADVERTISING</div>
          <div>BRAND GROWTH</div>
          <div>CUSTOMER REACH</div>
          <div>MARKETING SUPPORT</div>
        </div>

      </section>


      {/* ==================== BENEFITS ==================== */}
      <section className="section benefits" id="benefits">

        <div className="section-heading">

          <span className="eyebrow">
            WHY BIZGROWTH
          </span>

          <h2>
            More visibility.
            <span> More opportunities.</span>
          </h2>

          <p>
            Your business should not depend only on people who already know
            you. IFC BIZGROWTH helps new customers discover what you offer.
          </p>

        </div>


        <div className="benefit-grid">

          <article className="benefit-card large-card">
            <div className="card-number">01</div>

            <div className="feature-icon">◉</div>

            <h3>Get discovered</h3>

            <p>
              Create your business presence and make it easier for customers
              to find your business, products and services.
            </p>

            <Link href="/signup">
              Create your business profile →
            </Link>
          </article>


          <article className="benefit-card">
            <div className="card-number">02</div>

            <div className="feature-icon">↗</div>

            <h3>Reach more customers</h3>

            <p>
              Promote your business and put your offers in front of the
              people who may need them.
            </p>
          </article>


          <article className="benefit-card">
            <div className="card-number">03</div>

            <div className="feature-icon">★</div>

            <h3>Build your brand</h3>

            <p>
              Strengthen your online presence with professional marketing
              support and brand-focused services.
            </p>
          </article>


          <article className="benefit-card">
            <div className="card-number">04</div>

            <div className="feature-icon">◌</div>

            <h3>Understand your growth</h3>

            <p>
              See important activity around your business and understand
              how customers are interacting with you.
            </p>
          </article>

        </div>

      </section>


      {/* ==================== HOW IT WORKS ==================== */}
      <section className="section how-section" id="how-it-works">

        <div className="section-heading centered">

          <span className="eyebrow">
            HOW IT WORKS
          </span>

          <h2>
            Start small.
            <span> Grow bigger.</span>
          </h2>

          <p>
            Getting your business online and ready for growth should be
            simple.
          </p>

        </div>


        <div className="steps">

          <div className="step">
            <div className="step-number">1</div>

            <div>
              <h3>Create your business</h3>
              <p>
                Add your business information and create your public business
                profile.
              </p>
            </div>
          </div>


          <div className="step-line" />


          <div className="step">
            <div className="step-number">2</div>

            <div>
              <h3>Build your presence</h3>
              <p>
                Add your products, services, location, contact details and
                business information.
              </p>
            </div>
          </div>


          <div className="step-line" />


          <div className="step">
            <div className="step-number">3</div>

            <div>
              <h3>Promote your business</h3>
              <p>
                Advertise inside IFC BIZGROWTH or request marketing support
                from our team.
              </p>
            </div>
          </div>


          <div className="step-line" />


          <div className="step">
            <div className="step-number">4</div>

            <div>
              <h3>Track your growth</h3>
              <p>
                Monitor business activity, customer interest, advertising
                results and growth.
              </p>
            </div>
          </div>

        </div>

      </section>


      {/* ==================== ADVERTISING ==================== */}
      <section className="advertising-section" id="advertising">

        <div className="advertising-content">

          <span className="eyebrow">
            ADVERTISE YOUR BUSINESS
          </span>

          <h2>
            Don't just wait
            <span> for customers.</span>
          </h2>

          <p>
            Put your business where potential customers can see it.
            Choose an advertising package, launch your campaign and
            measure your results.
          </p>

          <div className="advertising-points">

            <div>
              <span>✓</span>
              Targeted business promotion
            </div>

            <div>
              <span>✓</span>
              Campaign performance tracking
            </div>

            <div>
              <span>✓</span>
              Reach customers beyond your existing audience
            </div>

          </div>

          <Link href="/signup" className="gold-button">
            Start Advertising
            <span>→</span>
          </Link>

        </div>


        <div className="advertising-card">

          <div className="ad-card-header">
            <span>Campaign performance</span>
            <strong>30 days</strong>
          </div>

          <div className="ad-main-number">
            <small>Total reach</small>
            <strong>28,640</strong>
            <span>↑ 41%</span>
          </div>

          <div className="ad-bars">

            <div className="bar">
              <span style={{ height: "38%" }} />
            </div>

            <div className="bar">
              <span style={{ height: "52%" }} />
            </div>

            <div className="bar">
              <span style={{ height: "45%" }} />
            </div>

            <div className="bar">
              <span style={{ height: "67%" }} />
            </div>

            <div className="bar">
              <span style={{ height: "61%" }} />
            </div>

            <div className="bar">
              <span style={{ height: "78%" }} />
            </div>

            <div className="bar active">
              <span style={{ height: "92%" }} />
            </div>

          </div>

          <div className="ad-results">

            <div>
              <small>Impressions</small>
              <strong>45.2K</strong>
            </div>

            <div>
              <small>Clicks</small>
              <strong>1,284</strong>
            </div>

            <div>
              <small>Leads</small>
              <strong>347</strong>
            </div>

          </div>

        </div>

      </section>


      {/* ==================== MARKETING ==================== */}
      <section className="section marketing-section">

        <div className="section-heading">

          <span className="eyebrow">
            MARKETING SERVICES
          </span>

          <h2>
            Need help marketing?
            <span> We've got you.</span>
          </h2>

          <p>
            You focus on your business. Our team can help with social media
            advertising, content, design, branding and campaigns.
          </p>

        </div>


        <div className="service-grid">

          <div className="service-card">
            <div className="service-icon">✦</div>
            <h3>Social Media Advertising</h3>
            <p>
              Get help creating and running campaigns on social platforms.
            </p>
            <Link href="/signup">Request service →</Link>
          </div>


          <div className="service-card">
            <div className="service-icon">▣</div>
            <h3>Content Creation</h3>
            <p>
              Create useful promotional content that helps people notice your
              business.
            </p>
            <Link href="/signup">Request service →</Link>
          </div>


          <div className="service-card">
            <div className="service-icon">◆</div>
            <h3>Brand Identity</h3>
            <p>
              Build a stronger and more professional identity for your brand.
            </p>
            <Link href="/signup">Request service →</Link>
          </div>


          <div className="service-card">
            <div className="service-icon">↗</div>
            <h3>Campaign Management</h3>
            <p>
              Get support planning, managing and improving your campaigns.
            </p>
            <Link href="/signup">Request service →</Link>
          </div>

        </div>

      </section>


      {/* ==================== PRICING ==================== */}
      <section className="section pricing-section" id="pricing">

        <div className="section-heading centered">

          <span className="eyebrow">
            BUSINESS PLANS
          </span>

          <h2>
            Choose how you want
            <span> to grow.</span>
          </h2>

          <p>
            Start free and upgrade when your business needs more visibility
            and reach.
          </p>

        </div>


        <div className="pricing-grid">

          <div className="price-card">

            <span className="price-label">FREE</span>

            <h3>Business Presence</h3>

            <p>
              Get your business listed and start building your presence.
            </p>

            <div className="price">
              ₦0
              <small>/month</small>
            </div>

            <ul>
              <li>✓ Business profile</li>
              <li>✓ Products & services</li>
              <li>✓ Business discovery</li>
              <li>✓ Basic analytics</li>
            </ul>

            <Link href="/signup" className="price-button">
              Get Started
            </Link>

          </div>


          <div className="price-card featured">

            <div className="popular">
              MOST POPULAR
            </div>

            <span className="price-label">GROWTH</span>

            <h3>Get More Reach</h3>

            <p>
              For businesses ready to increase their visibility.
            </p>

            <div className="price">
              ₦7,500
              <small>/month</small>
            </div>

            <ul>
              <li>✓ Everything in Free</li>
              <li>✓ Increased visibility</li>
              <li>✓ Growth analytics</li>
              <li>✓ More promotion opportunities</li>
            </ul>

            <Link href="/signup" className="price-button gold">
              Start Growing
            </Link>

          </div>


          <div className="price-card">

            <span className="price-label">PROFESSIONAL</span>

            <h3>Build Your Brand</h3>

            <p>
              For established businesses that want stronger exposure.
            </p>

            <div className="price">
              ₦15,000
              <small>/month</small>
            </div>

            <ul>
              <li>✓ Everything in Growth</li>
              <li>✓ Higher visibility</li>
              <li>✓ Advanced business insights</li>
              <li>✓ Brand growth opportunities</li>
            </ul>

            <Link href="/signup" className="price-button">
              Choose Professional
            </Link>

          </div>

        </div>

        <p className="pricing-note">
          Need something bigger? Enterprise plans are available for larger
          organizations and custom business needs.
        </p>

      </section>


      {/* ==================== FINAL CTA ==================== */}
      <section className="final-cta">

        <div className="cta-glow" />

        <span className="eyebrow">
          YOUR BUSINESS. YOUR NEXT LEVEL.
        </span>

        <h2>
          Ready to grow
          <span> your business?</span>
        </h2>

        <p>
          Join IFC BIZGROWTH and give your business a stronger path to
          visibility, customers and growth.
        </p>

        <div className="cta-actions">

          <Link href="/signup" className="primary-button">
            Create Your Business
            <span>→</span>
          </Link>

          <Link href="/login" className="cta-login">
            Already have an account? Log in
          </Link>

        </div>

      </section>


      {/* ==================== FOOTER ==================== */}
      <footer className="footer">

        <div className="footer-top">

          <div className="footer-brand">

            <Link href="/" className="brand">

              <div className="brand-mark">
                IFC
                <span>↗</span>
              </div>

              <div className="brand-text">
                <strong>BIZGROWTH</strong>
                <small>CONNECT · PROMOTE · GROW</small>
              </div>

            </Link>

            <p>
              Helping African businesses connect with customers,
              promote their brands and grow.
            </p>

          </div>


          <div className="footer-column">
            <h4>Platform</h4>
            <Link href="#benefits">Business Directory</Link>
            <Link href="#advertising">Advertising</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#pricing">Pricing</Link>
          </div>


          <div className="footer-column">
            <h4>Business</h4>
            <Link href="/signup">Create Business</Link>
            <Link href="/login">Business Login</Link>
            <Link href="/signup">Marketing Services</Link>
            <Link href="/signup">Advertise</Link>
          </div>


          <div className="footer-column">
            <h4>Company</h4>
            <Link href="#benefits">About Us</Link>
            <Link href="#how-it-works">Our Mission</Link>
            <Link href="#benefits">Contact</Link>
          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
          </span>

          <div>
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
          </div>

        </div>

      </footer>

    </main>
  );
            }
