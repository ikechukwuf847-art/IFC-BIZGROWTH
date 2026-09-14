"use client";

import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const categories = [
    "Restaurants",
    "Fashion",
    "Beauty",
    "Electronics",
    "Supermarkets",
    "Construction",
    "Services",
    "More",
  ];

  const businesses = [
    {
      name: "Bella Kitchen",
      category: "Restaurant",
      location: "Abuja, Nigeria",
      rating: "4.8",
    },
    {
      name: "Prime Furniture",
      category: "Furniture & Interior",
      location: "Lagos, Nigeria",
      rating: "4.7",
    },
    {
      name: "TechZone Africa",
      category: "Technology",
      location: "Abuja, Nigeria",
      rating: "4.9",
    },
  ];

  return (
    <main>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div>
            <div className="logo">
              IFC <span>BIZGROWTH</span>
            </div>

            <p className="logo-text">
              Helping businesses get discovered
            </p>
          </div>

          <div className="nav-links">
            <a href="#discover">Discover</a>
            <a href="#businesses">For Businesses</a>
            <a href="#how-it-works">How It Works</a>

            <button className="primary-button">
              List Your Business
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            Built to help African businesses grow
          </div>

          <h1>
            Discover businesses.
            <br />
            <span>Grow your brand.</span>
          </h1>

          <p>
            IFC BIZGROWTH connects customers with businesses while
            helping businesses improve their visibility, advertising
            and customer reach.
          </p>

          {/* SEARCH */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for a business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="search-button">
              Search
            </button>
          </div>

          <p className="search-help">
            Try: restaurant, fashion, electronics, beauty...
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" id="discover">
        <div>
          <p className="section-label">
            Explore
          </p>

          <h2 className="section-title">
            Find businesses by category
          </h2>
        </div>

        <div className="categories">
          {categories.map((category) => (
            <button
              className="category"
              key={category}
            >
              <div className="category-icon">
                ✓
              </div>

              <strong>{category}</strong>

              <p>
                Discover businesses
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section
        className="business-section"
        id="businesses"
      >
        <div className="business-content">
          <div>
            <p className="section-label">
              For business owners
            </p>

            <h2>
              Your business deserves to be seen.
            </h2>

            <p>
              Put your business in front of potential
              customers and access advertising and growth
              services designed to help your brand get noticed.
            </p>

            <div className="business-buttons">
              <button className="business-button">
                Grow My Business
              </button>

              <button className="business-button secondary">
                Learn More
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="stats">
            <div className="stat">
              <h3>10K+</h3>
              <p>Potential customers</p>
            </div>

            <div className="stat">
              <h3>54</h3>
              <p>African markets</p>
            </div>

            <div className="stat">
              <h3>24/7</h3>
              <p>Business visibility</p>
            </div>

            <div className="stat">
              <h3>Growth</h3>
              <p>Focused platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section
        className="section"
        id="how-it-works"
      >
        <p className="section-label">
          Featured
        </p>

        <h2 className="section-title">
          Businesses getting noticed
        </h2>

        <div className="businesses">
          {businesses.map((business) => (
            <div
              className="business-card"
              key={business.name}
            >
              <div className="business-image">
                Business Image
              </div>

              <div className="business-info">
                <div className="business-header">
                  <div>
                    <h3 className="business-name">
                      {business.name}
                    </h3>

                    <p className="business-category">
                      {business.category}
                    </p>
                  </div>

                  <span className="rating">
                    ★ {business.rating}
                  </span>
                </div>

                <p className="location">
                  📍 {business.location}
                </p>

                <button className="view-button">
                  View Business
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>
          Ready to grow your business?
        </h2>

        <p>
          Join IFC BIZGROWTH and put your business
          in front of more potential customers.
        </p>

        <button>
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <p>
            © {new Date().getFullYear()} IFC BIZGROWTH.
            All rights reserved.
          </p>

          <p>
            A product of{" "}
            <strong>
              IFC BRIDGE LAB
            </strong>
          </p>
        </div>
      </footer>
    </main>
  );
      }
