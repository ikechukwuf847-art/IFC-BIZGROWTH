"use client";

import {
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./discover.css";

const supabase = createSupabaseBrowserClient();

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

type BusinessLocation = {
  country_code: string;
  city: string | null;
  state_region: string | null;
  business_count: number;
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

function isDirectUrl(value: string | null) {
  if (!value) return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

/*
 * Business logo
 *
 * The bucket is private, so the component receives
 * an already-generated signed URL.
 */
const BusinessLogo = memo(function BusinessLogo({
  business,
  logoUrl,
}: {
  business: DirectoryBusiness;
  logoUrl?: string | null;
}) {
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
      className="business-logo"
      onError={() => setFailed(true)}
    />
  );
});

function BusinessCard({
  business,
  media,
  storageUrls,
}: {
  business: DirectoryBusiness;
  media?: BusinessMedia;
  storageUrls: Record<string, string>;
}) {
  const coverUrl = media?.storage_path
    ? isDirectUrl(media.storage_path)
      ? media.storage_path
      : storageUrls[media.storage_path] || null
    : null;

  const logoUrl = business.logo_url
    ? isDirectUrl(business.logo_url)
      ? business.logo_url
      : storageUrls[business.logo_url] || null
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
          />
        ) : (
          <div className="business-cover-placeholder">
            <BusinessLogo
              business={business}
              logoUrl={logoUrl}
            />
          </div>
        )}

        {business.is_featured && (
          <span className="featured-label">
            Featured
          </span>
        )}

        <div className="business-card-logo">
          <BusinessLogo
            business={business}
            logoUrl={logoUrl}
          />
        </div>
      </div>

      <div className="business-card-content">
        <div className="business-title-row">
          <h3>{business.business_name}</h3>

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

        <div className="business-location">
          <span>📍</span>

          <span>
            {[
              business.city,
              business.state_region,
              business.country_code,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        <div className="business-rating-row">
          <span>⭐</span>

          <span>
            {business.average_rating !== null
              ? Number(
                  business.average_rating
                ).toFixed(1)
              : "New"}
          </span>

          {business.review_count &&
          Number(business.review_count) > 0 ? (
            <span className="review-count">
              ({business.review_count})
            </span>
          ) : null}

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
  const [businesses, setBusinesses] = useState<
    DirectoryBusiness[]
  >([]);

  const [featuredBusinesses, setFeaturedBusinesses] =
    useState<DirectoryBusiness[]>([]);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [locations, setLocations] = useState<
    BusinessLocation[]
  >([]);

  const [media, setMedia] = useState<BusinessMedia[]>([]);

  /*
   * Signed URLs for private Supabase Storage files.
   *
   * Key:
   * storage path
   *
   * Value:
   * signed URL
   */
  const [storageUrls, setStorageUrls] = useState<
    Record<string, string>
  >({});

  const [search, setSearch] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState("");

  const [locationMode, setLocationMode] = useState<
    "backend" | "nearby"
  >("backend");

  const [loading, setLoading] = useState(true);

  const [featuredLoading, setFeaturedLoading] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [userCoordinates, setUserCoordinates] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  /*
   * Categories
   */
  const loadCategories = useCallback(async () => {
    const { data, error: categoriesError } =
      await supabase
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

    setCategories((data || []) as Category[]);
  }, []);

  /*
   * Locations
   *
   * These come from:
   * get_public_business_locations
   */
  const loadLocations = useCallback(async () => {
    const { data, error: locationsError } =
      await supabase.rpc(
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
  }, []);

  /*
   * Normal directory businesses
   */
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");

    const locationParts =
      locationMode === "backend" &&
      selectedLocation
        ? selectedLocation.split("|")
        : null;

    const selectedCountry =
      locationParts?.[0] || null;

    const selectedCity =
      locationParts?.[1] || null;

    const { data, error: businessesError } =
      await supabase.rpc(
        "get_public_business_directory",
        {
          p_search:
            search.trim() || null,

          p_country_code:
            selectedCountry,

          p_city:
            selectedCity,

          p_category_id:
            null,

          p_subcategory_id:
            null,

          p_latitude:
            locationMode === "nearby"
              ? userCoordinates?.latitude ??
                null
              : null,

          p_longitude:
            locationMode === "nearby"
              ? userCoordinates?.longitude ??
                null
              : null,

          p_radius_km:
            locationMode === "nearby"
              ? 25
              : null,

          p_featured_only:
            false,

          p_limit: 100,

          p_offset: 0,
        }
      );

    if (businessesError) {
      console.error(
        "Unable to load businesses:",
        businessesError
      );

      setError(
        "Unable to load businesses."
      );

      setBusinesses([]);
      setLoading(false);

      return;
    }

    setBusinesses(
      (data || []) as DirectoryBusiness[]
    );

    setLoading(false);
  }, [
    search,
    selectedLocation,
    locationMode,
    userCoordinates,
  ]);

  /*
   * Featured businesses
   *
   * This is always a separate backend query.
   */
  const loadFeaturedBusinesses =
    useCallback(async () => {
      setFeaturedLoading(true);

      const locationParts =
        locationMode === "backend" &&
        selectedLocation
          ? selectedLocation.split("|")
          : null;

      const selectedCountry =
        locationParts?.[0] || null;

      const selectedCity =
        locationParts?.[1] || null;

      const { data, error: featuredError } =
        await supabase.rpc(
          "get_public_business_directory",
          {
            p_search: null,

            p_country_code:
              selectedCountry,

            p_city:
              selectedCity,

            p_category_id:
              null,

            p_subcategory_id:
              null,

            p_latitude:
              locationMode === "nearby"
                ? userCoordinates?.latitude ??
                  null
                : null,

            p_longitude:
              locationMode === "nearby"
                ? userCoordinates?.longitude ??
                  null
                : null,

            p_radius_km:
              locationMode === "nearby"
                ? 25
                : null,

            p_featured_only:
              true,

            p_limit: 8,

            p_offset: 0,
          }
        );

      if (featuredError) {
        console.error(
          "Unable to load featured businesses:",
          featuredError
        );

        setFeaturedBusinesses([]);
        setFeaturedLoading(false);

        return;
      }

      setFeaturedBusinesses(
        (data || []) as DirectoryBusiness[]
      );

      setFeaturedLoading(false);
    }, [
      selectedLocation,
      locationMode,
      userCoordinates,
    ]);

  /*
   * Business media
   */
  const loadMedia = useCallback(
    async (businessIds: string[]) => {
      if (!businessIds.length) {
        setMedia([]);
        return;
      }

      const { data, error: mediaError } =
        await supabase
          .from("business_media")
          .select(
            "id, business_id, storage_path, media_type, title, description, sort_order, is_featured, is_active"
          )
          .in(
            "business_id",
            businessIds
          )
          .eq(
            "is_active",
            true
          )
          .order("sort_order", {
            ascending: true,
            nullsFirst: false,
          });

      if (mediaError) {
        console.error(
          "Unable to load business media:",
          mediaError
        );
        return;
      }

      setMedia(
        (data || []) as BusinessMedia[]
      );
    },
    []
  );

  /*
   * Create signed URLs for private
   * Supabase Storage files.
   */
  const loadStorageUrls = useCallback(
    async (paths: string[]) => {
      const uniquePaths = Array.from(
        new Set(
          paths.filter(
            (path) =>
              Boolean(path) &&
              !isDirectUrl(path)
          )
        )
      );

      if (!uniquePaths.length) {
        return;
      }

      const newUrls: Record<
        string,
        string
      > = {};

      for (const path of uniquePaths) {
        /*
         * Don't request another signed URL
         * if we already have one.
         */
        if (storageUrls[path]) {
          continue;
        }

        const { data, error: signedUrlError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(
              path,
              3600
            );

        if (signedUrlError) {
          console.error(
            `Unable to create signed URL for ${path}:`,
            signedUrlError
          );
          continue;
        }

        if (data?.signedUrl) {
          newUrls[path] =
            data.signedUrl;
        }
      }

      if (Object.keys(newUrls).length) {
        setStorageUrls((current) => ({
          ...current,
          ...newUrls,
        }));
      }
    },
    [storageUrls]
  );

  /*
   * Initial backend data
   */
  useEffect(() => {
    loadCategories();
    loadLocations();
  }, [
    loadCategories,
    loadLocations,
  ]);

  /*
   * Automatically request the user's
   * location when Discover opens.
   *
   * There is deliberately NO hardcoded
   * Abuja/default location here.
   */
  const handleUseLocation = useCallback(() => {
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
        setSelectedLocation("");

        setLocationLoading(false);
      },

      (positionError) => {
        console.error(
          "Unable to get device location:",
          positionError
        );

        let message =
          "Unable to get your location.";

        if (
          positionError.code ===
          positionError.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access or select a location instead.";
        } else if (
          positionError.code ===
          positionError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your device could not determine your location. Please select a location instead.";
        } else if (
          positionError.code ===
          positionError.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again or select a location instead.";
        }

        setError(message);
        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, []);

  /*
   * Automatically request location
   * once when the Discover page opens.
   */
  useEffect(() => {
    handleUseLocation();
  }, [handleUseLocation]);

  /*
   * Reload businesses when filters,
   * search, or device location changes.
   */
  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  /*
   * Reload featured businesses when
   * location changes.
   */
  useEffect(() => {
    loadFeaturedBusinesses();
  }, [loadFeaturedBusinesses]);

  /*
   * Load media for visible businesses.
   */
  useEffect(() => {
    const allIds = [
      ...businesses.map(
        (business) =>
          business.business_id
      ),

      ...featuredBusinesses.map(
        (business) =>
          business.business_id
      ),
    ];

    const uniqueIds = Array.from(
      new Set(allIds)
    );

    loadMedia(uniqueIds);
  }, [
    businesses,
    featuredBusinesses,
    loadMedia,
  ]);

  /*
   * Generate signed URLs for business
   * logos and business media.
   */
  useEffect(() => {
    const paths: string[] = [];

    businesses.forEach((business) => {
      if (
        business.logo_url &&
        !isDirectUrl(
          business.logo_url
        )
      ) {
        paths.push(
          business.logo_url
        );
      }
    });

    featuredBusinesses.forEach(
      (business) => {
        if (
          business.logo_url &&
          !isDirectUrl(
            business.logo_url
          )
        ) {
          paths.push(
            business.logo_url
          );
        }
      }
    );

    media.forEach((item) => {
      if (
        item.storage_path &&
        !isDirectUrl(
          item.storage_path
        )
      ) {
        paths.push(
          item.storage_path
        );
      }
    });

    if (paths.length) {
      loadStorageUrls(paths);
    }
  }, [
    businesses,
    featuredBusinesses,
    media,
    loadStorageUrls,
  ]);

  /*
   * Map media by business.
   */
  const mediaByBusiness = useMemo(() => {
    const map = new Map<
      string,
      BusinessMedia
    >();

    media.forEach((item) => {
      if (
        !map.has(
          item.business_id
        )
      ) {
        map.set(
          item.business_id,
          item
        );
      }
    });

    return map;
  }, [media]);

  /*
   * Popular businesses
   */
  const popularBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => {
        const ratingA = Number(
          a.average_rating || 0
        );

        const ratingB = Number(
          b.average_rating || 0
        );

        if (
          ratingB !== ratingA
        ) {
          return (
            ratingB - ratingA
          );
        }

        return (
          Number(
            b.review_count || 0
          ) -
          Number(
            a.review_count || 0
          )
        );
      })
      .slice(0, 8);
  }, [businesses]);

  /*
   * Nearby businesses
   *
   * The RPC already calculates
   * distance_km from the user's coordinates.
   */
  const nearbyBusinesses = useMemo(() => {
    if (!userCoordinates) {
      return [];
    }

    return [...businesses]
      .filter(
        (business) =>
          business.distance_km !==
          null
      )
      .sort(
        (a, b) =>
          Number(
            a.distance_km ||
              999999
          ) -
          Number(
            b.distance_km ||
              999999
          )
      )
      .slice(0, 8);
  }, [
    businesses,
    userCoordinates,
  ]);

  /*
   * Search
   */
  const handleSearch = (
    event: FormEvent
  ) => {
    event.preventDefault();

    loadBusinesses();
  };

  /*
   * Backend location selection
   */
  const handleLocationChange = (
    value: string
  ) => {
    setLocationMode(
      "backend"
    );

    setUserCoordinates(null);

    setSelectedLocation(
      value
    );
  };

  /*
   * Human-readable location label
   */
  const selectedLocationLabel =
    useMemo(() => {
      if (
        locationMode ===
        "nearby"
      ) {
        return "Near me";
      }

      if (!selectedLocation) {
        return "Select location";
      }

      const parts =
        selectedLocation.split(
          "|"
        );

      const country =
        parts[0];

      const city =
        parts[1];

      return [
        city,
        country,
      ]
        .filter(Boolean)
        .join(", ");
    }, [
      selectedLocation,
      locationMode,
    ]);

  return (
    <main className="discover-page">

      {/* Header */}
      <header className="discover-header">
        <div className="discover-header-inner">

          <Link
            href="/"
            className="discover-brand"
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
            <Link
              href="/discover"
              className="active"
            >
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

      {/* Hero */}
      <section className="discover-hero">

        <div className="discover-container hero-content">

          <span className="hero-eyebrow">
            Discover businesses across Africa
          </span>

          <h1>
            Discover businesses.
            <br />
            <span>
              Grow with Africa.
            </span>
          </h1>

          <p className="hero-description">
            Find businesses, services and
            brands around you and across
            Africa.
          </p>

          <form
            className="discover-search"
            onSubmit={handleSearch}
          >

            <div className="search-main">

              <span className="search-icon">
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
                placeholder="Search businesses, services..."
              />

            </div>

            <div className="search-divider" />

            <select
              className="discover-search-location"
              value={
                locationMode ===
                "nearby"
                  ? ""
                  : selectedLocation
              }
              onChange={(event) =>
                handleLocationChange(
                  event.target.value
                )
              }
              disabled={
                locationLoading
              }
            >

              <option value="">
                {selectedLocationLabel}
              </option>

              {locations.map(
                (
                  location,
                  index
                ) => {

                  const value =
                    `${location.country_code}|${
                      location.city ||
                      ""
                    }`;

                  const label =
                    [
                      location.city,
                      location.state_region,
                      location.country_code,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      );

                  return (
                    <option
                      value={
                        value
                      }
                      key={`${value}-${index}`}
                    >
                      {label} (
                      {
                        location.business_count
                      }
                      )
                    </option>
                  );
                }
              )}

            </select>

            <button
              type="button"
              className="location-nearby-button"
              onClick={
                handleUseLocation
              }
              disabled={
                locationLoading
              }
              title="Use my current location"
            >
              {locationLoading
                ? "..."
                : "📍"}
            </button>

            <button
              type="submit"
              className="search-button"
            >
              Search
            </button>

          </form>

        </div>
      </section>

      {/* Main */}
      <div className="discover-container discover-main">

        {error && (
          <div className="discover-error">
            {error}
          </div>
        )}

        {/* Categories */}
        <section className="discover-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                Explore
              </span>

              <h2>
                Browse by category
              </h2>
            </div>

            <Link
              href="/categories"
              className="view-all"
            >
              View all →
            </Link>

          </div>

          <div className="category-scroll">

            {categories
              .slice(0, 8)
              .map(
                (category) => (
                  <Link
                    href={`/categories/${category.slug}`}
                    key={
                      category.id
                    }
                    className="category-chip"
                  >
                    {
                      category.name
                    }
                  </Link>
                )
              )}

          </div>

        </section>

        {/* Featured */}
        <section className="discover-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                Featured
              </span>

              <h2>
                Featured Businesses
              </h2>
            </div>

          </div>

          {featuredLoading ? (
            <div className="business-grid">

              {Array.from({
                length: 4,
              }).map(
                (_, index) => (
                  <BusinessCardSkeleton
                    key={
                      index
                    }
                  />
                )
              )}

            </div>
          ) : featuredBusinesses.length ===
            0 ? (
            <div className="empty-section">
              No featured businesses available
              yet.
            </div>
          ) : (
            <div className="business-grid">

              {featuredBusinesses.map(
                (business) => (
                  <BusinessCard
                    key={
                      business.business_id
                    }
                    business={
                      business
                    }
                    media={mediaByBusiness.get(
                      business.business_id
                    )}
                    storageUrls={
                      storageUrls
                    }
                  />
                )
              )}

            </div>
          )}

        </section>

        {/* Popular */}
        <section className="discover-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                Popular
              </span>

              <h2>
                Popular Businesses
              </h2>
            </div>

          </div>

          {loading ? (
            <div className="business-grid">

              {Array.from({
                length: 4,
              }).map(
                (_, index) => (
                  <BusinessCardSkeleton
                    key={
                      index
                    }
                  />
                )
              )}

            </div>
          ) : popularBusinesses.length ===
            0 ? (
            <div className="empty-section">
              No businesses found.
            </div>
          ) : (
            <div className="business-grid">

              {popularBusinesses.map(
                (business) => (
                  <BusinessCard
                    key={
                      business.business_id
                    }
                    business={
                      business
                    }
                    media={mediaByBusiness.get(
                      business.business_id
                    )}
                    storageUrls={
                      storageUrls
                    }
                  />
                )
              )}

            </div>
          )}

        </section>

        {/* Nearby */}
        <section className="discover-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                Around you
              </span>

              <h2>
                Businesses Near You
              </h2>
            </div>

            <button
              type="button"
              className="view-all location-button"
              onClick={
                handleUseLocation
              }
            >
              📍{" "}
              {locationMode ===
              "nearby"
                ? "Near me"
                : "Find nearby"}
            </button>

          </div>

          {!userCoordinates ? (
            <div className="empty-section">
              Use your location to discover
              businesses near you.
            </div>
          ) : nearbyBusinesses.length ===
            0 ? (
            <div className="empty-section">
              No businesses found near you.
            </div>
          ) : (
            <div className="business-grid">

              {nearbyBusinesses.map(
                (business) => (
                  <BusinessCard
                    key={
                      business.business_id
                    }
                    business={
                      business
                    }
                    media={mediaByBusiness.get(
                      business.business_id
                    )}
                    storageUrls={
                      storageUrls
                    }
                  />
                )
              )}

            </div>
          )}

        </section>

        {/* Popular Categories */}
        <section className="discover-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                Explore more
              </span>

              <h2>
                Popular Categories
              </h2>
            </div>

          </div>

          <div className="popular-category-grid">

            {categories
              .slice(0, 6)
              .map(
                (category) => (
                  <Link
                    href={`/categories/${category.slug}`}
                    key={
                      category.id
                    }
                    className="popular-category-card"
                  >
                    <strong>
                      {
                        category.name
                      }
                    </strong>

                    <span>
                      Explore →
                    </span>
                  </Link>
                )
              )}

          </div>

        </section>

        {/* CTA */}
        <section className="business-cta">

          <div>

            <span className="section-kicker">
              Grow your business
            </span>

            <h2>
              Put your business in front of
              more customers.
            </h2>

            <p>
              Create your business profile
              and let customers discover your
              brand.
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

      {/* Footer */}
      <footer className="discover-footer">

        <div className="discover-container footer-inner">

          <div className="footer-brand">

            <Link
              href="/"
              className="discover-brand"
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
              discoverable and connected to
              customers.
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

      {/* Mobile navigation */}
      <nav className="mobile-bottom-nav">

        <Link
          href="/discover"
          className="active"
        >
          Discover
        </Link>

        <Link href="/categories">
          Categories
        </Link>

        <Link href="/business/register">
          List Business
        </Link>

        <Link href="/login">
          Account
        </Link>

      </nav>

    </main>
  );
  }
