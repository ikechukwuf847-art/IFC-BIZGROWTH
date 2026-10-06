"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./businesses.css";

const supabase = createSupabaseBrowserClient();

type DirectoryBusiness = {
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

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
};

type BusinessLocation = {
  country_code: string;
  city: string | null;
  state_region: string | null;
  business_count: number;
};

const PAGE_SIZE = 24;

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function isDirectUrl(value: string | null) {
  if (!value) return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

function getLogoUrl(path: string | null) {
  if (!path) return null;

  if (isDirectUrl(path)) {
    return path;
  }

  return `https://iluczxsqdpohzgbknldh.supabase.co/storage/v1/object/public/business-logos/${path}`;
}

function BusinessLogo({
  business,
}: {
  business: DirectoryBusiness;
}) {
  const [failed, setFailed] = useState(false);

  const logoUrl = getLogoUrl(business.logo_url);

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
      className="business-logo"
      onError={() => setFailed(true)}
    />
  );
}

function BusinessCard({
  business,
}: {
  business: DirectoryBusiness;
}) {
  const location = [
    business.city,
    business.state_region,
    business.country_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/businesses/${business.business_slug}`}
      className="business-card"
    >
      <div className="business-card-top">
        <div className="business-card-logo">
          <BusinessLogo business={business} />
        </div>

        {business.is_featured && (
          <span className="featured-badge">
            Featured
          </span>
        )}
      </div>

      <div className="business-card-body">
        <div className="business-title-row">
          <h2>{business.business_name}</h2>

          {business.verification_status === "approved" && (
            <span
              className="verification-badge"
              title="Verified business"
              aria-label="Verified business"
            >
              ✓
            </span>
          )}
        </div>

        {business.category_name && (
          <p className="business-category">
            {business.category_name}
          </p>
        )}

        {location && (
          <div className="business-location">
            <span aria-hidden="true">📍</span>
            <span>{location}</span>
          </div>
        )}

        <div className="business-rating">
          <span aria-hidden="true">★</span>

          <span>
            {business.average_rating !== null
              ? Number(
                  business.average_rating
                ).toFixed(1)
              : "New"}
          </span>

          {business.review_count !== null &&
            Number(business.review_count) > 0 && (
              <span className="review-count">
                ({business.review_count})
              </span>
            )}

          {business.distance_km !== null && (
            <span className="distance">
              •{" "}
              {Number(
                business.distance_km
              ).toFixed(1)}{" "}
              km
            </span>
          )}
        </div>

        {business.description && (
          <p className="business-description">
            {business.description}
          </p>
        )}

        <span className="view-business">
          View business →
        </span>
      </div>
    </Link>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="business-card skeleton-card">
      <div className="skeleton-top">
        <div className="skeleton-logo" />
      </div>

      <div className="skeleton-body">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-category" />
        <div className="skeleton-line skeleton-location" />
        <div className="skeleton-line skeleton-description" />
        <div className="skeleton-line skeleton-description-short" />
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<
    DirectoryBusiness[]
  >([]);

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [locations, setLocations] = useState<
    BusinessLocation[]
  >([]);

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] =
    useState("");

  const [selectedCountry, setSelectedCountry] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [locationMode, setLocationMode] =
    useState<"all" | "nearby">("all");

  const [userCoordinates, setUserCoordinates] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] =
    useState(false);

  const [initializingUrl, setInitializingUrl] =
    useState(true);

  const loadCategories = useCallback(
    async () => {
      const {
        data,
        error: categoriesError,
      } = await supabase
        .from("business_categories")
        .select(
          "id, name, slug, description, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
        });

      if (categoriesError) {
        console.error(
          "Unable to load categories:",
          categoriesError
        );

        return;
      }

      setCategories(
        (data || []) as Category[]
      );
    },
    []
  );

  const loadLocations = useCallback(
    async () => {
      const {
        data,
        error: locationsError,
      } = await supabase.rpc(
        "get_public_business_locations"
      );

      if (locationsError) {
        console.error(
          "Unable to load locations:",
          locationsError
        );

        return;
      }

      setLocations(
        (data || []) as BusinessLocation[]
      );
    },
    []
  );

  const loadBusinesses = useCallback(
    async (
      requestedPage = page
    ) => {
      setLoading(true);
      setError("");

      const selectedLocation =
        selectedCountry && selectedCity
          ? null
          : selectedCountry || null;

      const isNearby =
        locationMode === "nearby" &&
        userCoordinates !== null;

      const categoryId =
        selectedCategory || null;

      const offset =
        (requestedPage - 1) * PAGE_SIZE;

      const {
        data,
        error: businessesError,
      } = await supabase.rpc(
        "get_public_business_directory",
        {
          p_search:
            submittedSearch.trim() || null,

          p_country_code:
            isNearby
              ? null
              : selectedLocation,

          p_city:
            isNearby
              ? null
              : selectedCity || null,

          p_category_id:
            categoryId,

          p_subcategory_id:
            null,

          p_latitude:
            isNearby
              ? userCoordinates?.latitude
              : null,

          p_longitude:
            isNearby
              ? userCoordinates?.longitude
              : null,

          p_radius_km:
            isNearby
              ? 25
              : null,

          p_featured_only:
            false,

          p_limit:
            PAGE_SIZE + 1,

          p_offset:
            offset,
        }
      );

      if (businessesError) {
        console.error(
          "Unable to load businesses:",
          businessesError
        );

        setBusinesses([]);
        setHasMore(false);
        setLoading(false);
        setError(
          "Unable to load businesses. Please try again."
        );

        return;
      }

      const results =
        (data || []) as DirectoryBusiness[];

      setHasMore(
        results.length > PAGE_SIZE
      );

      setBusinesses(
        results.slice(0, PAGE_SIZE)
      );

      setLoading(false);
    },
    [
      page,
      submittedSearch,
      selectedCountry,
      selectedCity,
      selectedCategory,
      locationMode,
      userCoordinates,
    ]
  );

  useEffect(() => {
    loadCategories();
    loadLocations();
  }, [
    loadCategories,
    loadLocations,
  ]);

  /*
   * Read /businesses?nearby=true without
   * requiring useSearchParams/Suspense.
   */
  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const nearby =
      params.get("nearby") === "true";

    if (nearby) {
      setLocationMode("nearby");
    }

    setInitializingUrl(false);
  }, []);

  const handleUseLocation =
    useCallback(() => {
      if (
        typeof navigator === "undefined" ||
        !navigator.geolocation
      ) {
        setError(
          "Location is not supported on this device."
        );

        return;
      }

      setLocationLoading(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
          });

          setLocationMode("nearby");

          setSelectedCountry("");
          setSelectedCity("");

          setPage(1);

          setLocationLoading(false);
        },

        (positionError) => {
          console.error(
            "Unable to get device location:",
            positionError
          );

          if (
            positionError.code ===
            positionError.PERMISSION_DENIED
          ) {
            setError(
              "Location permission was denied. Please allow location access or select a location instead."
            );
          } else if (
            positionError.code ===
            positionError.POSITION_UNAVAILABLE
          ) {
            setError(
              "Your device could not determine your location. Please select a location instead."
            );
          } else if (
            positionError.code ===
            positionError.TIMEOUT
          ) {
            setError(
              "Location request timed out. Please try again."
            );
          } else {
            setError(
              "Unable to get your location."
            );
          }

          setLocationLoading(false);
        },

        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000,
        }
      );
    }, []);

  useEffect(() => {
    if (!initializingUrl) {
      loadBusinesses(page);
    }
  }, [
    page,
    initializingUrl,
    loadBusinesses,
  ]);

  const handleSearch = (
    event: FormEvent
  ) => {
    event.preventDefault();

    setPage(1);
    setSubmittedSearch(
      search.trim()
    );
  };

  const handleCategoryChange = (
    value: string
  ) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleCountryChange = (
    value: string
  ) => {
    setSelectedCountry(value);
    setSelectedCity("");
    setLocationMode("all");
    setUserCoordinates(null);
    setPage(1);
  };

  const handleCityChange = (
    value: string
  ) => {
    setSelectedCity(value);
    setLocationMode("all");
    setUserCoordinates(null);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedCategory("");
    setLocationMode("all");
    setUserCoordinates(null);
    setPage(1);
    setError("");
  };

  const availableCities = useMemo(() => {
    if (!selectedCountry) {
      return locations;
    }

    return locations.filter(
      (location) =>
        location.country_code ===
        selectedCountry
    );
  }, [
    locations,
    selectedCountry,
  ]);

  const countryOptions = useMemo(() => {
    const unique = new Map<
      string,
      BusinessLocation
    >();

    locations.forEach(
      (location) => {
        if (
          !unique.has(
            location.country_code
          )
        ) {
          unique.set(
            location.country_code,
            location
          );
        }
      }
    );

    return Array.from(
      unique.values()
    ).sort((a, b) =>
      a.country_code.localeCompare(
        b.country_code
      )
    );
  }, [locations]);

  const resultLabel = useMemo(() => {
    if (loading) {
      return "Finding businesses...";
    }

    if (businesses.length === 0) {
      return "No businesses found";
    }

    return `${businesses.length}${
      hasMore ? "+" : ""
    } businesses`;
  }, [
    loading,
    businesses.length,
    hasMore,
  ]);

  return (
    <main className="businesses-page">
      <header className="businesses-header">
        <div className="businesses-header-inner">
          <Link
            href="/"
            className="businesses-brand"
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

          <nav className="desktop-nav">
            <Link href="/discover">
              Discover
            </Link>

            <Link href="/categories">
              Categories
            </Link>

            <Link
              href="/businesses"
              className="active"
            >
              Businesses
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

      <section className="businesses-hero">
        <div className="businesses-container">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              Explore Africa's businesses
            </span>

            <h1>
              Find the right business
              <span> for you.</span>
            </h1>

            <p>
              Search businesses, brands and
              services across Africa.
            </p>
          </div>

          <form
            className="business-search"
            onSubmit={handleSearch}
          >
            <div className="search-field">
              <span
                className="search-icon"
                aria-hidden="true"
              >
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search businesses, services or brands..."
                aria-label="Search businesses"
              />
            </div>

            <button
              type="submit"
              className="search-submit"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="businesses-container businesses-content">
        {error && (
          <div className="businesses-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                loadBusinesses(page)
              }
            >
              Try again
            </button>
          </div>
        )}

        <section className="filter-panel">
          <div className="filter-heading">
            <div>
              <span className="section-kicker">
                Refine results
              </span>

              <h2>
                Find businesses
              </h2>
            </div>

            {(submittedSearch ||
              selectedCountry ||
              selectedCity ||
              selectedCategory ||
              locationMode ===
                "nearby") && (
              <button
                type="button"
                className="clear-filters"
                onClick={
                  clearFilters
                }
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="filters">
            <label className="filter-field">
              <span>Category</span>

              <select
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value
                  )
                }
              >
                <option value="">
                  All categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="filter-field">
              <span>Country</span>

              <select
                value={selectedCountry}
                onChange={(event) =>
                  handleCountryChange(
                    event.target.value
                  )
                }
              >
                <option value="">
                  All countries
                </option>

                {countryOptions.map(
                  (country) => (
                    <option
                      key={
                        country.country_code
                      }
                      value={
                        country.country_code
                      }
                    >
                      {
                        country.country_code
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="filter-field">
              <span>City</span>

              <select
                value={selectedCity}
                onChange={(event) =>
                  handleCityChange(
                    event.target.value
                  )
                }
                disabled={
                  availableCities.length ===
                  0
                }
              >
                <option value="">
                  All cities
                </option>

                {availableCities.map(
                  (
                    location,
                    index
                  ) => (
                    <option
                      key={`${location.country_code}-${location.city}-${index}`}
                      value={
                        location.city || ""
                      }
                    >
                      {location.city ||
                        "Unknown city"}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="button"
              className={`nearby-filter-button ${
                locationMode ===
                "nearby"
                  ? "active"
                  : ""
              }`}
              onClick={
                handleUseLocation
              }
              disabled={
                locationLoading
              }
            >
              <span>
                📍
              </span>

              {locationLoading
                ? "Locating..."
                : locationMode ===
                  "nearby"
                ? "Near me"
                : "Find near me"}
            </button>
          </div>
        </section>

        <section className="results-section">
          <div className="results-heading">
            <div>
              <span className="section-kicker">
                Business directory
              </span>

              <h2>
                {locationMode ===
                "nearby"
                  ? "Businesses Near You"
                  : submittedSearch
                  ? `Results for "${submittedSearch}"`
                  : "All Businesses"}
              </h2>
            </div>

            <span className="result-count">
              {resultLabel}
            </span>
          </div>

          {loading ? (
            <div className="business-grid">
              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <BusinessCardSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          ) : businesses.length ===
            0 ? (
            <div className="empty-results">
              <div className="empty-icon">
                🔎
              </div>

              <h3>
                No businesses found
              </h3>

              <p>
                Try changing your search,
                category or location filters.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="empty-button"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
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

              {(page > 1 ||
                hasMore) && (
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={
                      page === 1 ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Page {page}
                  </span>

                  <button
                    type="button"
                    className="pagination-button primary"
                    disabled={
                      !hasMore ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="business-cta">
          <div>
            <span className="section-kicker">
              Grow your business
            </span>

            <h2>
              Want more customers to
              discover your business?
            </h2>

            <p>
              Create your IFC BIZGROWTH
              business profile and put your
              brand in front of more customers.
            </p>

            <Link
              href="/business/register"
              className="cta-button"
            >
              List your business →
            </Link>
          </div>
        </section>
      </div>

      <footer className="businesses-footer">
        <div className="businesses-container footer-inner">
          <div className="footer-brand">
            <Link
              href="/"
              className="businesses-brand"
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

            <Link href="/businesses">
              Businesses
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

        <Link
          href="/businesses"
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

        <Link href="/categories">
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
    </main>
  );
  }
