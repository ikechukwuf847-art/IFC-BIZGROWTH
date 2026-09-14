import Link from "next/link";

const categories = [
  { icon: "🍽️", name: "Restaurants" },
  { icon: "👗", name: "Fashion" },
  { icon: "💇", name: "Beauty & Wellness" },
  { icon: "📱", name: "Technology" },
  { icon: "🏗️", name: "Construction" },
  { icon: "🌾", name: "Food & Agriculture" },
  { icon: "🛍️", name: "Retail" },
  { icon: "💼", name: "Professional Services" },
];

const benefits = [
  {
    number: "01",
    title: "Search",
    description:
      "Search for businesses, products and services that match what you need.",
  },
  {
    number: "02",
    title: "Check",
    description:
      "Explore business profiles, available information and verification status.",
  },
  {
    number: "03",
    title: "Connect",
    description:
      "Call, message, visit a website or find the business location directly.",
  },
];

export default function Home() {
  return (
    <main className="site">

      {/* ================= NAVBAR ================= */}

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
            <Link href="/businesses">Businesses</Link>
            <Link href="/categories">Categories</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#businesses">For Businesses</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="login-link">
              Log in
            </Link>

            <Link href="/signup" className="nav-button">
              List Your Business
            </Link>
          </div>

        </div>
      </header>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-background" />

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot" />
            Discover businesses across Africa
          </div>

          <h1>
            Find the right
            <span>business for you.</span>
          </h1>

          <p className="hero-description">
            Discover businesses, products and services around you.
            Explore business information, check verification status
            and connect directly with the businesses you need.
          </p>


          {/* SEARCH */}

          <div className="hero-search">

            <div className="search-input">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search businesses, products or services..."
                aria-label="Search businesses, products or services"
              />

              <button type="button">
                Search
              </button>

            </div>

            <div className="search-location">
              <span>⌖</span>
              <span>Search by location</span>
            </div>

          </div>


          {/* POPULAR SEARCHES */}

          <div className="popular-searches">

            <span>Popular:</span>

            <Link href="/categories/restaurants">
              Restaurants
            </Link>

            <Link href="/categories/fashion">
              Fashion
            </Link>

            <Link href="/categories/beauty-wellness">
              Beauty
            </Link>

            <Link href="/categories/technology">
              Technology
            </Link>

            <Link href="/categories/construction">
              Construction
            </Link>

          </div>


          <div className="hero-actions">

            <Link href="/businesses" className="primary-button">
              Explore Businesses
              <span>→</span>
            </Link>

            <Link href="/signup" className="secondary-button">
              List Your Business
            </Link>

          </div>

        </div>


        {/* HERO DISCOVERY CARD */}

        <div className="discovery-preview">

          <div className="discovery-header">

            <div>
              <span>BUSINESS DISCOVERY</span>
              <h3>Businesses people can find</h3>
            </div>

            <span className="live-status">
              ● Live
            </span>

          </div>


          <div className="discovery-search">
            <span>⌕</span>
            <span>Search businesses...</span>
          </div>


          <div className="business-preview-grid">

            <div className="business-preview-card">

              <div className="business-image">
                GS
              </div>

              <div className="business-info">

                <div className="business-title">
                  <strong>Golden Touch Spa</strong>

                  <span className="verified">
                    ✓
                  </span>
                </div>

                <span>Beauty & Wellness</span>

                <small>
                  Abuja, Nigeria
                </small>

              </div>

            </div>


            <div className="business-preview-card">

              <div className="business-image image-two">
                FC
              </div>

              <div className="business-info">

                <div className="business-title">
                  <strong>Fresh Choice Foods</strong>

                  <span className="verified">
                    ✓
                  </span>
                </div>

                <span>Food & Agriculture</span>

                <small>
                  Abuja, Nigeria
                </small>

              </div>

            </div>


            <div className="business-preview-card">

              <div className="business-image image-three">
                TF
              </div>

              <div className="business-info">

                <div className="business-title">
                  <strong>Trend Fashion</strong>

                  <span className="verified">
                    ✓
                  </span>
                </div>

                <span>Fashion</span>

                <small>
                  Lagos, Nigeria
                </small>

              </div>

            </div>

          </div>

          <Link href="/businesses" className="view-all">
            Explore all businesses
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* ================= TRUST ================= */}

      <section className="trust-section">

        <div className="trust-inner">

          <div className="trust-message">

            <div className="trust-check">
              ✓
            </div>

            <div>
              <strong>Discover with more confidence.</strong>

              <p>
                IFC BIZGROWTH helps customers identify businesses
                that have gone through our verification process.
              </p>
            </div>

          </div>


          <div className="trust-points">

            <div>
              <span>✓</span>
              Verified businesses
            </div>

            <div>
              <span>✓</span>
              Business information
            </div>

            <div>
              <span>✓</span>
              Products & services
            </div>

          </div>

        </div>

      </section>


      {/* ================= DISCOVERY ================= */}

      <section className="section discovery-section">

        <div className="section-heading">

          <span className="eyebrow">
            DISCOVER
          </span>

          <h2>
            What are you
            <span> looking for?</span>
          </h2>

          <p>
            Browse businesses by category and find products and
            services that match what you need.
          </p>

        </div>


        <div className="category-grid">

          {categories.map((category) => (
            <Link
              href={`/categories/${category.name
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll("&", "and")}`}
              className="category-card"
              key={category.name}
            >

              <div className="category-icon">
                {category.icon}
              </div>

              <div>
                <strong>{category.name}</strong>
                <span>Explore businesses →</span>
              </div>

            </Link>
          ))}

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section
        className="section how-section"
        id="how-it-works"
      >

        <div className="section-heading centered">

          <span className="eyebrow">
            HOW IT WORKS
          </span>

          <h2>
            Find. Check.
            <span> Connect.</span>
          </h2>

          <p>
            Finding a business shouldn't be complicated.
            IFC BIZGROWTH makes discovery simple.
          </p>

        </div>


        <div className="how-grid">

          {benefits.map((item) => (
            <div className="how-card" key={item.number}>

              <span className="how-number">
                {item.number}
              </span>

              <div className="how-icon">
                {item.number === "01"
                  ? "⌕"
                  : item.number === "02"
                    ? "✓"
                    : "↗"}
              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </section>


      {/* ================= VERIFIED BUSINESSES ================= */}

      <section className="verified-section">

        <div className="verified-content">

          <span className="eyebrow">
            BUSINESS VERIFICATION
          </span>

          <h2>
            Know who you're
            <span> dealing with.</span>
          </h2>

          <p>
            Business verification helps create a more trustworthy
            environment for customers and businesses on IFC BIZGROWTH.
          </p>


          <div className="verification-list">

            <div>
              <span>✓</span>

              <div>
                <strong>Verified business profiles</strong>

                <small>
                  Look for the verification status on eligible
                  business profiles.
                </small>
              </div>
            </div>


            <div>
              <span>✓</span>

              <div>
                <strong>Business information</strong>

                <small>
                  See available contact, location, product and
                  service information.
                </small>
              </div>
            </div>


            <div>
              <span>✓</span>

              <div>
                <strong>Direct connections</strong>

                <small>
                  Contact businesses directly through the information
                  they provide.
                </small>
              </div>
            </div>

          </div>

        </div>


        <div className="verification-card">

          <div className="verification-card-top">

            <span>BUSINESS PROFILE</span>

            <span className="verified-large">
              ✓ VERIFIED
            </span>

          </div>


          <div className="verification-business">

            <div className="verification-logo">
              GT
            </div>

            <div>
              <h3>
                Golden Touch Spa
              </h3>

              <p>
                Beauty & Wellness
              </p>

              <small>
                Abuja, Nigeria
              </small>
            </div>

          </div>


          <div className="verification-divider" />


          <div className="verification-details">

            <div>
              <span>Business status</span>
              <strong>Active</strong>
            </div>

            <div>
              <span>Verification</span>
              <strong className="verified-text">
                Verified
              </strong>
            </div>

          </div>

          <Link
            href="/businesses"
            className="verification-link"
          >
            Explore verified businesses →
          </Link>

        </div>

      </section>


      {/* ================= FOR BUSINESSES ================= */}

      <section
        className="section business-section"
        id="businesses"
      >

        <div className="business-owner-card">

          <div className="business-owner-content">

            <span className="eyebrow">
              FOR BUSINESS OWNERS
            </span>

            <h2>
              Let customers
              <span> find your business.</span>
            </h2>

            <p>
              Create your business presence on IFC BIZGROWTH,
              showcase what you offer and give potential customers
              an easy way to discover and connect with you.
            </p>


            <div className="business-features">

              <div>
                <span>✓</span>
                Create your business profile
              </div>

              <div>
                <span>✓</span>
                Add products and services
              </div>

              <div>
                <span>✓</span>
                Get discovered by customers
              </div>

              <div>
                <span>✓</span>
                Promote your business
              </div>

              <div>
                <span>✓</span>
                Get marketing support
              </div>

            </div>


            <Link
              href="/signup"
              className="primary-button"
            >
              List Your Business
              <span>→</span>
            </Link>

          </div>


          <div className="business-owner-visual">

            <div className="owner-stat-card">

              <span>YOUR BUSINESS</span>

              <strong>
                Ready to be discovered.
              </strong>

              <div className="owner-progress">
                <span />
              </div>

              <small>
                Build your business presence
              </small>

            </div>


            <div className="owner-floating-card">

              <div className="owner-mini-icon">
                ✓
              </div>

              <div>
                <strong>
                  Business profile
                </strong>

                <small>
                  Ready to connect
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FINAL SEARCH CTA ================= */}

      <section className="final-search">

        <span className="eyebrow">
          START DISCOVERING
        </span>

        <h2>
          Looking for a business?
        </h2>

        <p>
          Search IFC BIZGROWTH and discover businesses,
          products and services.
        </p>


        <div className="final-search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search businesses, products or services..."
            aria-label="Search businesses"
          />

          <button type="button">
            Search
          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

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
              A business discovery and growth platform helping
              customers discover businesses and helping businesses
              connect with more customers.
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

            <Link href="/businesses">
              Search
            </Link>

            <Link href="/businesses">
              Verified Businesses
            </Link>

          </div>


          <div className="footer-column">

            <h4>For Businesses</h4>

            <Link href="/signup">
              List Your Business
            </Link>

            <Link href="/login">
              Business Login
            </Link>

            <Link href="/signup">
              Advertising
            </Link>

            <Link href="/signup">
              Marketing Services
            </Link>

          </div>


          <div className="footer-column">

            <h4>Company</h4>

            <Link href="/about">
              About IFC BIZGROWTH
            </Link>

            <Link href="#how-it-works">
              How It Works
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

          <span>
            © {new Date().getFullYear()} IFC BIZGROWTH.
            All rights reserved.
          </span>

          <span>
            Connect · Promote · Grow
          </span>

        </div>

      </footer>

    </main>
  );
    }
