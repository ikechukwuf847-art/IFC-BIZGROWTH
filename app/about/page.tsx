import Image from "next/image";
import Link from "next/link";
import "./about.css";

export const metadata = {
  title: "About IFC BIZGROWTH",
  description:
    "Learn about IFC BIZGROWTH, an African business-growth company building opportunities for businesses to increase visibility, reach customers and grow.",
};

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* =========================
          HERO
      ========================== */}
      <section className="about-hero">
        <div className="about-container about-hero-grid">
          <div className="about-hero-content">
            <span className="about-eyebrow">
              IFC BIZGROWTH • AFRICAN BUSINESS-GROWTH COMPANY
            </span>

            <h1>
              Building better growth opportunities for
              <span> African businesses.</span>
            </h1>

            <p>
              IFC BIZGROWTH is an African business-growth company focused on
              helping businesses become more visible, reach more customers,
              promote their brands and pursue sustainable growth.
            </p>

            <div className="about-hero-actions">
              <Link href="/business/signup" className="about-btn primary">
                Grow Your Business
              </Link>

              <Link href="/businesses" className="about-btn secondary">
                Explore Businesses
              </Link>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="hero-card-top">
              <span className="hero-card-dot"></span>
              <span>OUR DIRECTION</span>
            </div>

            <h2>
              One platform.
              <br />
              African businesses.
              <br />
              Bigger opportunities.
            </h2>

            <p>
              Building toward a connected business-growth ecosystem across
              Africa.
            </p>

            <div className="hero-card-line"></div>

            <div className="hero-card-bottom">
              <span>IFC BIZGROWTH</span>
              <span>AFRICA</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          INTRO
      ========================== */}
      <section className="about-section about-intro">
        <div className="about-container narrow">
          <span className="section-label">WHO WE ARE</span>

          <h2>
            More than a directory.
            <br />
            A business-growth platform.
          </h2>

          <p className="section-lead">
            IFC BIZGROWTH is being built to give African businesses a stronger
            digital presence and more opportunities to reach the people who
            need what they offer.
          </p>

          <p>
            From local businesses and growing companies to established brands,
            businesses need more than simply having their name online. They
            need visibility, promotion, customer reach and practical
            opportunities to grow.
          </p>

          <p>
            IFC BIZGROWTH brings these ideas together through business
            discovery, promotion and growth-focused services.
          </p>
        </div>
      </section>

      {/* =========================
          WHAT WE DO
      ========================== */}
      <section className="about-section services-section">
        <div className="about-container">
          <div className="section-heading-row">
            <div>
              <span className="section-label">WHAT WE DO</span>

              <h2>Helping businesses move from visibility to growth.</h2>
            </div>

            <p>
              Our platform is being designed around practical ways businesses
              can become easier to discover and promote.
            </p>
          </div>

          <div className="about-services-grid">
            <article className="about-service-card">
              <div className="service-number">01</div>
              <h3>Business Discovery</h3>
              <p>
                We provide a digital environment where customers can discover
                businesses, products and services.
              </p>
            </article>

            <article className="about-service-card">
              <div className="service-number">02</div>
              <h3>Business Promotion</h3>
              <p>
                Businesses can access promotional opportunities designed to
                increase their visibility and brand awareness.
              </p>
            </article>

            <article className="about-service-card">
              <div className="service-number">03</div>
              <h3>Customer Reach</h3>
              <p>
                We focus on helping businesses put their offerings in front of
                more potential customers.
              </p>
            </article>

            <article className="about-service-card">
              <div className="service-number">04</div>
              <h3>Growth Services</h3>
              <p>
                Our ecosystem is being developed to provide additional
                marketing and business-growth services as the platform grows.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =========================
          MISSION / VISION
      ========================== */}
      <section className="about-section mission-section">
        <div className="about-container mission-grid">
          <div className="mission-card dark">
            <span className="section-label light">OUR MISSION</span>

            <h2>
              Make business-growth opportunities more accessible to African
              businesses.
            </h2>

            <p>
              We aim to use technology, promotion and practical growth services
              to help businesses increase their visibility and reach more
              customers.
            </p>
          </div>

          <div className="mission-card">
            <span className="section-label">OUR VISION</span>

            <h2>
              A stronger digital growth ecosystem for businesses across Africa.
            </h2>

            <p>
              Our long-term vision is to build IFC BIZGROWTH into a
              pan-African business-growth platform serving businesses across
              all 54 African countries.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}
      <section className="about-section process-section">
        <div className="about-container">
          <div className="section-heading centered">
            <span className="section-label">HOW IT WORKS</span>

            <h2>A simple path from business presence to growth.</h2>

            <p>
              IFC BIZGROWTH is being designed to keep the business experience
              straightforward.
            </p>
          </div>

          <div className="process-grid">
            <div className="process-item">
              <div className="process-number">01</div>
              <div>
                <h3>Create your business presence</h3>
                <p>
                  Businesses establish their presence on IFC BIZGROWTH with
                  relevant information about what they offer.
                </p>
              </div>
            </div>

            <div className="process-item">
              <div className="process-number">02</div>
              <div>
                <h3>Promote your business</h3>
                <p>
                  Businesses can use available promotional opportunities and
                  growth services to increase their reach.
                </p>
              </div>
            </div>

            <div className="process-item">
              <div className="process-number">03</div>
              <div>
                <h3>Reach potential customers</h3>
                <p>
                  Customers can discover businesses and learn more about the
                  products and services they provide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FOUNDER
      ========================== */}
      <section className="about-section founder-section">
        <div className="about-container founder-grid">
          <div className="founder-visual">
            <div className="founder-initials">IFC</div>

            <div className="founder-visual-footer">
              <span>FOUNDER & CEO</span>
              <span>IFC BIZGROWTH</span>
            </div>
          </div>

          <div className="founder-content">
            <span className="section-label">FOUNDER & CEO</span>

            <h2>Ikechukwu Favour Chidindu</h2>

            <div className="founder-name">Also known as Chiboi</div>

            <p className="founder-lead">
              IFC BIZGROWTH was founded by Ikechukwu Favour Chidindu, also
              known as Chiboi, with the ambition of building a business-growth
              company focused on the African market.
            </p>

            <p>
              The idea behind IFC BIZGROWTH is rooted in a simple observation:
              businesses can have valuable products and services while still
              struggling to gain enough visibility and reach new customers.
            </p>

            <p>
              The company is being developed with a long-term African vision —
              starting from a technology platform and growing into a broader
              ecosystem of business promotion and growth services.
            </p>

            <div className="founder-signature">
              <strong>IKECHUKWU FAVOUR CHIDINDU</strong>
              <span>Founder & CEO, IFC BIZGROWTH</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PARENT COMPANY
      ========================== */}
      <section className="about-section parent-section">
        <div className="about-container">
          <div className="parent-card">
            <div className="parent-logo-area">
              <Image
                src="/ifc-bridge-lab.png"
                alt="IFC Bridge Lab"
                width={280}
                height={140}
                className="parent-logo"
              />
            </div>

            <div className="parent-content">
              <span className="section-label">PARENT COMPANY</span>

              <h2>IFC Bridge Lab</h2>

              <p>
                IFC BIZGROWTH operates as a product and business-growth
                initiative under its parent company, IFC Bridge Lab.
              </p>

              <p>
                IFC Bridge Lab provides the broader foundation from which
                ventures and technology-driven projects such as IFC BIZGROWTH
                can be developed.
              </p>

              <div className="parent-tag">
                <span>IFC BRIDGE LAB</span>
                <span>→</span>
                <strong>IFC BIZGROWTH</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          AFRICA
      ========================== */}
      <section className="about-section africa-section">
        <div className="about-container africa-grid">
          <div>
            <span className="section-label light">OUR AFRICA VISION</span>

            <h2>
              Built with Africa in mind.
            </h2>
          </div>

          <div>
            <p>
              Africa has millions of businesses serving local communities,
              cities and markets every day. IFC BIZGROWTH is being built with
              the ambition of creating infrastructure that can support
              businesses across the continent.
            </p>

            <div className="africa-stat">
              <strong>54</strong>
              <span>African countries</span>
            </div>

            <p className="small-note">
              Our long-term geographic vision is to serve businesses across
              all 54 African countries.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          PRINCIPLES
      ========================== */}
      <section className="about-section principles-section">
        <div className="about-container">
          <div className="section-heading centered">
            <span className="section-label">WHAT WE STAND FOR</span>

            <h2>Built on practical principles.</h2>
          </div>

          <div className="principles-grid">
            <article>
              <span>01</span>
              <h3>Businesses first</h3>
              <p>
                We build around real business needs rather than unnecessary
                complexity.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Transparency</h3>
              <p>
                We aim to communicate clearly about our services, opportunities
                and the value businesses receive.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Long-term thinking</h3>
              <p>
                We are building for sustainable growth rather than short-term
                attention.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>African ambition</h3>
              <p>
                Our long-term direction is focused on creating opportunities
                across African markets.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =========================
          FINAL CTA
      ========================== */}
      <section className="about-cta">
        <div className="about-container">
          <span className="section-label light">THE NEXT CHAPTER</span>

          <h2>
            Your business has something to offer.
            <br />
            Let more people discover it.
          </h2>

          <p>
            Join the growing ecosystem being built for African businesses.
          </p>

          <div className="about-hero-actions">
            <Link href="/business/signup" className="about-btn white">
              Get Started
            </Link>

            <Link href="/contact" className="about-btn outline-white">
              Contact IFC BIZGROWTH
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
  }
