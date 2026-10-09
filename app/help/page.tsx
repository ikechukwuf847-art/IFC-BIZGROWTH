"use client";

import { useMemo, useState } from "react";
import "./help.css";

const helpCategories = [
  {
    icon: "🔎",
    title: "Finding Businesses",
    description: "Discover businesses, browse categories, and find what you need.",
    articles: [
      {
        title: "How do I find a business?",
        answer:
          "Use the search feature on IFC BIZGROWTH to search for a business by name, product, service, or category. You can also browse business categories to discover businesses that match your needs.",
      },
      {
        title: "How do I find businesses in my location?",
        answer:
          "Explore businesses by their listed locations. Check each business profile for its address and contact information before visiting.",
      },
      {
        title: "What if I cannot find a business?",
        answer:
          "Try a different search term or browse related categories. The business may not yet have a public profile on IFC BIZGROWTH.",
      },
    ],
  },
  {
    icon: "🏪",
    title: "Choosing the Right Business",
    description: "Learn what to check before choosing a business.",
    articles: [
      {
        title: "How do I choose the right business?",
        answer:
          "Compare businesses based on their products or services, prices, location, contact information, customer reviews, and suitability for your needs. Contact the business to confirm important details before making a purchase.",
      },
      {
        title: "How do I compare businesses?",
        answer:
          "Review the information available on each business profile. Compare their offerings, locations, stated prices, available promotions, and customer feedback where available.",
      },
      {
        title: "What should I check before buying?",
        answer:
          "Confirm the product or service details, total price, availability, delivery arrangements, payment terms, and any applicable refund or return policy directly with the business.",
      },
    ],
  },
  {
    icon: "⭐",
    title: "Reviews and Ratings",
    description: "Understand customer reviews and business ratings.",
    articles: [
      {
        title: "What are business reviews?",
        answer:
          "Reviews are customer feedback about their experiences with a business. Read individual reviews carefully and consider the details provided rather than relying on a single opinion.",
      },
      {
        title: "How should I interpret business ratings?",
        answer:
          "Ratings can help you compare customer feedback, but they do not tell the whole story. Consider the written reviews, number of reviews, relevance to your needs, and other available business information.",
      },
      {
        title: "Can I trust every review?",
        answer:
          "No review system can guarantee that every review is accurate. Look for specific, consistent feedback and be cautious about reviews that appear misleading or suspicious.",
      },
      {
        title: "How do I report a suspicious review?",
        answer:
          "Use the reporting option if one is available on the platform. Otherwise, contact IFC BIZGROWTH support and provide the business profile, review details, and reason for your concern.",
      },
    ],
  },
  {
    icon: "🛍️",
    title: "Products and Services",
    description: "Explore business offerings and ask the right questions.",
    articles: [
      {
        title: "How do I explore a business's products?",
        answer:
          "Open the business profile and look for its Products section. Review product descriptions and available information, then contact the business to confirm current prices, stock, and other details.",
      },
      {
        title: "How do I find a particular service?",
        answer:
          "Search for the service or browse relevant categories. Review the services listed on each business profile and contact the business to confirm its availability and terms.",
      },
      {
        title: "What if product information is missing?",
        answer:
          "Contact the business using its listed contact details to request the missing information before deciding to purchase.",
      },
    ],
  },
  {
    icon: "🏷️",
    title: "Promotions and Offers",
    description: "Discover offers and understand their conditions.",
    articles: [
      {
        title: "How do I find business promotions?",
        answer:
          "Explore the Promotions section on relevant business profiles. Review each offer carefully and contact the business to confirm its availability and conditions.",
      },
      {
        title: "What if a promotion has expired?",
        answer:
          "Contact the business to ask whether the offer has been extended or whether another promotion is available. Do not assume that an expired offer is still valid.",
      },
      {
        title: "How do I check promotion terms?",
        answer:
          "Check the stated validity period, eligible products or services, exclusions, and other conditions. Confirm any unclear terms directly with the business.",
      },
    ],
  },
  {
    icon: "🛡️",
    title: "Verification and Trust",
    description: "Understand verification and evaluate business information.",
    articles: [
      {
        title: "What does business verification mean?",
        answer:
          "Verification indicates that a business has undergone a particular verification process on the platform. The exact meaning depends on the verification status and process used.",
      },
      {
        title: "Does verification guarantee a trustworthy business?",
        answer:
          "No. Verification does not guarantee product quality, honest conduct, financial stability, or a successful transaction. Check the available information and make your own informed decision.",
      },
      {
        title: "What if a business profile appears misleading?",
        answer:
          "Be cautious and independently confirm important details. Report suspicious or inaccurate information to IFC BIZGROWTH support with the relevant profile details.",
      },
    ],
  },
  {
    icon: "📞",
    title: "Contacting Businesses",
    description: "Ask questions and confirm important details before buying.",
    articles: [
      {
        title: "How do I contact a business?",
        answer:
          "Check the business profile for available contact information, such as a telephone number, email address, website, or social media link. Contact options depend on what the business has provided.",
      },
      {
        title: "What should I ask before making a purchase?",
        answer:
          "Ask about the total price, availability, product or service specifications, delivery, payment arrangements, and applicable refund or return terms.",
      },
      {
        title: "What if a business does not respond?",
        answer:
          "Allow reasonable time for a response and check whether the listed contact details are correct. You may also compare other businesses offering similar products or services.",
      },
    ],
  },
  {
    icon: "🔐",
    title: "Customer Safety",
    description: "Make informed decisions and recognize suspicious offers.",
    articles: [
      {
        title: "How can I avoid purchasing scams?",
        answer:
          "Verify the business's contact information, independently confirm important claims, understand the payment terms, and be cautious about pressure to pay immediately. Avoid sending money when you cannot reasonably establish the legitimacy of the transaction.",
      },
      {
        title: "What should I check before sending money?",
        answer:
          "Confirm the business identity, agreed product or service, total cost, payment recipient, delivery arrangements, and refund terms. Be particularly cautious if payment details change unexpectedly.",
      },
      {
        title: "How do I report a suspicious business?",
        answer:
          "Contact IFC BIZGROWTH support with the business name, profile link, relevant screenshots or details, and an explanation of your concern. Avoid sharing passwords, payment PINs, or other confidential information.",
      },
    ],
  },
  {
    icon: "🌐",
    title: "About IFC BIZGROWTH",
    description: "Learn how the platform helps customers discover businesses.",
    articles: [
      {
        title: "What is IFC BIZGROWTH?",
        answer:
          "IFC BIZGROWTH is a business discovery and growth platform designed to help people find businesses and explore their profiles, products, services, promotions, and available customer reviews.",
      },
      {
        title: "What are featured businesses?",
        answer:
          "Featured businesses receive additional promotional visibility on the platform. Featured placement is promotional and does not mean that a business is necessarily better, safer, or more reliable than other businesses.",
      },
      {
        title: "Why can businesses have different amounts of information?",
        answer:
          "Businesses may provide different details about their locations, products, services, promotions, and other information. Contact the business directly if you need information that is not displayed.",
      },
    ],
  },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: "facebook-f",
    url: "https://www.facebook.com/YOUR_FACEBOOK_HANDLE",
  },
  {
    name: "TikTok",
    icon: "tiktok",
    url: "https://www.tiktok.com/@ifcbizgrowth",
  },
  {
    name: "X (Twitter)",
    icon: "x-twitter",
    url: "https://x.com/ifcbizgrowth",
  },
  {
    name: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/ifcbizgrowth",
  },
  {
    name: "YouTube",
    icon: "youtube",
    url: "https://www.youtube.com/@ifcbizgrowth",
  },
];

export default function CustomerHelpPage() {
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return helpCategories;

    return helpCategories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (article) =>
            article.title.toLowerCase().includes(query) ||
            article.answer.toLowerCase().includes(query) ||
            category.title.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (category) =>
          category.articles.length > 0 ||
          category.title.toLowerCase().includes(query) ||
          category.description.toLowerCase().includes(query)
      );
  }, [search]);

  const popularArticles = [
    "How do I choose the right business?",
    "How should I interpret business ratings?",
    "What does business verification mean?",
    "How do I find business promotions?",
  ];

  function scrollToArticle(title: string) {
    const category = helpCategories.find((item) =>
      item.articles.some((article) => article.title === title)
    );

    if (category) {
      setSearch("");
      setOpenArticle(title);

      window.setTimeout(() => {
        document
          .getElementById(`article-${slugify(title)}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }

  return (
    <main className="help-page">
      <section className="help-hero">
        <div className="help-container">
          <span className="help-eyebrow">IFC BIZGROWTH SUPPORT</span>

          <h1>How can we help you?</h1>

          <p>
            Find businesses, compare your options, understand reviews, and make
            informed purchasing decisions.
          </p>

          <form
            className="help-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <span aria-hidden="true" className="search-icon">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenArticle(null);
              }}
              placeholder="Search for help..."
              aria-label="Search customer help articles"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>

          <div className="help-hero-note">
            <span aria-hidden="true">✓</span>
            Practical guidance for discovering businesses with confidence.
          </div>
        </div>
      </section>

      <section className="help-container help-popular">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">START HERE</span>
            <h2>Popular help topics</h2>
          </div>
        </div>

        <div className="popular-grid">
          {popularArticles.map((title) => (
            <button
              key={title}
              type="button"
              className="popular-card"
              onClick={() => scrollToArticle(title)}
            >
              <span>{title}</span>
              <span className="popular-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="help-container help-categories">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">BROWSE HELP</span>
            <h2>
              {search ? "Search results" : "Explore help categories"}
            </h2>
            <p>
              {search
                ? `Articles matching "${search}"`
                : "Choose a topic to find helpful answers."}
            </p>
          </div>

          {search && (
            <button
              className="text-button"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="help-empty">
            <span aria-hidden="true">🔎</span>
            <h3>No articles found</h3>
            <p>
              Try another search term, such as business, reviews, products, or
              promotions.
            </p>
            <button
              type="button"
              className="help-primary-button"
              onClick={() => setSearch("")}
            >
              Browse all topics
            </button>
          </div>
        ) : (
          <div className="help-category-list">
            {filteredCategories.map((category) => (
              <section
                className="help-category"
                key={category.title}
                id={`category-${slugify(category.title)}`}
              >
                <div className="help-category-heading">
                  <div className="category-icon" aria-hidden="true">
                    {category.icon}
                  </div>

                  <div>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>

                <div className="help-article-list">
                  {category.articles.map((article) => {
                    const isOpen = openArticle === article.title;

                    return (
                      <article
                        className={`help-article ${isOpen ? "is-open" : ""}`}
                        key={article.title}
                        id={`article-${slugify(article.title)}`}
                      >
                        <button
                          type="button"
                          className="help-article-toggle"
                          onClick={() =>
                            setOpenArticle(isOpen ? null : article.title)
                          }
                          aria-expanded={isOpen}
                        >
                          <span>{article.title}</span>
                          <span className="article-chevron" aria-hidden="true">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="help-article-answer">
                            <p>{article.answer}</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="help-contact">
        <div className="help-container help-contact-inner">
          <div>
            <span className="help-section-label">STILL NEED HELP?</span>
            <h2>We’re here to help.</h2>
            <p>
              If you need assistance with information on IFC BIZGROWTH, contact
              our support team.
            </p>
          </div>

          <a
            href="mailto:contactus@ifcbridgelab.com?subject=IFC%20BIZGROWTH%20Customer%20Help"
            className="help-primary-button"
          >
            Contact Support <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <footer className="help-footer">
        <div className="help-container">
          <div className="help-footer-top">
            <div className="help-footer-brand">
              <a href="/" className="help-logo">
                <span className="help-logo-mark">IFC</span>
                <span>
                  <strong>IFC BIZGROWTH</strong>
                  <small>Discover. Compare. Grow.</small>
                </span>
              </a>

              <p>
                Helping people discover businesses and make more informed
                choices.
              </p>
            </div>

            <div className="help-footer-links">
              <h3>Customer Help</h3>
              <a href="/help">Help Center</a>
              <a href="/categories">Browse Categories</a>
              <a href="/businesses">Discover Businesses</a>
              <a href="mailto:contactus@ifcbridgelab.com">
                Contact Support
              </a>
            </div>

            <div className="help-footer-social">
              <h3>Follow us</h3>
              <p>Connect with IFC BIZGROWTH on social media.</p>

              <ul className="social-list">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      aria-label={social.name}
                      title={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="help-footer-bottom">
            <p>
              © {new Date().getFullYear()} IFC BIZGROWTH. All rights reserved.
            </p>
            <p>Built by IFC BRIDGE LAB.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "facebook-f":
      return (
        <svg {...common}>
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
        </svg>
      );

    case "tiktok":
      return (
        <svg {...common}>
          <path d="M19.6 8.3a7.5 7.5 0 0 1-4.5-1.5v7.1a6.2 6.2 0 1 1-5.4-6.1v3.5a2.8 2.8 0 1 0 1.9 2.6V2.5h3.5c.2 2.1 1.9 3.8 4.5 4.1v1.7Z" />
        </svg>
      );

    case "x-twitter":
      return (
        <svg {...common}>
          <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-7.5L5.4 22H2.2l7.3-8.4L1.8 2h6.5l4.5 6.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
        </svg>
      );

    case "instagram":
      return (
        <svg {...common}>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 3a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2.2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm5.2-3.8a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
        </svg>
      );

    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      );

    default:
      return null;
  }
}
