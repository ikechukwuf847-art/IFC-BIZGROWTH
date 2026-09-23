import Link from "next/link";
import "./campaign.css";

export default function CampaignPage() {
  return (
    <main className="campaign-page">
      {/* Hero */}
      <section className="campaign-hero">
        <div className="campaign-hero-content">
          <span className="campaign-eyebrow">
            IFC BIZGROWTH • BUSINESS GROWTH
          </span>

          <h1>
            Grow your business with the right
            <span> growth strategy.</span>
          </h1>

          <p>
            Whether you want more people to discover your business through
            advertising or you need a complete marketing strategy to build
            your brand, IFC BIZGROWTH gives you the tools and services to
            move your business forward.
          </p>

          <div className="hero-actions">
            <Link href="/business/advertising" className="primary-btn">
              Explore Advertising
              <span>→</span>
            </Link>

            <Link href="/business/marketing" className="secondary-btn">
              Explore Marketing
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow"></div>

          <div className="growth-card main-growth-card">
            <div className="growth-card-top">
              <span className="growth-icon">↗</span>
              <span className="growth-status">Growing</span>
            </div>

            <div className="growth-chart">
              <div className="chart-bar bar-1"></div>
              <div className="chart-bar bar-2"></div>
              <div className="chart-bar bar-3"></div>
              <div className="chart-bar bar-4"></div>
              <div className="chart-bar bar-5"></div>
              <div className="chart-bar bar-6"></div>
              <div className="chart-line"></div>
            </div>

            <div className="growth-card-bottom">
              <strong>Business Growth</strong>
              <span>Build • Promote • Grow</span>
            </div>
          </div>

          <div className="floating-card floating-card-one">
            <span className="floating-icon">📣</span>
            <div>
              <strong>Advertising</strong>
              <small>Reach more people</small>
            </div>
          </div>

          <div className="floating-card floating-card-two">
            <span className="floating-icon">🚀</span>
            <div>
              <strong>Marketing</strong>
              <small>Build your brand</small>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="campaign-intro">
        <div>
          <span className="section-label">CHOOSE YOUR PATH</span>

          <h2>
            Two ways to take your
            <span> business further.</span>
          </h2>
        </div>

        <p>
          Advertising and marketing work together, but they solve different
          business needs. Choose the option that matches what you want to
          achieve right now.
        </p>
      </section>

      {/* Options */}
      <section className="growth-options">
        {/* Advertising */}
        <article className="growth-option advertising-option">
          <div className="option-image advertising-image">
            <div className="image-overlay"></div>

            <div className="image-content">
              <span className="option-number">01</span>

              <div className="big-option-icon">📣</div>

              <span className="image-badge">
                GET MORE VISIBILITY
              </span>
            </div>
          </div>

          <div className="option-content">
            <span className="option-label">ADVERTISING</span>

            <h3>Put your business in front of more people.</h3>

            <p>
              Advertising is designed for businesses that want to increase
              visibility, attract attention and reach potential customers.
              Create campaigns that put your business, products or services
              in front of the right audience.
            </p>

            <div className="feature-list">
              <div>
                <span>✓</span>
                Promote your business
              </div>

              <div>
                <span>✓</span>
                Increase brand visibility
              </div>

              <div>
                <span>✓</span>
                Promote products and services
              </div>

              <div>
                <span>✓</span>
                Reach potential customers
              </div>
            </div>

            <Link
              href="/business/advertising"
              className="option-btn"
            >
              Go to Advertising
              <span>→</span>
            </Link>
          </div>
        </article>

        {/* Marketing */}
        <article className="growth-option marketing-option">
          <div className="option-image marketing-image">
            <div className="image-overlay"></div>

            <div className="image-content">
              <span className="option-number">02</span>

              <div className="big-option-icon">🚀</div>

              <span className="image-badge">
                BUILD YOUR BRAND
              </span>
            </div>
          </div>

          <div className="option-content">
            <span className="option-label">MARKETING</span>

            <h3>Build a stronger and more recognizable brand.</h3>

            <p>
              Marketing goes beyond individual advertisements. Request
              marketing services designed to help your business improve its
              online presence, attract customers and develop a stronger
              overall growth strategy.
            </p>

            <div className="feature-list">
              <div>
                <span>✓</span>
                Request marketing services
              </div>

              <div>
                <span>✓</span>
                Improve your online presence
              </div>

              <div>
                <span>✓</span>
                Strengthen your brand
              </div>

              <div>
                <span>✓</span>
                Get help with business growth
              </div>
            </div>

            <Link
              href="/business/marketing"
              className="option-btn"
            >
              Go to Marketing
              <span>→</span>
            </Link>
          </div>
        </article>
      </section>

      {/* Explanation */}
      <section className="difference-section">
        <div className="difference-header">
          <span className="section-label">NOT SURE WHERE TO START?</span>

          <h2>
            Advertising gets attention.
            <br />
            Marketing builds the bigger picture.
          </h2>

          <p>
            You don't necessarily have to choose only one. Depending on your
            business goals, advertising and marketing can work together to
            create a stronger growth strategy.
          </p>
        </div>

        <div className="difference-grid">
          <div className="difference-card">
            <div className="difference-icon">📢</div>

            <h3>Choose Advertising when...</h3>

            <p>
              You have something specific you want to promote and want to get
              it in front of more potential customers.
            </p>

            <Link href="/business/advertising">
              View Advertising →
            </Link>
          </div>

          <div className="difference-card">
            <div className="difference-icon">📈</div>

            <h3>Choose Marketing when...</h3>

            <p>
              You want broader support for your brand, online presence,
              customer acquisition or long-term business growth.
            </p>

            <Link href="/business/marketing">
              View Marketing →
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="campaign-cta">
        <div className="cta-content">
          <span className="section-label">READY TO GROW?</span>

          <h2>
            Your next customer
            <br />
            could be one campaign away.
          </h2>

          <p>
            Choose the growth path that matches your current business goal
            and start building more visibility for your business.
          </p>

          <div className="cta-buttons">
            <Link href="/business/advertising" className="primary-btn">
              Start Advertising
              <span>→</span>
            </Link>

            <Link href="/business/marketing" className="secondary-btn">
              Explore Marketing
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
            }
