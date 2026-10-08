"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import "./category.css";

const SUPABASE_URL = "https://iluczxsqdpohzgbknldh.supabase.co";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
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
  latitude: number | null;
  longitude: number | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  subcategory_id: string | null;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  average_rating: number | null;
  review_count: number | null;
  is_featured: boolean;
  verification_status: string | null;
  distance_km: number | null;
};

function isDirectUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getStorageUrl(bucket: string, path: string | null) {
  if (!path) return null;

  if (isDirectUrl(path)) {
    return path;
  }

  const cleanPath = path
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${bucket}/`), "");

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

function getLogoUrl(path: string | null) {
  return getStorageUrl("business-logos", path);
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "B"
  );
}

function isVerified(status: string | null) {
  if (!status) return false;

  return [
    "approved",
    "verified",
    "verification_approved",
  ].includes(status.toLowerCase());
}

function formatRating(rating: number | null) {
  if (!rating || rating <= 0) return "New";

  return rating.toFixed(1);
}

function getLocation(business: Business) {
  const parts = [
    business.city,
    business.state_region,
    business.country_code,
  ].filter(Boolean);

  return parts.join(", ") || "Location not available";
}

function BusinessLogo({
  business,
  size = 72,
}: {
  business: Business;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const logoUrl = getLogoUrl(business.logo_url);

  if (!logoUrl || imageFailed) {
    return (
      <div
        className="business-logo fallback"
        style={{
          width: size,
          height: size,
        }}
      >
        {getInitials(business.business_name)}
      </div>
    );
  }

  return (
    <div
      className="business-logo"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={logoUrl}
        alt={`${business.business_name} logo`}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

function BusinessCard({ business }: { business: Business }) {
  return (
    <Link
      href={`/businesses/${business.business_slug}`}
      className="business-card"
    >
      <div className="business-card-top">
        <BusinessLogo business={business} size={68} />

        <div className="business-card-badges">
          {business.is_featured && (
            <span className="featured-badge">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />
              </svg>
              Featured
            </span>
          )}

          {isVerified(business.verification_status) && (
            <span className="verified-badge">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="business-card-content">
        <h3>{business.business_name}</h3>

        {business.subcategory_name && (
          <span className="business-category">
            {business.subcategory_name}
          </span>
        )}

        <div className="business-location">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>

          <span>{getLocation(business)}</span>
        </div>

        <div className="business-rating">
          <span className="rating-stars">
            ★
          </span>

          <span className="rating-value">
            {formatRating(business.average_rating)}
          </span>

          {business.review_count !== null &&
            business.review_count > 0 && (
              <span className="review-count">
                ({business.review_count})
              </span>
            )}
        </div>

        {business.description && (
          <p className="business-description">
            {business.description}
          </p>
        )}

        <span className="view-business">
          View business
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function BusinessSkeleton() {
  return (
    <div className="business-card skeleton-card">
      <div className="skeleton-card-top">
        <div className="skeleton skeleton-logo" />

        <div className="skeleton-badges">
          <div className="skeleton skeleton-badge" />
        </div>
      </div>

      <div className="skeleton-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-category" />
        <div className="skeleton skeleton-location" />
        <div className="skeleton skeleton-rating" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description short" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const selectedSubcategory = searchParams.get("subcategory");

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [category, setCategory] = useState<Category | null>(
    null
  );

  const [subcategories, setSubcategories] = useState<
    Subcategory[]
  >([]);

  const [businesses, setBusinesses] = useState<Business[]>(
    []
  );

  const [loadingCategory, setLoadingCategory] =
    useState(true);

  const [loadingSubcategories, setLoadingSubcategories] =
    useState(false);

  const [loadingBusinesses, setLoadingBusinesses] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  /*
   * Load category
   */
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadCategory() {
      setLoadingCategory(true);
      setError(null);

      const { data, error: categoryError } = await supabase
        .from("business_categories")
        .select(
          "id,name,slug,description,is_active"
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;

      if (categoryError) {
        console.error(categoryError);
        setError("Unable to load this category.");
        setCategory(null);
        setLoadingCategory(false);
        return;
      }

      if (!data) {
        setError("Category not found.");
        setCategory(null);
        setLoadingCategory(false);
        return;
      }

      setCategory(data);
      setLoadingCategory(false);
    }

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  /*
   * Load subcategories
   *
   * Important:
   * We create currentCategory so TypeScript knows
   * category cannot become null inside the async function.
   */
  useEffect(() => {
    if (!category) return;

    const currentCategory = category;

    let cancelled = false;

    async function loadSubcategories() {
      setLoadingSubcategories(true);

      const { data, error: subcategoryError } =
        await supabase
          .from("business_subcategories")
          .select(
            "id,category_id,name,slug,description,is_active,sort_order"
          )
          .eq("category_id", currentCategory.id)
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          });

      if (cancelled) return;

      if (subcategoryError) {
        console.error(subcategoryError);
        setSubcategories([]);
      } else {
        setSubcategories(data ?? []);
      }

      setLoadingSubcategories(false);
    }

    loadSubcategories();

    return () => {
      cancelled = true;
    };
  }, [category, supabase]);

  /*
   * Load businesses
   *
   * Important:
   * currentCategory fixes the TypeScript narrowing error.
   */
  useEffect(() => {
    if (!category) return;

    const currentCategory = category;

    let cancelled = false;

    async function loadBusinesses() {
      setLoadingBusinesses(true);

      const subcategoryId =
        selectedSubcategory
          ? subcategories.find(
              (subcategory) =>
                subcategory.slug === selectedSubcategory
            )?.id ?? null
          : null;

      const { data, error: businessError } =
        await supabase.rpc(
          "get_public_business_directory",
          {
            p_search: null,
            p_country_code: null,
            p_city: null,
            p_category_id: currentCategory.id,
            p_subcategory_id: subcategoryId,
            p_latitude: null,
            p_longitude: null,
            p_radius_km: null,
            p_featured_only: false,
            p_limit: 100,
            p_offset: 0,
          }
        );

      if (cancelled) return;

      if (businessError) {
        console.error(businessError);
        setBusinesses([]);
        setError(
          "Unable to load businesses in this category."
        );
        setLoadingBusinesses(false);
        return;
      }

      const rows = (data ?? []) as Business[];

      /*
       * Remove duplicate businesses in case the
       * directory RPC returns multiple category rows.
       */
      const uniqueBusinesses = Array.from(
        new Map(
          rows.map((business) => [
            business.business_id,
            business,
          ])
        ).values()
      );

      setBusinesses(uniqueBusinesses);
      setLoadingBusinesses(false);
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, [
    category,
    selectedSubcategory,
    subcategories,
    supabase,
  ]);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return businesses;
    }

    return businesses.filter((business) => {
      return (
        business.business_name
          ?.toLowerCase()
          .includes(query) ||
        business.description
          ?.toLowerCase()
          .includes(query) ||
        business.city
          ?.toLowerCase()
          .includes(query) ||
        business.state_region
          ?.toLowerCase()
          .includes(query) ||
        business.subcategory_name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [businesses, search]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const selectedSubcategoryName =
    selectedSubcategory
      ? subcategories.find(
          (subcategory) =>
            subcategory.slug === selectedSubcategory
        )?.name
      : null;

  if (loadingCategory) {
    return (
      <main className="category-page">
        <div className="category-loading">
          <div className="loading-spinner" />
          <p>Loading category...</p>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="category-page">
        <header className="category-header">
          <div className="category-header-inner">
            <Link
              href="/discover"
              className="brand"
            >
              <span className="brand-mark">IFC</span>
              <span className="brand-text">
                BIZGROWTH
              </span>
            </Link>

            <nav className="desktop-nav">
              <Link href="/discover">Discover</Link>
              <Link href="/businesses">Businesses</Link>
              <Link
                href="/categories"
                className="active"
              >
                Categories
              </Link>
            </nav>
          </div>
        </header>

        <section className="category-error">
          <div className="error-icon">
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <h1>Category not found</h1>

          <p>
            We couldn't find the category you're looking
            for.
          </p>

          <Link
            href="/categories"
            className="primary-button"
          >
            Browse categories
          </Link>
        </section>

        <MobileBottomNav />
      </main>
    );
  }

  return (
    <main className="category-page">
      {/* HEADER */}
      <header className="category-header">
        <div className="category-header-inner">
          <Link
            href="/discover"
            className="brand"
          >
            <span className="brand-mark">IFC</span>

            <span className="brand-text">
              BIZGROWTH
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/discover">
              Discover
            </Link>

            <Link href="/businesses">
              Businesses
            </Link>

            <Link
              href="/categories"
              className="active"
            >
              Categories
            </Link>
          </nav>

          <div className="header-actions">
            <Link
              href="/businesses"
              className="header-search-button"
              aria-label="Search businesses"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="login-button"
            >
              For Businesses
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="category-hero">
        <div className="category-hero-inner">
          <div className="breadcrumb">
            <Link href="/discover">
              Home
            </Link>

            <span>/</span>

            <Link href="/categories">
              Categories
            </Link>

            <span>/</span>

            <span>{category.name}</span>
          </div>

          <div className="hero-content">
            <div>
              <span className="hero-label">
                BUSINESS CATEGORY
              </span>

              <h1>{category.name}</h1>

              {category.description && (
                <p>{category.description}</p>
              )}
            </div>

            <div className="hero-icon">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <div className="category-main">
        {/* SUBCATEGORIES */}
        {(loadingSubcategories ||
          subcategories.length > 0) && (
          <section className="subcategories-section">
            <div className="section-heading">
              <div>
                <span className="section-label">
                  EXPLORE
                </span>

                <h2>
                  Browse {category.name}
                </h2>
              </div>
            </div>

            {loadingSubcategories ? (
              <div className="subcategory-grid">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      className="subcategory-skeleton"
                      key={index}
                    >
                      <div className="skeleton skeleton-sub-title" />
                      <div className="skeleton skeleton-sub-text" />
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="subcategory-grid">
                <Link
                  href={`/categories/${category.slug}`}
                  className={`subcategory-card ${
                    !selectedSubcategory
                      ? "selected"
                      : ""
                  }`}
                >
                  <div className="subcategory-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="21"
                      height="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 6h16" />
                      <path d="M4 12h16" />
                      <path d="M4 18h16" />
                    </svg>
                  </div>

                  <div>
                    <strong>All businesses</strong>
                    <span>
                      Explore everything
                    </span>
                  </div>
                </Link>

                {subcategories.map(
                  (subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={`/categories/${category.slug}?subcategory=${encodeURIComponent(
                        subcategory.slug
                      )}`}
                      className={`subcategory-card ${
                        selectedSubcategory ===
                        subcategory.slug
                          ? "selected"
                          : ""
                      }`}
                    >
                      <div className="subcategory-icon">
                        <svg
                          viewBox="0 0 24 24"
                          width="21"
                          height="21"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 5h6v6H5z" />
                          <path d="M13 5h6v6h-6z" />
                          <path d="M5 13h6v6H5z" />
                          <path d="M13 13h6v6h-6z" />
                        </svg>
                      </div>

                      <div>
                        <strong>
                          {subcategory.name}
                        </strong>

                        {subcategory.description ? (
                          <span>
                            {subcategory.description}
                          </span>
                        ) : (
                          <span>
                            Explore businesses
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {/* BUSINESSES */}
        <section className="businesses-section">
          <div className="businesses-heading">
            <div>
              <span className="section-label">
                DISCOVER BUSINESSES
              </span>

              <h2>
                {selectedSubcategoryName
                  ? selectedSubcategoryName
                  : `Businesses in ${category.name}`}
              </h2>

              {!loadingBusinesses && (
                <p>
                  {filteredBusinesses.length}{" "}
                  {filteredBusinesses.length === 1
                    ? "business"
                    : "businesses"}{" "}
                  found
                </p>
              )}
            </div>

            {!loadingBusinesses &&
              businesses.length > 0 && (
                <form
                  className="business-search"
                  onSubmit={handleSearch}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="search"
                    placeholder="Search businesses..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </form>
              )}
          </div>

          {loadingBusinesses ? (
            <div className="business-grid">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <BusinessSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <h3>Something went wrong</h3>

              <p>{error}</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3>
                {search
                  ? "No businesses found"
                  : "No businesses yet"}
              </h3>

              <p>
                {search
                  ? "Try a different search term."
                  : "Businesses in this category will appear here when they are publicly listed."}
              </p>

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="business-grid">
              {filteredBusinesses.map(
                (business) => (
                  <BusinessCard
                    key={business.business_id}
                    business={business}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="category-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link
              href="/discover"
              className="brand"
            >
              <span className="brand-mark">
                IFC
              </span>

              <span className="brand-text">
                BIZGROWTH
              </span>
            </Link>

            <p>
              Discover businesses, products and
              services across Africa.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Explore</h4>

              <Link href="/discover">
                Discover
              </Link>

              <Link href="/businesses">
                Businesses
              </Link>

              <Link href="/categories">
                Categories
              </Link>
            </div>

            <div>
              <h4>Businesses</h4>

              <Link href="/login">
                Business Login
              </Link>

              <Link href="/signup">
                Create Business
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} IFC
            BIZGROWTH. All rights reserved.
          </span>

          <span>
            Building digital bridges.
          </span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <MobileBottomNav />
    </main>
  );
}

function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav">
      <Link href="/discover">
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
          <path d="M9 21v-7h6v7" />
        </svg>

        <span>Home</span>
      </Link>

      <Link href="/businesses">
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />
          <path d="m20 20-4-4" />
        </svg>

        <span>Search</span>
      </Link>

      <Link
        href="/categories"
        className="active"
      >
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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

        <span>Categories</span>
      </Link>

      <Link href="/businesses?nearby=true">
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle
            cx="12"
            cy="10"
            r="2.5"
          />
        </svg>

        <span>Nearby</span>
      </Link>

      <Link href="/more">
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle
            cx="5"
            cy="12"
            r="1"
          />
          <circle
            cx="12"
            cy="12"
            r="1"
          />
          <circle
            cx="19"
            cy="12"
            r="1"
          />
        </svg>

        <span>More</span>
      </Link>
    </nav>
  );
  }
