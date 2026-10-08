"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./category.css";

const supabase = createSupabaseBrowserClient();

const SUPABASE_URL =
  "https://iluczxsqdpohzgbknldh.supabase.co";

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
  country_code: string | null;
  city: string | null;
  state_region: string | null;
  address: string | null;
  average_rating: number | null;
  review_count: number | null;
  is_featured: boolean;
  verification_status: string | null;
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
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function isDirectUrl(value: string | null) {
  if (!value) return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

/*
 * IMPORTANT:
 * Business logos are stored in the
 * "business-logos" Supabase Storage bucket.
 */
function getLogoUrl(path: string | null) {
  if (!path) return null;

  if (isDirectUrl(path)) {
    return path;
  }

  const cleanPath = path
    .replace(/^\/+/, "")
    .replace(/^business-logos\//, "");

  return `${SUPABASE_URL}/storage/v1/object/public/business-logos/${cleanPath}`;
}

function isVerified(status: string | null) {
  return ["verified", "approved"].includes(
    String(status ?? "").toLowerCase()
  );
}

function formatRating(rating: number | null) {
  if (
    rating === null ||
    Number.isNaN(Number(rating))
  ) {
    return "New";
  }

  return Number(rating).toFixed(1);
}

function getLocation(business: Business) {
  return [
    business.city,
    business.state_region,
    business.country_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function BusinessLogo({
  business,
}: {
  business: Business;
}) {
  const logoUrl = getLogoUrl(business.logo_url);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  if (!logoUrl || failed) {
    return (
      <div className="business-logo-fallback">
        {getInitials(business.business_name)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${business.business_name} logo`}
      className="business-logo-image"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  const location = getLocation(business);

  return (
    <article className="business-card">
      <div className="business-card-top">
        <div className="business-logo">
          <BusinessLogo business={business} />
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

        {business.subcategory_name && (
          <span className="business-category-tag">
            {business.subcategory_name}
          </span>
        )}

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
            {Number(
              business.review_count || 0
            )}{" "}
            {Number(
              business.review_count || 0
            ) === 1
              ? "review"
              : "reviews"}
          </span>
        </div>
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
}

function BusinessSkeleton() {
  return (
    <div className="business-card skeleton-card">
      <div className="skeleton-card-top" />

      <div className="skeleton-card-body">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-small" />
        <div className="skeleton-line skeleton-medium" />
        <div className="skeleton-line skeleton-long" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = String(params.slug || "");

  const selectedSubcategory =
    searchParams.get("subcategory");

  const [category, setCategory] =
    useState<Category | null>(null);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategory() {
      setCategoryLoading(true);
      setError("");

      const { data, error: categoryError } =
        await supabase
          .from("business_categories")
          .select(
            "id,name,slug,description,is_active"
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

      if (cancelled) return;

      if (categoryError) {
        console.error(
          "Unable to load category:",
          categoryError
        );

        setError(
          "Unable to load this category."
        );

        setCategory(null);
        setCategoryLoading(false);

        return;
      }

      if (!data) {
        setError("Category not found.");
        setCategory(null);
        setCategoryLoading(false);

        return;
      }

      setCategory(data as Category);
      setCategoryLoading(false);
    }

    if (slug) {
      loadCategory();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!category) return;

    let cancelled = false;

    async function loadSubcategories() {
      const {
        data,
        error: subcategoryError,
      } = await supabase
        .from("business_subcategories")
        .select(
          "id,category_id,name,slug,description,is_active"
        )
        .eq(
          "category_id",
          category.id
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (cancelled) return;

      if (subcategoryError) {
        console.error(
          "Unable to load subcategories:",
          subcategoryError
        );

        setSubcategories([]);

        return;
      }

      setSubcategories(
        (data || []) as Subcategory[]
      );
    }

    loadSubcategories();

    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!category) return;

    let cancelled = false;

    async function loadBusinesses() {
      setLoading(true);
      setError("");

      let subcategoryId: string | null =
        null;

      if (selectedSubcategory) {
        const matchingSubcategory =
          subcategories.find(
            (item) =>
              item.slug ===
              selectedSubcategory
          );

        if (matchingSubcategory) {
          subcategoryId =
            matchingSubcategory.id;
        }
      }

      const {
        data,
        error: businessesError,
      } = await supabase.rpc(
        "get_public_business_directory",
        {
          p_search: null,

          p_country_code: null,

          p_city: null,

          p_category_id:
            category.id,

          p_subcategory_id:
            subcategoryId,

          p_latitude: null,

          p_longitude: null,

          p_radius_km: null,

          p_featured_only: false,

          p_limit: 100,

          p_offset: 0,
        }
      );

      if (cancelled) return;

      if (businessesError) {
        console.error(
          "Unable to load businesses:",
          businessesError
        );

        setBusinesses([]);

        setError(
          "Unable to load businesses in this category."
        );

        setLoading(false);

        return;
      }

      /*
       * Protect the UI from duplicate businesses
       * returned by directory/category joins.
       */
      const uniqueBusinesses =
        new Map<string, Business>();

      (
        (data || []) as Business[]
      ).forEach((business) => {
        if (
          !uniqueBusinesses.has(
            business.business_id
          )
        ) {
          uniqueBusinesses.set(
            business.business_id,
            business
          );
        }
      });

      setBusinesses(
        Array.from(
          uniqueBusinesses.values()
        )
      );

      setLoading(false);
    }

    /*
     * Wait until subcategories have loaded if
     * the URL contains a subcategory filter.
     */
    if (
      selectedSubcategory &&
      subcategories.length === 0
    ) {
      return;
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, [
    category,
    selectedSubcategory,
    subcategories,
  ]);

  const activeSubcategoryName =
    useMemo(() => {
      if (!selectedSubcategory) {
        return null;
      }

      return (
        subcategories.find(
          (item) =>
            item.slug ===
            selectedSubcategory
        )?.name || null
      );
    }, [
      selectedSubcategory,
      subcategories,
    ]);

  if (categoryLoading) {
    return (
      <main className="category-page">
        <section className="category-loading">
          <div className="category-spinner" />
          <p>Loading category...</p>
        </section>

        <MobileBottomNavigation />
      </main>
    );
  }

  if (!category) {
    return (
      <main className="category-page">
        <section className="category-state category-error">
          <div className="category-state-icon">
            !
          </div>

          <h1>Category not found</h1>

          <p>
            The category you are looking for
            does not exist or is no longer
            available.
          </p>

          <Link
            href="/categories"
            className="category-state-button"
          >
            Browse categories
          </Link>
        </section>

        <MobileBottomNavigation />
      </main>
    );
  }

  return (
    <main className="category-page">
      <header className="category-header">
        <div className="category-header-inner">
          <Link
            href="/"
            className="category-brand"
          >
            <span className="brand-mark">
              IFC
            </span>

            <span className="brand-text">
              <strong>BIZGROWTH</strong>

              <small>
                African Business Growth
              </small>
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/discover">
              Discover
            </Link>

            <Link
              href="/categories"
              className="active"
            >
              Categories
            </Link>

            <Link href="/about">
              About
            </Link>

            <Link href="/contact">
              Contact
            </Link>
          </nav>

          <div className="header-actions">
            <Link
              href="/business/register"
              className="header-business-link"
            >
              List your business
            </Link>

            <Link
              href="/login"
              className="header-login-button"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="category-hero">
        <div className="category-container">
          <nav
            className="category-breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>

            <span>/</span>

            <Link href="/categories">
              Categories
            </Link>

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

                  <h2>
                    Browse by specialty
                  </h2>
                </div>
              </div>

              <div className="subcategory-grid">
                <Link
                  href={`/categories/${category.slug}`}
                  className={`subcategory-card ${
                    !selectedSubcategory
                      ? "active"
                      : ""
                  }`}
                >
                  <span className="subcategory-card-icon">
                    All
                  </span>

                  <span className="subcategory-card-content">
                    <strong>
                      All businesses
                    </strong>

                    <small>
                      Explore the full
                      category
                    </small>
                  </span>

                  <span className="subcategory-arrow">
                    →
                  </span>
                </Link>

                {subcategories.map(
                  (subcategory) => (
                    <Link
                      key={
                        subcategory.id
                      }
                      href={`/categories/${category.slug}?subcategory=${subcategory.slug}`}
                      className={`subcategory-card ${
                        selectedSubcategory ===
                        subcategory.slug
                          ? "active"
                          : ""
                      }`}
                    >
                      <span className="subcategory-card-icon">
                        {getInitials(
                          subcategory.name
                        )}
                      </span>

                      <span className="subcategory-card-content">
                        <strong>
                          {
                            subcategory.name
                          }
                        </strong>

                        {subcategory.description && (
                          <small>
                            {
                              subcategory.description
                            }
                          </small>
                        )}
                      </span>

                      <span className="subcategory-arrow">
                        →
                      </span>
                    </Link>
                  )
                )}
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
                  {activeSubcategoryName
                    ? `${activeSubcategoryName} businesses`
                    : `Businesses in ${category.name}`}
                </h2>
              </div>

              <span className="business-count">
                {businesses.length}{" "}
                {businesses.length === 1
                  ? "business"
                  : "businesses"}
              </span>
            </div>

            {error ? (
              <div className="category-state category-error">
                <div className="category-state-icon">
                  !
                </div>

                <h3>
                  Unable to load businesses
                </h3>

                <p>{error}</p>

                <Link
                  href={`/categories/${category.slug}`}
                  className="category-state-button"
                >
                  Try again
                </Link>
              </div>
            ) : loading ? (
              <div className="business-grid">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <BusinessSkeleton
                    key={index}
                  />
                ))}
              </div>
            ) : businesses.length ===
              0 ? (
              <div className="category-state">
                <div className="category-state-icon">
                  ⌕
                </div>

                <h3>
                  No businesses yet
                </h3>

                <p>
                  There are currently no
                  public businesses listed
                  {activeSubcategoryName
                    ? ` under ${activeSubcategoryName}`
                    : ` in ${category.name}`}
                  .
                </p>

                {selectedSubcategory ? (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="category-state-button"
                  >
                    View all businesses
                  </Link>
                ) : (
                  <Link
                    href="/categories"
                    className="category-state-button"
                  >
                    Browse other categories
                  </Link>
                )}
              </div>
            ) : (
              <div className="business-grid">
                {businesses.map(
                  (business) => (
                    <BusinessCard
                      key={
                        business.business_id
                      }
                      business={
                        business
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="category-footer">
        <div className="category-container footer-inner">
          <div className="footer-brand">
            <Link
              href="/"
              className="category-brand"
            >
              <span className="brand-mark">
                IFC
              </span>

              <span className="brand-text">
                <strong>
                  BIZGROWTH
                </strong>

                <small>
                  African Business Growth
                </small>
              </span>
            </Link>

            <p>
              Helping African businesses
              become more visible,
              discoverable and connected
              to customers.
            </p>
          </div>

          <div className="footer-links">
            <Link href="/discover">
              Discover
            </Link>

            <Link href="/categories">
              Categories
            </Link>

            <Link href="/about">
              About
            </Link>

            <Link href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      <MobileBottomNavigation />
    </main>
  );
}

function MobileBottomNavigation() {
  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile navigation"
    >
      <Link href="/discover">
        <span
          className="mobile-nav-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </span>

        <span>Home</span>
      </Link>

      <Link href="/businesses">
        <span
          className="mobile-nav-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-4-4" />
          </svg>
        </span>

        <span>Search</span>
      </Link>

      <Link
        href="/categories"
        className="active"
      >
        <span
          className="mobile-nav-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="4"
              y="4"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="14"
              y="4"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="4"
              y="14"
              width="6"
              height="6"
              rx="1"
            />

            <rect
              x="14"
              y="14"
              width="6"
              height="6"
              rx="1"
            />
          </svg>
        </span>

        <span>Categories</span>
      </Link>

      <Link href="/businesses?nearby=true">
        <span
          className="mobile-nav-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />

            <circle
              cx="12"
              cy="9"
              r="2.5"
            />
          </svg>
        </span>

        <span>Nearby</span>
      </Link>

      <Link href="/more">
        <span
          className="mobile-nav-icon mobile-nav-more"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <circle
              cx="5"
              cy="12"
              r="1.7"
            />

            <circle
              cx="12"
              cy="12"
              r="1.7"
            />

            <circle
              cx="19"
              cy="12"
              r="1.7"
            />
          </svg>
        </span>

        <span>More</span>
      </Link>
    </nav>
  );
  }
