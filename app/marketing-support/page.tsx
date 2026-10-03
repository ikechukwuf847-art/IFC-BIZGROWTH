import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./marketing-support.css";

export const dynamic = "force-dynamic";

type MarketingService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service_type: string;
  starting_price: number | null;
  currency_code: string | null;
  is_active: boolean;
  sort_order: number;
};

export const metadata = {
  title: "Marketing Support | IFC BIZGROWTH",
  description:
    "Marketing support services designed to help businesses improve visibility, promote their products and services, and reach potential customers.",
};

export default async function MarketingSupportPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("marketing_services")
    .select(`
      id,
      name,
      slug,
      description,
      service_type,
      starting_price,
      currency_code,
      is_active,
      sort_order
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Marketing services fetch error:", error);
  }

  const services = (data || []) as MarketingService[];

  return (
    <main className="marketing-page">
      {/* HERO */}
      <section className="marketing-hero">
        <div className="marketing-container">
          <div className="marketing-hero-grid">
            <div className="marketing-hero-content">
              <span className="marketing-eyebrow">
                IFC BIZGROWTH
              </span>

              <h1>
                Marketing support
                <span>for growing businesses.</span>
              </h1>

              <p>
                Practical marketing services to help businesses
                improve visibility, present their brands professionally,
                promote what they offer and reach more potential customers.
              </p>
            </div>

            <div className="marketing-hero-mark">
              <span>GROW</span>
              <strong>YOUR BUSINESS</strong>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="marketing-intro">
        <div className="marketing-container">
          <div className="marketing-intro-grid">
            <div>
              <span className="marketing-label">
                MARKETING SUPPORT
              </span>

              <h2>
                Your business deserves to be seen.
              </h2>
            </div>

            <div className="marketing-intro-copy">
              <p>
                Having a good product or service is only part of
                building a business. Potential customers also need
                to discover your business, understand what you offer
                and know how to connect with you.
              </p>

              <p>
                IFC BIZGROWTH provides marketing support designed
                around practical business needs, from creating
                professional marketing materials to promoting
                businesses and campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="marketing-services">
        <div className="marketing-container">
          <div className="marketing-section-heading">
            <div>
              <span className="marketing-label">
                OUR SERVICES
              </span>

              <h2>
                Marketing support available through IFC BIZGROWTH.
              </h2>
            </div>

            <p>
              Explore the marketing services currently available
              to businesses.
            </p>
          </div>

          {error ? (
            <div className="marketing-message">
              <h3>Services are temporarily unavailable.</h3>
              <p>
                Please check back later.
              </p>
            </div>
          ) : services.length === 0 ? (
            <div className="marketing-message">
              <h3>No marketing services are currently available.</h3>
              <p>
                Please check back later for available services.
              </p>
            </div>
          ) : (
            <div className="marketing-service-grid">
              {services.map((service, index) => (
                <article
                  className="marketing-service-card"
                  key={service.id}
                >
                  <div className="service-card-top">
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="service-arrow">
                      ↗
                    </div>
                  </div>

                  <div className="service-card-content">
                    <h3>{service.name}</h3>

                    {service.description && (
                      <p>{service.description}</p>
                    )}
                  </div>

                  {service.starting_price !== null && (
                    <div className="service-price">
                      <span>Starting from</span>

                      <strong>
                        {formatPrice(
                          service.starting_price,
                          service.currency_code
                        )}
                      </strong>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="marketing-process">
        <div className="marketing-container">
          <div className="marketing-process-heading">
            <span className="marketing-label">
              HOW IT WORKS
            </span>

            <h2>
              Marketing support built around your business needs.
            </h2>
          </div>

          <div className="marketing-process-grid">
            <article>
              <span>01</span>
              <h3>Understand</h3>
              <p>
                Understand the business, its offer, its audience
                and the marketing need.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Plan</h3>
              <p>
                Identify the appropriate marketing support for
                the business or campaign.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Create</h3>
              <p>
                Develop the required marketing materials,
                promotional content or campaign support.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Promote</h3>
              <p>
                Help put the business, product, service or
                campaign in front of its intended audience.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="marketing-why">
        <div className="marketing-container">
          <div className="marketing-why-card">
            <div>
              <span className="marketing-label">
                BUSINESS GROWTH
              </span>

              <h2>
                Marketing is about more than promotion.
              </h2>

              <p>
                Effective marketing starts with understanding
                what a business offers and who it is trying to
                reach. The goal is to communicate clearly,
                increase visibility and create opportunities
                for potential customers to discover the business.
              </p>
            </div>

            <div className="marketing-why-mark">
              IFC
              <span>BIZGROWTH</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="marketing-cta">
        <div className="marketing-container">
          <div className="marketing-cta-content">
            <span className="marketing-label">
              IFC BIZGROWTH
            </span>

            <h2>
              Build your presence.
              <br />
              Reach more people.
            </h2>

            <p>
              Explore IFC BIZGROWTH and discover how businesses
              can build their presence and access growth
              opportunities.
            </p>

            <Link
              href="/signup"
              className="marketing-cta-button"
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

function formatPrice(
  price: number,
  currency: string | null
) {
  const currencyCode = currency?.trim() || "NGN";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currencyCode} ${price.toLocaleString("en-NG")}`;
  }
}
