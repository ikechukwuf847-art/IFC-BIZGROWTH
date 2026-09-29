import Link from "next/link";
import "./how-it-works.css";

export const metadata = {
  title: "How It Works | IFC BIZGROWTH",
  description:
    "Learn how IFC BIZGROWTH works for businesses and customers.",
};

export default function HowItWorksPage() {
  return (
    <main className="how-page">

      {/* HERO */}
      <section className="how-hero">
        <div className="how-container">

          <div className="how-hero-content">

            <span className="how-eyebrow">
              IFC BIZGROWTH
            </span>

            <h1>
              How IFC BIZGROWTH
              <span>works.</span>
            </h1>

            <p>
              IFC BIZGROWTH connects businesses with the tools and
              visibility they need to build their presence and reach
              more customers.
            </p>

          </div>

        </div>
      </section>

      {/* INTRO */}
      <section className="how-intro">
        <div className="how-container">

          <div className="how-intro-grid">

            <div>
              <span className="how-label">
                THE PLATFORM
              </span>

              <h2>
                One platform for discovering and growing businesses.
              </h2>
            </div>

            <div>
              <p>
                Businesses can create and manage their presence on
                IFC BIZGROWTH, while customers can discover businesses,
                products and services through the platform.
              </p>

              <p>
                Businesses can also use available promotional and
                marketing services to increase their visibility and
                reach potential customers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* BUSINESS JOURNEY */}
      <section className="how-journey">
        <div className="how-container">

          <div className="how-section-heading">
            <span className="how-label">
              FOR BUSINESSES
            </span>

            <h2>
              From registration to growth.
            </h2>

            <p>
              A business can use IFC BIZGROWTH to establish its presence,
              manage its information and access growth opportunities.
            </p>
          </div>

          <div className="how-steps">

            <article className="how-step">
              <div className="step-number">
                01
              </div>

              <div>
                <span>
                  GET STARTED
                </span>

                <h3>
                  Create an account
                </h3>

                <p>
                  A business starts by creating an IFC BIZGROWTH
                  account and providing the information required
                  to use the platform.
                </p>
              </div>
            </article>

            <article className="how-step">
              <div className="step-number">
                02
              </div>

              <div>
                <span>
                  BUSINESS PROFILE
                </span>

                <h3>
                  Add your business
                </h3>

                <p>
                  Add relevant business information such as your
                  business name, category, location, products and
                  services.
                </p>
              </div>
            </article>

            <article className="how-step">
              <div className="step-number">
                03
              </div>

              <div>
                <span>
                  MANAGE
                </span>

                <h3>
                  Keep your information updated
                </h3>

                <p>
                  Businesses can manage the information associated
                  with their business presence and keep important
                  details current.
                </p>
              </div>
            </article>

            <article className="how-step">
              <div className="step-number">
                04
              </div>

              <div>
                <span>
                  GROW
                </span>

                <h3>
                  Promote your business
                </h3>

                <p>
                  Businesses can access available advertising,
                  promotional and marketing services designed to
                  help increase visibility and customer reach.
                </p>
              </div>
            </article>

          </div>

        </div>
      </section>

      {/* CUSTOMER JOURNEY */}
      <section className="how-customers">
        <div className="how-container">

          <div className="how-customer-grid">

            <div className="customer-heading">

              <span className="how-label">
                FOR CUSTOMERS
              </span>

              <h2>
                Discover businesses that match what you need.
              </h2>

              <p>
                Customers can use IFC BIZGROWTH to discover businesses
                and explore the products and services they offer.
              </p>

            </div>

            <div className="customer-steps">

              <div className="customer-step">
                <strong>01</strong>

                <div>
                  <h3>
                    Search
                  </h3>

                  <p>
                    Look for businesses, products or services that
                    match what you need.
                  </p>
                </div>
              </div>

              <div className="customer-step">
                <strong>02</strong>

                <div>
                  <h3>
                    Explore
                  </h3>

                  <p>
                    Review available business information and
                    understand what a business offers.
                  </p>
                </div>
              </div>

              <div className="customer-step">
                <strong>03</strong>

                <div>
                  <h3>
                    Connect
                  </h3>

                  <p>
                    Use the contact and business information provided
                    on the platform to connect with the business.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* GROWTH */}
      <section className="how-growth">
        <div className="how-container">

          <div className="how-growth-card">

            <div>
              <span className="how-label">
                BUSINESS GROWTH
              </span>

              <h2>
                Visibility is only the beginning.
              </h2>

              <p>
                IFC BIZGROWTH is designed to give businesses more
                than a basic online listing. Businesses can build
                their presence, present what they offer and access
                promotional and marketing opportunities available
                through the platform.
              </p>
            </div>

            <div className="growth-mark">
              IFC
            </div>

          </div>

        </div>
      </section>

      {/* IMPORTANT INFORMATION */}
      <section className="how-info">
        <div className="how-container">

          <div className="how-info-grid">

            <div>
              <span className="how-label">
                IMPORTANT
              </span>

              <h2>
                Business information should remain accurate.
              </h2>
            </div>

            <div>
              <p>
                Businesses are responsible for providing accurate
                information about their business, products and
                services and for keeping that information up to date.
              </p>

              <p>
                Customers should review available business information
                and communicate directly with a business before making
                important purchasing or service decisions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="how-cta">
        <div className="how-container">

          <div className="how-cta-content">

            <span className="how-label">
              IFC BIZGROWTH
            </span>

            <h2>
              Ready to build your business presence?
            </h2>

            <p>
              Create your business account and start building your
              presence on IFC BIZGROWTH.
            </p>

            <Link
              href="/signup"
              className="how-cta-button"
            >
              Get started
              <span>→</span>
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}
