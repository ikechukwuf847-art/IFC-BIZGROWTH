"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import "./discover.css";

const STORAGE_BUCKET = "business-logos";

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

type BusinessMedia = {
  id: string;
  business_id: string;
  storage_path: string;
  media_type: string | null;
  title: string | null;
  description: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
};

type DirectoryLocation = {
  country_code: string;
  city: string | null;
  state_region: string | null;
  business_count: number;
};

type SelectedLocation = {
  country_code: string | null;
  city: string | null;
  state_region: string | null;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getStorageUrl(storagePath: string | null) {
  if (!storagePath) return null;

  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl || null;
}

function formatLocation(business: DirectoryBusiness) {
  const parts = [
    business.city,
    business.state_region,
    business.country_code,
  ].filter(Boolean);

  return parts.join(", ");
}

function formatDistance(distance: number | null) {
  if (distance === null || distance === undefined) return null;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

function formatRating(rating: number | null) {
  if (!rating) return "New";
  return Number(rating).toFixed(1);
}

function LocationLabel({
  location,
}: {
  location: SelectedLocation;
}) {
  if (!location.country_code && !location.city) {
    return <>All locations</>;
  }

  return (
    <>
      {location.city ||
        location.state_region ||
        location.country_code ||
        "All locations"}
    </>
  );
}

function BusinessLogo({
  business,
  size = "medium",
}: {
  business: DirectoryBusiness;
  size?: "small" | "medium" | "large";
}) {
  const [failed, setFailed] = useState(false);

  const logoUrl = useMemo(
    () => getStorageUrl(business.logo_url),
    [business.logo_url]
  );

  if (!logoUrl || failed) {
    return (
      <div className={`business-logo-fallback ${size}`}>
        {getInitials(business.business_name)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${business.business_name} logo`}
      className={`business-logo ${size}`}
      onError={() => setFailed(true)}
    />
  );
}

function VerificationBadge() {
  return (
    <span
      className="verification-badge"
      title="Verified business"
      aria-label="Verified business"
    >
      ✓
    </span>
  );
}

function BusinessCard({
  business,
  media,
}: {
  business: DirectoryBusiness;
  media?: BusinessMedia;
}) {
  const coverUrl = media?.storage_path
    ? getStorageUrl(media.storage_path)
    : null;

  return (
    <Link
      href={`/businesses/${business.business_slug}`}
      className="business-card"
    >
      <div className="business-card-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="business-cover-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="business-cover-placeholder" />
        )}

        {business.is_featured && (
          <span className="featured-label">Featured</span>
        )}

        <div className="business-card-logo">
          <BusinessLogo business={business} size="medium" />
        </div>
      </div>

      <div className="business-card-content">
        <div className="business-title-row">
          <h3>{business.business_name}</h3>

          {business.verification_status === "approved" && (
            <VerificationBadge />
          )}
        </div>

        {business.category_name && (
          <p className="business-category">
            {business.category_name}
          </p>
        )}

        <div className="business-location">
          <span className="location-icon">⌖</span>
          <span>{formatLocation(business) || "Location available"}</span>
        </div>

        <div className="business-rating-row">
          <span className="rating-star">★</span>
          <span className="rating-number">
            {formatRating(business.average_rating)}
          </span>

          {business.review_count !== null &&
            business.review_count > 0 && (
              <span className="review-count">
                ({business.review_count})
              </span>
            )}

          {business.distance_km !== null && (
            <>
              <span className="rating-separator">•</span>
              <span className="distance">
                {formatDistance(business.distance_km)}
              </span>
            </>
          )}
        </div>

        {business.description && (
          <p className="business-description">
            {business.description}
          </p>
        )}

        <span className="view-business">
          View business
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="business-card skeleton-card">
      <div className="skeleton-cover" />

      <div className="skeleton-card-content">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-small" />
        <div className="skeleton-line skeleton-medium" />
        <div className="skeleton-line skeleton-long" />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    DirectoryBusiness[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<DirectoryLocation[]>([]);
  const [media, setMedia] = useState<BusinessMedia[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation>({
      country_code: null,
      city: null,
      state_region: null,
    });

  const [locationOpen, setLocationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState("");

  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const loadCategories = useCallback(async () => {
    const { data, error: categoriesError } = await supabase
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
      console.error("Category loading error:", categoriesError);
      return;
    }

    setCategories((data || []) as Category[]);
  }, []);

  const loadLocations = useCallback(async () => {
    setLocationLoading(true);

    const { data, error: locationsError } = await supabase.rpc(
      "get_public_business_locations"
    );

    if (locationsError) {
      console.error("Location loading error:", locationsError);
      setLocationLoading(false);
      return;
    }

    setLocations(
      ((data || []) as DirectoryLocation[]).map((item) => ({
        ...item,
        business_count: Number(item.business_count || 0),
      }))
    );

    setLocationLoading(false);
  }, []);

  const loadFeaturedBusinesses = useCallback(async () => {
    setFeaturedLoading(true);

    const { data, error: featuredError } = await supabase.rpc(
      "get_public_business_directory",
      {
        p_search: activeSearch || null,
        p_country_code: selectedLocation.country_code,
        p_city: selectedLocation.city,
        p_category_id: null,
        p_subcategory_id: null,
        p_latitude: null,
        p_longitude: null,
        p_radius_km: null,
        p_featured_only: true,
        p_limit: 8,
        p_offset: 0,
      }
    );

    if (featuredError) {
      console.error("Featured businesses error:", featuredError);
      setFeaturedBusinesses([]);
    } else {
      setFeaturedBusinesses(
        (data || []) as DirectoryBusiness[]
      );
    }

    setFeaturedLoading(false);
  }, [
    activeSearch,
    selectedLocation.country_code,
    selectedLocation.city,
  ]);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: businessesError } = await supabase.rpc(
      "get_public_business_directory",
      {
        p_search: activeSearch || null,
        p_country_code: selectedLocation.country_code,
        p_city: selectedLocation.city,
        p_category_id: null,
        p_subcategory_id: null,
        p_latitude: userCoordinates?.latitude ?? null,
        p_longitude: userCoordinates?.longitude ?? null,
        p_radius_km: userCoordinates ? 25 : null,
        p_featured_only: false,
        p_limit: 100,
        p_offset: 0,
      }
    );

    if (businessesError) {
      console.error("Businesses loading error:", businessesError);
      setBusinesses([]);
      setError(
        "We couldn't load businesses right now. Please try again."
      );
      setLoading(false);
      return;
    }

    setBusinesses((data || []) as DirectoryBusiness[]);
    setLoading(false);
  }, [
    activeSearch,
    selectedLocation.country_code,
    selectedLocation.city,
    userCoordinates,
  ]);

  const loadMedia = useCallback(
    async (businessList: DirectoryBusiness[]) => {
      const ids = businessList.map(
        (business) => business.business_id
      );

      if (!ids.length) {
        setMedia([]);
        return;
      }

      const { data, error: mediaError } = await supabase
        .from("business_media")
        .select(
          "id, business_id, storage_path, media_type, title, description, sort_order, is_featured, is_active"
        )
        .in("business_id", ids)
        .eq("is_active", true)
        .order("is_featured", {
          ascending: false,
        })
        .order("sort_order", {
          ascending: true,
          nullsFirst: false,
        });

      if (mediaError) {
        console.error("Business media error:", mediaError);
        setMedia([]);
        return;
      }

      setMedia((data || []) as BusinessMedia[]);
    },
    []
  );

  useEffect(() => {
    loadCategories();
    loadLocations();
  }, [loadCategories, loadLocations]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    loadFeaturedBusinesses();
  }, [loadFeaturedBusinesses]);

  useEffect(() => {
    const combined = [
      ...featuredBusinesses,
      ...businesses,
    ];

    const uniqueBusinesses = Array.from(
      new Map(
        combined.map((business) => [
          business.business_id,
          business,
        ])
      ).values()
    );

    loadMedia(uniqueBusinesses);
  }, [businesses, featuredBusinesses, loadMedia]);

  const mediaByBusiness = useMemo(() => {
    const map = new Map<string, BusinessMedia>();

    for (const item of media) {
      if (!map.has(item.business_id)) {
        map.set(item.business_id, item);
      }
    }

    return map;
  }, [media]);

  const popularBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => {
        const ratingA = Number(a.average_rating || 0);
        const ratingB = Number(b.average_rating || 0);

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        return (
          Number(b.review_count || 0) -
          Number(a.review_count || 0)
        );
      })
      .slice(0, 8);
  }, [businesses]);

  const nearbyBusinesses = useMemo(() => {
    if (userCoordinates) {
      return [...businesses]
        .filter(
          (business) =>
            business.distance_km !== null &&
            business.distance_km !== undefined
        )
        .sort(
          (a, b) =>
            Number(a.distance_km || 999999) -
            Number(b.distance_km || 999999)
        )
        .slice(0, 8);
    }

    if (selectedLocation.city) {
      return businesses.slice(0, 8);
    }

    return [];
  }, [businesses, selectedLocation.city, userCoordinates]);

  const popularCategories = useMemo(() => {
    return categories
      .map((category) => {
        const count = businesses.filter(
          (business) =>
            business.category_id === category.id
        ).length;

        return {
          ...category,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [categories, businesses]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  const handleLocationSelect = (
    location: SelectedLocation
  ) => {
    setSelectedLocation(location);
    setUserCoordinates(null);
    setLocationOpen(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Location services are not supported on this device."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setSelectedLocation({
          country_code: null,
          city: null,
          state_region: null,
        });

        setLocationOpen(false);
        setError("");
      },
      () => {
        setError(
          "We couldn't access your location. Please select a location instead."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const clearLocation = () => {
    setSelectedLocation({
      country_code: null,
      city: null,
      state_region: null,
    });

    setUserCoordinates(null);
    setLocationOpen(false);
  };

  return (
    <main className="discover-page">
      {/* HEADER */}
      <header className="discover-header">
        <div className="discover-header-inner">
          <Link href="/" className="discover-brand">
            <span className="brand-mark">IFC</span>
            <span className="brand-text">
              <strong>BIZGROWTH</strong>
              <small>African Business Growth</small>
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/discover" className="active">
              Discover
            </Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
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

      {/* HERO */}
      <section className="discover-hero">
        <div className="hero-background-shape hero-shape-one" />
        <div className="hero-background-shape hero-shape-two" />

        <div className="discover-container hero-content">
          <span className="hero-eyebrow">
            Discover businesses across Africa
          </span>

          <h1>
            Find businesses.
            <br />
            <span>Discover opportunities.</span>
          </h1>

          <p className="hero-description">
            Explore businesses, services and brands around you
            and across Africa.
          </p>

          <form
            className="discover-search"
            onSubmit={handleSearch}
          >
            <div className="search-main">
              <span className="search-icon">⌕</span>

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search businesses, services or brands"
                aria-label="Search businesses"
              />

              {searchInput && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="search-divider" />

            <button
              type="button"
              className="search-location"
              onClick={() =>
                setLocationOpen((current) => !current)
              }
            >
              <span className="location-pin">⌖</span>

              <span className="search-location-text">
                <small>Location</small>
                <strong>
                  {userCoordinates ? (
                    "Near me"
                  ) : (
                    <LocationLabel
                      location={selectedLocation}
                    />
                  )}
                </strong>
              </span>

              <span className="location-chevron">⌄</span>
            </button>

            <button
              type="submit"
              className="search-button"
            >
              Search
            </button>
          </form>

          {/* LOCATION MENU */}
          {locationOpen && (
            <div className="location-menu">
              <div className="location-menu-header">
                <div>
                  <strong>Choose a location</strong>
                  <span>
                    Locations are based on businesses listed
                    on IFC BIZGROWTH.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLocationOpen(false)}
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                className="location-option use-location-option"
                onClick={handleUseLocation}
              >
                <span className="location-option-icon">
                  ◎
                </span>

                <span>
                  <strong>Use my location</strong>
                  <small>
                    Find businesses closest to you
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="location-option"
                onClick={clearLocation}
              >
                <span className="location-option-icon">
                  ◌
                </span>

                <span>
                  <strong>All locations</strong>
                  <small>
                    Browse businesses across Africa
                  </small>
                </span>
              </button>

              <div className="location-list">
                {locationLoading ? (
                  <div className="location-loading">
                    Loading available locations...
                  </div>
                ) : locations.length === 0 ? (
                  <div className="location-loading">
                    No business locations are available yet.
                  </div>
                ) : (
                  locations.map((item, index) => (
                    <button
                      type="button"
                      className="location-option"
                      key={`${item.country_code}-${item.city}-${item.state_region}-${index}`}
                      onClick={() =>
                        handleLocationSelect({
                          country_code:
                            item.country_code,
                          city: item.city,
                          state_region:
                            item.state_region,
                        })
                      }
                    >
                      <span className="location-option-icon">
                        📍
                      </span>

                      <span>
                        <strong>
                          {item.city ||
                            item.state_region ||
                            item.country_code}
                        </strong>

                        <small>
                          {[
                            item.state_region,
                            item.country_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          {" • "}
                          {item.business_count}{" "}
                          {item.business_count === 1
                            ? "business"
                            : "businesses"}
                        </small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MAIN */}
      <div className="discover-container discover-main">
        {error && (
          <div className="discover-error">
            <span>!</span>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                setError("");
                loadBusinesses();
                loadFeaturedBusinesses();
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* CATEGORIES */}
        <section className="discover-section categories-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Explore
              </span>
              <h2>Browse by category</h2>
            </div>

            <Link href="/categories" className="view-all">
              View all
              <span>→</span>
            </Link>
          </div>

          <div className="category-scroll">
            {categories.length === 0 ? (
              <div className="category-loading">
                Loading categories...
              </div>
            ) : (
              categories.slice(0, 8).map((category) => (
                <Link
                  href={`/categories/${category.slug}`}
                  key={category.id}
                  className="category-chip"
                >
                  <span className="category-chip-icon">
                    {getCategoryIcon(category.name)}
                  </span>

                  <span>{category.name}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* FEATURED */}
        <section className="discover-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Handpicked for you
              </span>
              <h2>Featured Businesses</h2>
            </div>

            <span className="section-context">
              {selectedLocation.city ||
                selectedLocation.country_code ||
                "Across Africa"}
            </span>
          </div>

          {featuredLoading ? (
            <div className="business-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <BusinessCardSkeleton key={index} />
              ))}
            </div>
          ) : featuredBusinesses.length === 0 ? (
            <div className="empty-section">
              <div className="empty-icon">★</div>
              <h3>No featured businesses here yet</h3>
              <p>
                Featured businesses will appear here when
                businesses are selected for promotion.
              </p>
            </div>
          ) : (
            <div className="business-grid">
              {featuredBusinesses.map((business) => (
                <BusinessCard
                  key={business.business_id}
                  business={business}
                  media={mediaByBusiness.get(
                    business.business_id
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* POPULAR */}
        <section className="discover-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Popular right now
              </span>
              <h2>Popular Businesses</h2>
            </div>

            <span className="section-context">
              Based on ratings and reviews
            </span>
          </div>

          {loading ? (
            <div className="business-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <BusinessCardSkeleton key={index} />
              ))}
            </div>
          ) : popularBusinesses.length === 0 ? (
            <div className="empty-section">
              <div className="empty-icon">⌕</div>
              <h3>No businesses found</h3>
              <p>
                Try another search or choose a different
                location.
              </p>
            </div>
          ) : (
            <div className="business-grid">
              {popularBusinesses.map((business) => (
                <BusinessCard
                  key={business.business_id}
                  business={business}
                  media={mediaByBusiness.get(
                    business.business_id
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* NEARBY */}
        <section className="discover-section nearby-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Around you
              </span>
              <h2>Businesses Near You</h2>
            </div>

            <button
              type="button"
              className="location-heading-button"
              onClick={() => setLocationOpen(true)}
            >
              <span>⌖</span>
              {userCoordinates
                ? "Using your location"
                : selectedLocation.city
                  ? selectedLocation.city
                  : "Choose location"}
            </button>
          </div>

          {!userCoordinates && !selectedLocation.city ? (
            <div className="nearby-prompt">
              <div className="nearby-prompt-icon">⌖</div>

              <div>
                <h3>Find businesses near you</h3>
                <p>
                  Choose a location or allow location access
                  to discover nearby businesses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLocationOpen(true)}
              >
                Choose location
              </button>
            </div>
          ) : nearbyBusinesses.length === 0 ? (
            <div className="empty-section">
              <div className="empty-icon">⌖</div>
              <h3>No nearby businesses found</h3>
              <p>
                There are no public businesses matching this
                location yet.
              </p>
            </div>
          ) : (
            <div className="business-grid">
              {nearbyBusinesses.map((business) => (
                <BusinessCard
                  key={business.business_id}
                  business={business}
                  media={mediaByBusiness.get(
                    business.business_id
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* POPULAR CATEGORIES */}
        <section className="discover-section popular-categories-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Find what you need
              </span>
              <h2>Popular Categories</h2>
            </div>

            <Link href="/categories" className="view-all">
              All categories
              <span>→</span>
            </Link>
          </div>

          <div className="popular-category-grid">
            {popularCategories.map((category) => (
              <Link
                href={`/categories/${category.slug}`}
                key={category.id}
                className="popular-category-card"
              >
                <span className="popular-category-icon">
                  {getCategoryIcon(category.name)}
                </span>

                <span className="popular-category-content">
                  <strong>{category.name}</strong>
                  <small>
                    {category.count}{" "}
                    {category.count === 1
                      ? "business"
                      : "businesses"}
                  </small>
                </span>

                <span className="popular-category-arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="business-cta">
          <div className="cta-decoration cta-decoration-one" />
          <div className="cta-decoration cta-decoration-two" />

          <div className="cta-content">
            <span className="section-kicker">
              Grow your business
            </span>

            <h2>
              Put your business in front of more customers.
            </h2>

            <p>
              Create your business profile and let customers
              discover what you offer.
            </p>

            <Link
              href="/business/register"
              className="cta-button"
            >
              List your business
              <span>→</span>
            </Link>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="discover-footer">
        <div className="discover-container footer-inner">
          <div className="footer-brand">
            <Link href="/" className="discover-brand">
              <span className="brand-mark">IFC</span>
              <span className="brand-text">
                <strong>BIZGROWTH</strong>
                <small>African Business Growth</small>
              </span>
            </Link>

            <p>
              Helping African businesses become more visible,
              discoverable and connected to customers.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <strong>Explore</strong>
              <Link href="/discover">Discover</Link>
              <Link href="/categories">Categories</Link>
              <Link href="/about">About us</Link>
            </div>

            <div>
              <strong>Businesses</strong>
              <Link href="/business/register">
                List your business
              </Link>
              <Link href="/login">Business login</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom discover-container">
          <span>
            © {new Date().getFullYear()} IFC BIZGROWTH. All
            rights reserved.
          </span>

          <span>
            An IFC Bridge Lab company
          </span>
        </div>
      </footer>

      {/* MOBILE NAV */}
      <nav className="mobile-bottom-nav">
        <Link href="/discover" className="mobile-nav-item active">
          <span>⌂</span>
          <small>Discover</small>
        </Link>

        <Link href="/categories" className="mobile-nav-item">
          <span>◫</span>
          <small>Categories</small>
        </Link>

        <Link
          href="/business/register"
          className="mobile-nav-item mobile-nav-add"
        >
          <span>+</span>
        </Link>

        <Link href="/about" className="mobile-nav-item">
          <span>◎</span>
          <small>About</small>
        </Link>

        <Link href="/login" className="mobile-nav-item">
          <span>◯</span>
          <small>Account</small>
        </Link>
      </nav>
    </main>
  );
}

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("food")) return "🍽";
  if (normalized.includes("fashion")) return "✦";
  if (normalized.includes("furniture")) return "⌂";
  if (normalized.includes("real estate")) return "▦";
  if (normalized.includes("construction")) return "⌂";
  if (normalized.includes("education")) return "▤";
  if (normalized.includes("health")) return "♡";
  if (normalized.includes("technology")) return "◈";
  if (normalized.includes("professional")) return "◉";
  if (normalized.includes("retail")) return "◫";
  if (normalized.includes("automotive")) return "◌";
  if (normalized.includes("agriculture")) return "♧";
  if (normalized.includes("finance")) return "₦";
  if (normalized.includes("hospitality")) return "⌁";
  if (normalized.includes("media")) return "▶";
  if (normalized.includes("events")) return "★";
  if (normalized.includes("logistics")) return "⇢";
  if (normalized.includes("manufacturing")) return "⚙";
  if (normalized.includes("home")) return "⌂";

  return "✦";
  }
