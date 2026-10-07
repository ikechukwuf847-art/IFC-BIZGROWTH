"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./category.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
};

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country_code: string | null;
  verification_status: string | null;
  is_featured: boolean;
  average_rating: number | null;
  review_count: number | null;
  distance_km: number | null;
};

type GenericRow = Record<string, unknown>;

const SUPABASE_URL =
  "https://iluczxsqdpohzgbknldh.supabase.co";

function isValidUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getStorageUrl(
  bucket: string,
  path: string | null,
) {
  if (!path) return null;

  if (isValidUrl(path)) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, "");

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

function getLogoUrl(path: string | null) {
  return getStorageUrl("business-logos", path);
}

function getRowText(
  row: GenericRow,
  keys: string[],
) {
  for (const key of keys) {
    const value = row[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
  }

  return null;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

function isVerified(status: string | null) {
  if (!status) return false;

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return [
    "verified",
    "approved",
    "fully_verified",
    "verified_business",
  ].includes(normalized);
}

function Stars({
  rating,
}: {
  rating: number;
}) {
  const rounded = Math.round(rating);

  return (
    <div
      className="category-stars"
      aria-label={`${rating.toFixed(
        1,
      )} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rounded
              ? "filled"
              : ""
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function BusinessLogo({
  business,
}: {
  business: Business;
}) {
  const [failed, setFailed] =
    useState(false);

  const logoUrl = getLogoUrl(
    business.logo_url,
  );

  if (!logoUrl || failed) {
    return (
      <div className="category-business-logo-fallback">
        {getInitials(business.name)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${business.name} logo`}
      className="category-business-logo"
      onError={() => setFailed(true)}
    />
  );
}

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  const rating =
    Number(business.average_rating) || 0;

  const reviewCount =
    Number(business.review_count) || 0;

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="category-business-card"
    >
      <div className="category-card-top">
        <BusinessLogo
          business={business}
        />

        {business.is_featured && (
          <span className="category-featured-badge">
            Featured
          </span>
        )}
      </div>

      <div className="category-business-content">
        <div className="category-business-name-row">
          <h2>{business.name}</h2>

          {isVerified(
            business.verification_status,
          ) && (
            <span
              className="category-verified"
              title="Verified business"
              aria-label="Verified business"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 2.5l2.1 1.2 2.4-.1 1.1 2.1 2.1 1.1-.1 2.4L20.5 11l.7 2.3-1.5 1.9.1 2.4-2.2 1-1.1 2.1-2.4-.2L12 21.5l-2.1-1.2-2.4.2-1.1-2.1-2.2-1 .1-2.4 1.5-1.9-.7-2.3.7-2.3-1.5-1.8.1-2.4 2.2-1 1.1-2.1 2.4.1L12 2.5z"
                  fill="currentColor"
                />

                <path
                  d="M8.1 12.1l2.5 2.5 5.4-5.4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        {business.description && (
          <p className="category-business-description">
            {business.description}
          </p>
        )}

        <div className="category-business-rating">
          <Stars rating={rating} />

          <strong>
            {rating > 0
              ? rating.toFixed(1)
              : "0.0"}
          </strong>

          <span>
            ({reviewCount}{" "}
            {reviewCount === 1
              ? "review"
              : "reviews"})
          </span>
        </div>

        {business.country_code && (
          <div className="category-business-location">
            <span>⌖</span>
            <span>
              {business.country_code}
            </span>
          </div>
        )}

        {typeof business.distance_km ===
          "number" && (
          <div className="category-distance">
            {business.distance_km < 1
              ? `${Math.round(
                  business.distance_km *
                    1000,
                )} m away`
              : `${business.distance_km.toFixed(
                  1,
                )} km away`}
          </div>
        )}

        <span className="category-view-business">
          View business
          <span aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : "";

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    [],
  );

  const [category, setCategory] =
    useState<Category | null>(null);

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadCategory = useCallback(
    async () => {
      if (!slug) return;

      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("business_categories")
          .select(
            `
              id,
              name,
              slug,
              description,
              icon_url
            `,
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (!categoryData) {
          setNotFound(true);
          return;
        }

        const currentCategory =
          categoryData as Category;

        setCategory(currentCategory);

        const {
          data: businessData,
          error: businessError,
        } = await supabase.rpc(
          "get_public_business_directory",
          {
            p_search: null,
            p_country_code: null,
            p_city: null,
            p_category_id:
              currentCategory.id,
            p_subcategory_id: null,
            p_latitude: null,
            p_longitude: null,
            p_radius_km: null,
            p_featured_only: false,
            p_limit: 100,
            p_offset: 0,
          },
        );

        if (businessError) {
          throw businessError;
        }

        const rows =
          (businessData as GenericRow[]) ||
          [];

        const mappedBusinesses: Business[] =
          rows.map((row) => ({
            id:
              getRowText(row, [
                "id",
                "business_id",
              ]) || "",
            name:
              getRowText(row, [
                "name",
                "business_name",
              ]) || "Business",
            slug:
              getRowText(row, [
                "slug",
                "business_slug",
              ]) || "",
            description:
              getRowText(row, [
                "description",
                "business_description",
              ]),
            logo_url:
              getRowText(row, [
                "logo_url",
                "business_logo_url",
              ]),
            country_code:
              getRowText(row, [
                "country_code",
              ]),
            verification_status:
              getRowText(row, [
                "verification_status",
              ]),
            is_featured:
              Boolean(
                row.is_featured,
              ),
            average_rating:
              row.average_rating != null
                ? Number(
                    row.average_rating,
                  )
                : null,
            review_count:
              row.review_count != null
                ? Number(
                    row.review_count,
                  )
                : null,
            distance_km:
              row.distance_km != null
                ? Number(
                    row.distance_km,
                  )
                : null,
          }));

        setBusinesses(
          mappedBusinesses.filter(
            (business) =>
              business.id &&
              business.slug,
          ),
        );
      } catch (err) {
        console.error(err);

        setError(
          "We couldn't load this category right now. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [slug, supabase],
  );

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const filteredBusinesses =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return businesses;
      }

      return businesses.filter(
        (business) =>
          business.name
            .toLowerCase()
            .includes(query) ||
          business.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [businesses, search]);

  const featuredBusinesses =
    useMemo(
      () =>
        filteredBusinesses.filter(
          (business) =>
            business.is_featured,
        ),
      [filteredBusinesses],
    );

  const regularBusinesses =
    useMemo(
      () =>
        filteredBusinesses.filter(
          (business) =>
            !business.is_featured,
        ),
      [filteredBusinesses],
    );

  if (loading) {
    return (
      <main className="category-page">
        <div className="category-loading">
          <div className="category-spinner" />
          <p>
            Loading category...
          </p>
        </div>
      </main>
    );
  }

  if (notFound || !category) {
    return (
      <main className="category-page">
        <div className="category-empty">
          <div className="category-empty-icon">
            !
          </div>

          <h1>
            Category not found
          </h1>

          <p>
            This category may no longer
            be available.
          </p>

          <Link
            href="/categories"
            className="category-primary-button"
          >
            Browse categories
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="category-page">
        <div className="category-error">
          <div className="category-error-icon">
            !
          </div>

          <h1>
            Something went wrong
          </h1>

          <p>{error}</p>

          <button
            type="button"
            className="category-primary-button"
            onClick={loadCategory}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="category-page">
      <header className="category-topbar">
        <div className="category-topbar-inner">
          <Link
            href="/categories"
            className="category-back"
            aria-label="Back to categories"
          >
            ←
          </Link>

          <Link
            href="/discover"
            className="category-brand"
          >
            IFC BIZGROWTH
          </Link>

          <Link
            href="/businesses"
            className="category-directory-link"
          >
            Businesses
          </Link>
        </div>
      </header>

      <section className="category-hero">
        <div className="category-hero-inner">
          <div className="category-hero-icon">
            {category.icon_url &&
            isValidUrl(
              category.icon_url,
            ) ? (
              <img
                src={category.icon_url}
                alt=""
              />
            ) : (
              <span>
                {category.name
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="category-hero-content">
            <span className="category-eyebrow">
              BUSINESS CATEGORY
            </span>

            <h1>{category.name}</h1>

            <p>
              {category.description ||
                `Discover businesses in ${category.name} on IFC BIZGROWTH.`}
            </p>

            <div className="category-count">
              <strong>
                {businesses.length}
              </strong>

              <span>
                {businesses.length === 1
                  ? "business"
                  : "businesses"}{" "}
                available
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="category-container">
        <div className="category-toolbar">
          <div className="category-search">
            <span aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder={`Search ${category.name}...`}
              aria-label={`Search ${category.name}`}
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <Link
            href="/businesses"
            className="category-all-businesses"
          >
            Browse all businesses
            <span>→</span>
          </Link>
        </div>

        {filteredBusinesses.length ===
        0 ? (
          <section className="category-no-results">
            <div className="category-no-results-icon">
              ⌕
            </div>

            <h2>
              No businesses found
            </h2>

            <p>
              {search
                ? `No businesses in ${category.name} match "${search}".`
                : `There are currently no public businesses in ${category.name}.`}
            </p>

            {search && (
              <button
                type="button"
                className="category-primary-button"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear search
              </button>
            )}
          </section>
        ) : (
          <>
            {featuredBusinesses.length >
              0 && (
              <section className="category-business-section">
                <div className="category-section-heading">
                  <div>
                    <span>
                      RECOMMENDED
                    </span>

                    <h2>
                      Featured businesses
                    </h2>
                  </div>

                  <span className="category-section-count">
                    {
                      featuredBusinesses.length
                    }{" "}
                    featured
                  </span>
                </div>

                <div className="category-business-grid">
                  {featuredBusinesses.map(
                    (business) => (
                      <BusinessCard
                        key={
                          business.id
                        }
                        business={
                          business
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {regularBusinesses.length >
              0 && (
              <section className="category-business-section">
                <div className="category-section-heading">
                  <div>
                    <span>
                      EXPLORE
                    </span>

                    <h2>
                      Businesses in{" "}
                      {category.name}
                    </h2>
                  </div>

                  <span className="category-section-count">
                    {
                      regularBusinesses.length
                    }{" "}
                    {regularBusinesses.length ===
                    1
                      ? "business"
                      : "businesses"}
                  </span>
                </div>

                <div className="category-business-grid">
                  {regularBusinesses.map(
                    (business) => (
                      <BusinessCard
                        key={
                          business.id
                        }
                        business={
                          business
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
