"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "./discover.css";

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
  business_id: string;
  storage_path: string;
  media_type: string | null;
  is_featured: boolean;
  sort_order: number | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

const supabase = createClient();

const STORAGE_BUCKET = "business-logos";

const DEFAULT_CITY = "Abuja";

const FALLBACK_CATEGORY_ICONS: Record<string, string> = {
  "food-restaurants": "🍽",
  "fashion-beauty": "✂",
  furniture: "🛋",
  "real-estate": "⌂",
  education: "🎓",
  "health-wellness": "✚",
  technology: "▣",
  "professional-services": "▤",
  "retail-shopping": "🛍",
  automotive: "🚗",
  agriculture: "♨",
  "finance-business": "₦",
  "hospitality-travel": "▰",
  "media-entertainment": "▶",
  "events-recreation": "★",
  logistics: "▣",
  manufacturing: "⚙",
  "home-building": "⌂",
  construction: "⌂",
};

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "B";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
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

function getCategoryIcon(category: Category) {
  return FALLBACK_CATEGORY_ICONS[category.slug] || "▦";
}

function formatRating(rating: number | null) {
  if (!rating || rating <= 0) return "New";
  return Number(rating).toFixed(1);
}

function formatReviewCount(count: number | null) {
  if (!count || count <= 0) return "No reviews";

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k reviews`;
  }

  return `${count} review${count === 1 ? "" : "s"}`;
}

function formatDistance(distance: number | null) {
  if (distance === null || distance === undefined) return null;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

function getWhatsAppUrl(phone: string | null) {
  if (!phone) return null;

  const cleaned = phone.replace(/[^\d+]/g, "");

  if (!cleaned) return null;

  const normalized = cleaned.startsWith("+")
    ? cleaned.slice(1)
    : cleaned.startsWith("0")
      ? `234${cleaned.slice(1)}`
      : cleaned;

  return `https://wa.me/${normalized}`;
}

function Icon({
  name,
  size = 18,
}: {
  name:
    | "search"
    | "location"
    | "user"
    | "grid"
    | "star"
    | "arrow"
    | "nearby"
    | "phone"
    | "whatsapp"
    | "chevron"
    | "home"
    | "categories"
    | "more"
    | "verified"
    | "briefcase"
    | "store"
    | "filter";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path
            d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5.5 20c.8-3.4 3-5 6.5-5s5.7 1.6 6.5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
          <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case "star":
      return (
        <svg {...common}>
          <path
            d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
            fill="currentColor"
          />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "nearby":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path
            d="M6.5 3.5 9 3l2 4-2 1.5a14 14 0 0 0 6 6L16.5 12l4 2 .5 2.5c.2 1.2-.8 2.3-2 2.3C10.5 18.8 5.2 13.5 4.2 5c-.1-1.2 1-2.2 2.3-1.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "whatsapp":
      return (
        <svg {...common}>
          <path
            d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M9 8.5c.3-.4.7-.4 1-.1l1 1.4c.2.3.2.6-.1.9l-.6.5c.6 1.1 1.5 2 2.6 2.6l.5-.6c.2-.3.6-.3.9-.1l1.4 1c.3.2.3.7 0 1-.5.6-1.2.9-1.9.7-2.2-.6-4.8-3.2-5.4-5.4-.2-.7.1-1.4.6-1.9Z"
            fill="currentColor"
          />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="m4 10 8-6 8 6v9H4v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case "categories":
      return <Icon name="grid" size={size} />;

    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );

    case "verified":
      return (
        <svg {...common}>
          <path
            d="M12 2.8 14 4l2.3-.1 1.2 1.9 2.1 1 .1 2.3 1.2 2-1.2 2 .1 2.3-2.1 1-1.2 1.9-2.3-.1-2 1.2-2-1.2-2.3.1-1.2-1.9-2.1-1 .1-2.3-1.2-2 1.2-2-.1-2.3 2.1-1L7.7 3.9 10 4l2-1.2Z"
            fill="currentColor"
          />
          <path
            d="m8.5 12 2.1 2.1 4.9-5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "briefcase":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 11h16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case "store":
      return (
        <svg {...common}>
          <path d="M4 10h16l-1-5H5l-1 5Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5 10v9h14v-9M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );

    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: "star" | "grid" | "nearby";
  title: string;
  href?: string;
}) {
  return (
    <div className="discover-section-header">
      <div className="discover-section-title">
        <span className="discover-section-icon">
          <Icon name={icon} size={16} />
        </span>
        <h2>{title}</h2>
      </div>

      {href && (
        <Link href={href} className="discover-see-all">
          See All
          <Icon name="chevron" size={13} />
        </Link>
      )}
    </div>
  );
}

function BusinessLogo({
  business,
  className = "",
}: {
  business: DirectoryBusiness;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const logoUrl = useMemo(
    () => getStorageUrl(business.logo_url),
    [business.logo_url]
  );

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={`${business.business_name} logo`}
        className={`business-logo-image ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`business-logo-fallback ${className}`}>
      {getInitials(business.business_name)}
    </div>
  );
}

function VerificationBadge() {
  return (
    <span
      className="verification-badge"
      title="Verified Business"
      aria-label="Verified Business"
    >
      <Icon name="verified" size={13} />
    </span>
  );
}

function BusinessCard({
  business,
  coverUrl,
}: {
  business: DirectoryBusiness;
  coverUrl: string | null;
}) {
  const whatsappUrl = getWhatsAppUrl(business.phone);

  return (
    <article className="business-card">
      <Link
        href={`/businesses/${business.business_slug}`}
        className="business-card-main-link"
        aria-label={`View ${business.business_name}`}
      >
        <div className="business-card-image">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={business.business_name}
              loading="lazy"
            />
          ) : (
            <div className="business-card-image-fallback">
              <BusinessLogo business={business} />
            </div>
          )}

          {business.verification_status === "approved" && (
            <span className="card-verified">
              <Icon name="verified" size={10} />
              Verified
            </span>
          )}

          <div className="business-card-logo">
            <BusinessLogo business={business} />
          </div>
        </div>
      </Link>

      <div className="business-card-content">
        <div className="business-card-name-row">
          <Link
            href={`/businesses/${business.business_slug}`}
            className="business-card-name"
          >
            {business.business_name}
          </Link>

          {business.verification_status === "approved" && (
            <VerificationBadge />
          )}
        </div>

        <p className="business-card-category">
          {business.subcategory_name ||
            business.category_name ||
            "Business"}
        </p>

        <div className="business-card-location">
          <Icon name="location" size={12} />
          <span>
            {business.city || business.state_region || "Africa"}
            {business.state_region &&
            business.city &&
            business.state_region !== business.city
              ? `, ${business.state_region}`
              : ""}
          </span>
        </div>

        <div className="business-card-rating">
          <span className="rating-star">★</span>
          <strong>{formatRating(business.average_rating)}</strong>
          <span>{formatReviewCount(business.review_count)}</span>
        </div>

        {business.distance_km !== null && (
          <div className="business-distance">
            <Icon name="nearby" size={12} />
            {formatDistance(business.distance_km)}
          </div>
        )}

        <div className="business-card-actions">
          <Link
            href={`/businesses/${business.business_slug}`}
            className="view-business-btn"
          >
            View Business
          </Link>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-whatsapp-btn"
              aria-label={`WhatsApp ${business.business_name}`}
            >
              <Icon name="whatsapp" size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<BusinessMedia[]>([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const loadCategories = useCallback(async () => {
    const { data, error: categoryError } = await supabase
      .from("business_categories")
      .select("id,name,slug,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (categoryError) {
      console.error("Category loading error:", categoryError);
      return;
    }

    setCategories((data || []) as Category[]);
  }, []);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc(
      "get_public_business_directory",
      {
        p_search: search.trim() || null,
        p_country_code: null,
        p_city: location || null,
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

    if (rpcError) {
      console.error("Directory RPC error:", rpcError);
      setError(
        "We couldn't load businesses right now. Please try again."
      );
      setBusinesses([]);
      setLoading(false);
      return;
    }

    setBusinesses((data || []) as DirectoryBusiness[]);
    setLoading(false);
  }, [location, search, userCoordinates]);

  const loadMedia = useCallback(
    async (businessRows: DirectoryBusiness[]) => {
      if (!businessRows.length) {
        setMedia([]);
        return;
      }

      const ids = businessRows.map((business) => business.business_id);

      const { data, error: mediaError } = await supabase
        .from("business_media")
        .select(
          "business_id,storage_path,media_type,is_featured,sort_order"
        )
        .in("business_id", ids)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });

      if (mediaError) {
        console.error("Business media error:", mediaError);
        return;
      }

      setMedia((data || []) as BusinessMedia[]);
    },
    []
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (businesses.length) {
      loadMedia(businesses);
    } else {
      setMedia([]);
    }
  }, [businesses, loadMedia]);

  const mediaByBusiness = useMemo(() => {
    const map = new Map<string, BusinessMedia>();

    for (const item of media) {
      if (!map.has(item.business_id)) {
        map.set(item.business_id, item);
      }
    }

    return map;
  }, [media]);

  const featuredBusinesses = useMemo(
    () =>
      businesses
        .filter((business) => business.is_featured)
        .slice(0, 8),
    [businesses]
  );

  const popularBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => {
        const ratingA = Number(a.average_rating || 0);
        const ratingB = Number(b.average_rating || 0);

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        return Number(b.review_count || 0) - Number(a.review_count || 0);
      })
      .slice(0, 8);
  }, [businesses]);

  const nearbyBusinesses = useMemo(() => {
    if (userCoordinates) {
      return [...businesses]
        .filter((business) => business.distance_km !== null)
        .sort(
          (a, b) =>
            Number(a.distance_km || 999999) -
            Number(b.distance_km || 999999)
        )
        .slice(0, 8);
    }

    return businesses.slice(0, 8);
  }, [businesses, userCoordinates]);

  const displayFeatured =
    featuredBusinesses.length > 0
      ? featuredBusinesses
      : popularBusinesses.slice(0, 4);

  const displayPopular =
    popularBusinesses.length > 0
      ? popularBusinesses
      : businesses.slice(0, 8);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadBusinesses();
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocation("Near me");
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setError(
          "We couldn't access your location. Please allow location access or choose a city."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const visibleCategories = categories.slice(0, 5);

  return (
    <main className="discover-page">
      {/* HEADER */}
      <header className="discover-header">
        <div className="discover-header-inner">
          <Link href="/discover" className="discover-brand">
            <div className="discover-brand-mark">
              <span className="brand-chart-line" />
              <span className="brand-chart-bar brand-bar-one" />
              <span className="brand-chart-bar brand-bar-two" />
              <span className="brand-chart-bar brand-bar-three" />
            </div>

            <div>
              <div className="discover-brand-name">
                IFC BIZGROWTH
              </div>
              <div className="discover-brand-subtitle">
                Business Advertising &amp; Discovery Platform
              </div>
            </div>
          </Link>

          <div className="discover-header-actions">
            <button
              type="button"
              className="header-search-button"
              aria-label="Search businesses"
              onClick={() =>
                document
                  .getElementById("discover-search")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="search" size={20} />
            </button>

            <button
              type="button"
              className="header-location-button"
              onClick={handleUseLocation}
              title="Use my location"
            >
              <Icon name="location" size={15} />
              <span>{location}</span>
              <span className="location-chevron">⌄</span>
            </button>

            <Link
              href="/login"
              className="header-account-button"
              aria-label="Account"
            >
              <Icon name="user" size={21} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="discover-hero">
        <div className="discover-hero-overlay" />

        <div className="discover-hero-content">
          <div className="discover-hero-copy">
            <h1>
              Discover Amazing
              <br />
              Businesses <span>Across Africa</span>
            </h1>

            <p>
              Find trusted businesses near you. Support local.
              <br />
              Grow together.
            </p>
          </div>

          <div className="discover-hero-slogan">
            <strong>More Visibility.</strong>
            <strong>More Customers.</strong>
            <strong>More Growth.</strong>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="discover-search-wrap" id="discover-search">
        <form
          className="discover-search-box"
          onSubmit={handleSearch}
        >
          <div className="discover-search-input-wrap">
            <Icon name="search" size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What business are you looking for?"
              aria-label="Search businesses"
            />
          </div>

          <button
            type="button"
            className="discover-search-location"
            onClick={handleUseLocation}
            disabled={locationLoading}
          >
            <Icon name="location" size={17} />
            <span>
              {locationLoading ? "Locating..." : location}
            </span>
            <span>⌄</span>
          </button>

          <button
            type="submit"
            className="discover-search-submit"
          >
            Search
          </button>
        </form>
      </section>

      {error && (
        <div className="discover-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {/* CATEGORIES */}
      <section className="discover-container discover-category-section">
        <div className="discover-category-strip">
          <Link
            href="/categories"
            className="category-tile category-tile-all"
          >
            <span className="category-icon">
              <Icon name="grid" size={22} />
            </span>
            <span>All Categories</span>
          </Link>

          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="category-tile"
            >
              <span className="category-icon category-emoji">
                {getCategoryIcon(category)}
              </span>
              <span>{category.name}</span>
            </Link>
          ))}

          <Link
            href="/categories"
            className="category-tile category-tile-see-all"
          >
            <span className="category-more-dots">•••</span>
            <span>See All</span>
            <Icon name="chevron" size={12} />
          </Link>
        </div>
      </section>

      {/* FEATURED */}
      <section className="discover-container discover-section">
        <SectionHeader
          icon="star"
          title="Featured Businesses"
          href="/businesses?featured=true"
        />

        {loading ? (
          <div className="business-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="business-card skeleton-card" key={item}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton skeleton-line large" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : displayFeatured.length > 0 ? (
          <div className="business-grid">
            {displayFeatured.map((business) => {
              const mediaItem = mediaByBusiness.get(
                business.business_id
              );

              return (
                <BusinessCard
                  key={`featured-${business.business_id}`}
                  business={business}
                  coverUrl={
                    mediaItem
                      ? getStorageUrl(mediaItem.storage_path)
                      : null
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-directory-state">
            <Icon name="store" size={30} />
            <h3>No featured businesses yet</h3>
            <p>
              Businesses will appear here as they become
              featured.
            </p>
          </div>
        )}
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="discover-container discover-section">
        <SectionHeader
          icon="grid"
          title="Popular Categories"
          href="/categories"
        />

        <div className="popular-category-grid">
          {categories.slice(0, 5).map((category) => {
            const count = businesses.filter(
              (business) => business.category_id === category.id
            ).length;

            const categoryBusiness =
              businesses.find(
                (business) =>
                  business.category_id === category.id
              );

            const categoryMedia = categoryBusiness
              ? mediaByBusiness.get(
                  categoryBusiness.business_id
                )
              : null;

            const imageUrl = categoryMedia
              ? getStorageUrl(categoryMedia.storage_path)
              : categoryBusiness
                ? getStorageUrl(categoryBusiness.logo_url)
                : null;

            return (
              <Link
                href={`/categories/${category.slug}`}
                key={category.id}
                className="popular-category-card"
              >
                <div className="popular-category-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={category.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="popular-category-placeholder">
                      {getCategoryIcon(category)}
                    </div>
                  )}
                </div>

                <div className="popular-category-info">
                  <strong>{category.name}</strong>
                  <span>
                    {count} {count === 1 ? "business" : "businesses"}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            href="/categories"
            className="popular-category-card popular-category-more"
          >
            <div className="popular-category-more-icon">•••</div>
            <strong>More</strong>
          </Link>
        </div>
      </section>

      {/* NEARBY */}
      <section className="discover-container discover-section">
        <SectionHeader
          icon="nearby"
          title="Businesses Near You"
          href="/businesses?nearby=true"
        />

        {!loading && nearbyBusinesses.length > 0 ? (
          <div className="business-grid">
            {nearbyBusinesses.map((business) => {
              const mediaItem = mediaByBusiness.get(
                business.business_id
              );

              return (
                <BusinessCard
                  key={`nearby-${business.business_id}`}
                  business={business}
                  coverUrl={
                    mediaItem
                      ? getStorageUrl(mediaItem.storage_path)
                      : null
                  }
                />
              );
            })}
          </div>
        ) : !loading ? (
          <div className="empty-directory-state">
            <Icon name="nearby" size={30} />
            <h3>No nearby businesses found</h3>
            <p>
              Try searching another location or allow location
              access.
            </p>

            <button
              type="button"
              onClick={handleUseLocation}
              className="empty-state-button"
            >
              Find Businesses Near Me
            </button>
          </div>
        ) : null}
      </section>

      {/* BUSINESS CTA */}
      <section className="discover-container">
        <div className="discover-business-cta">
          <div className="discover-business-cta-icon">
            <Icon name="store" size={27} />
          </div>

          <div className="discover-business-cta-copy">
            <strong>Own a Business? Get Discovered Today!</strong>
            <span>
              List your business on IFC BIZGROWTH and reach more
              customers across Africa.
            </span>
          </div>

          <Link
            href="/business/register"
            className="discover-business-cta-button"
          >
            Register Your Business
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </section>

      {/* DESKTOP FOOTER */}
      <footer className="discover-footer">
        <div className="discover-footer-inner">
          <div>
            <strong>IFC BIZGROWTH</strong>
            <span>
              African Business Advertising &amp; Discovery
              Platform
            </span>
          </div>

          <div className="discover-footer-links">
            <Link href="/about">About</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/businesses">Businesses</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <span className="discover-footer-copy">
            © {new Date().getFullYear()} IFC BIZGROWTH
          </span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <nav className="discover-mobile-nav">
        <Link href="/discover" className="mobile-nav-item active">
          <Icon name="home" size={21} />
          <span>Home</span>
        </Link>

        <Link href="/businesses" className="mobile-nav-item">
          <Icon name="search" size={21} />
          <span>Search</span>
        </Link>

        <Link href="/categories" className="mobile-nav-item">
          <Icon name="categories" size={21} />
          <span>Categories</span>
        </Link>

        <button
          type="button"
          className="mobile-nav-item"
          onClick={handleUseLocation}
        >
          <Icon name="nearby" size={21} />
          <span>Nearby</span>
        </button>

        <Link href="/more" className="mobile-nav-item">
          <Icon name="more" size={21} />
          <span>More</span>
        </Link>
      </nav>
    </main>
  );
  }
