import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./category.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

type Business = {
  business_id: string;
  business_name: string;
  business_slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  country_code: string;
  city: string | null;
  state_region: string | null;
  address: string | null;
  average_rating: number | null;
  review_count: number;
  is_featured: boolean;
  verification_status: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  subcategory_id: string | null;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  distance_km: number | null;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function isVerified(status: string | null | undefined) {
  return ["verified", "approved"].includes(
    String(status ?? "").toLowerCase()
  );
}

function formatRating(rating: number | null) {
  if (rating === null || Number.isNaN(Number(rating))) {
    return "New";
  }

  return Number(rating).toFixed(1);
}

function getLocation(business: Business) {
  return [business.city, business.state_region]
    .filter(Boolean)
    .join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("business_categories")
    .select("name,description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    return {
      title: "Category | IFC BIZGROWTH",
      description:
        "Discover businesses and services on IFC BIZGROWTH.",
    };
  }

  return {
    title: `${data.name} Businesses | IFC BIZGROWTH`,
    description:
      data.description ||
      `Discover businesses in ${data.name} on IFC BIZGROWTH.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: category, error: categoryError } = await supabase
    .from("business_categories")
    .select("id,name,slug,description,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError || !category) {
    notFound();
  }

  const [
    businessesResult,
    subcategoriesResult,
  ] = await Promise.all([
    supabase.rpc("get_public_business_directory", {
      p_search: null,
      p_country_code: null,
      p_city: null,
      p_category_id: category.id,
      p_subcategory_id: null,
      p_latitude: null,
      p_longitude: null,
      p_radius_km: null,
      p_featured_only: false,
      p_limit: 50,
      p_offset: 0,
    }),

    supabase
      .from("business_subcategories")
      .select(
        "id,category_id,name,slug,description,is_active"
      )
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const businesses = (businessesResult.data ?? []) as Business[];

  const subcategories = (subcategoriesResult.data ??
    []) as Subcategory[];

  return (
    <main className="category-page">
      <section className="category-hero">
        <div className="category-container">
          <nav className="category-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/categories">Categories</Link>
            <span>/</span>
            <span>{category.name}</span>
          </nav>

          <div className="category-hero-content">
            <div className="category-hero-icon">
              {getInitials(category.name)}
            </div>

            <div>
              <span className="category-eyebrow">
                Business category
              </span>

              <h1>{category.name}</h1>

              <p>
                {category.description ||
                  `Discover businesses, products and services in ${category.name}.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="category-content">
        <div className="category-container">
          {subcategories.length > 0 && (
            <section className="subcategory-section">
              <div className="category-section-heading">
                <div>
                  <span className="category-section-label">
                    Explore
                  </span>
                  <h2>Browse by specialty</h2>
                </div>
              </div>

              <div className="subcategory-grid">
                {subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/categories/${category.slug}?subcategory=${subcategory.slug}`}
                    className="subcategory-card"
                  >
                    <span className="subcategory-card-icon">
                      {getInitials(subcategory.name)}
                    </span>

                    <span className="subcategory-card-content">
                      <strong>{subcategory.name}</strong>

                      {subcategory.description && (
                        <small>
                          {subcategory.description}
                        </small>
                      )}
                    </span>

                    <span className="subcategory-arrow">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="businesses-section">
            <div className="category-section-heading businesses-heading">
              <div>
                <span className="category-section-label">
                  Directory
                </span>

                <h2>
                  Businesses in {category.name}
                </h2>
              </div>

              <span className="business-count">
                {businesses.length}{" "}
                {businesses.length === 1
                  ? "business"
                  : "businesses"}
              </span>
            </div>

            {businessesResult.error ? (
              <div className="category-state category-error">
                <div className="category-state-icon">!</div>

                <h3>Unable to load businesses</h3>

                <p>
                  We couldn't load businesses in this category
                  right now. Please try again later.
                </p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="category-state">
                <div className="category-state-icon">⌕</div>

                <h3>No businesses yet</h3>

                <p>
                  There are currently no public businesses listed
                  in this category.
                </p>

                <Link href="/categories">
                  Browse other categories
                </Link>
              </div>
            ) : (
              <div className="business-grid">
                {businesses.map((business) => {
                  const location = getLocation(business);

                  return (
                    <article
                      className="business-card"
                      key={business.business_id}
                    >
                      <div className="business-card-top">
                        <div className="business-logo">
                          {business.logo_url ? (
                            <img
                              src={business.logo_url}
                              alt={`${business.business_name} logo`}
                              loading="lazy"
                            />
                          ) : (
                            <span>
                              {getInitials(
                                business.business_name
                              )}
                            </span>
                          )}
                        </div>

                        {business.is_featured && (
                          <span className="featured-badge">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="business-card-body">
                        <div className="business-name-row">
                          <h3>{business.business_name}</h3>

                          {isVerified(
                            business.verification_status
                          ) && (
                            <span
                              className="verified-badge"
                              title="Verified business"
                              aria-label="Verified business"
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        {business.description && (
                          <p className="business-description">
                            {business.description}
                          </p>
                        )}

                        {location && (
                          <div className="business-location">
                            <span aria-hidden="true">⌖</span>
                            <span>{location}</span>
                          </div>
                        )}

                        <div className="business-meta">
                          <span className="rating">
                            <span aria-hidden="true">★</span>
                            {formatRating(
                              business.average_rating
                            )}
                          </span>

                          <span className="review-count">
                            {business.review_count}{" "}
                            {business.review_count === 1
                              ? "review"
                              : "reviews"}
                          </span>
                        </div>

                        {business.subcategory_name && (
                          <span className="business-category-tag">
                            {business.subcategory_name}
                          </span>
                        )}
                      </div>

                      <div className="business-card-footer">
                        <Link
                          href={`/businesses/${business.business_slug}`}
                          className="view-business"
                        >
                          View business
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
  }
