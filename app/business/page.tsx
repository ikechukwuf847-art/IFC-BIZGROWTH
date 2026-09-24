import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./business.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_code: string;
  status: string;
  verification_status: string;
  is_featured: boolean;
  is_public: boolean;
};

type Location = {
  id: string;
  business_id: string;
  city: string;
  state_region: string | null;
  address: string | null;
  country_code: string | null;
  is_primary: boolean;
  is_active: boolean;
  is_public: boolean;
};

type Category = {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
  image_url?: string | null;
};

type BusinessMedia = {
  id: string;
  business_id: string;
  url?: string | null;
  storage_path?: string | null;
  media_type?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

/* -------------------------------------------------------
   BUSINESS INITIALS
------------------------------------------------------- */

function getBusinessInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
}

/* -------------------------------------------------------
   LOCATION
------------------------------------------------------- */

function getBusinessLocation(
  businessId: string,
  locations: Location[]
) {
  const matches = locations.filter(
    (location) =>
      location.business_id === businessId &&
      location.is_active &&
      location.is_public
  );

  return (
    matches.find((location) => location.is_primary) ||
    matches[0] ||
    null
  );
}

/* -------------------------------------------------------
   LOCATION TEXT
------------------------------------------------------- */

function getLocationText(location: Location | null) {
  if (!location) return null;

  const parts = [
    location.city,
    location.state_region,
  ].filter(Boolean);

  return parts.join(", ");
}

/* -------------------------------------------------------
   REAL BUSINESS IMAGE
------------------------------------------------------- */

function getBusinessImage(
  business: Business,
  media: BusinessMedia[]
) {
  if (business.logo_url) {
    return business.logo_url;
  }

  const businessMedia = media
    .filter(
      (item) =>
        item.business_id === business.id &&
        item.url &&
        item.media_type?.toLowerCase() !== "video"
    )
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;

      return (
        (a.sort_order ?? 0) -
        (b.sort_order ?? 0)
      );
    });

  return (
    businessMedia[0]?.url ||
    businessMedia[0]?.storage_path ||
    null
  );
}

/* -------------------------------------------------------
   BUSINESS LOGO
------------------------------------------------------- */

function BusinessLogo({
  business,
  media,
}: {
  business: Business;
  media: BusinessMedia[];
}) {
  const image = getBusinessImage(
    business,
    media
  );

  if (image) {
    return (
      <div className="business-logo business-logo-image">
        <Image
          src={image}
          alt={`${business.name} logo`}
          width={120}
          height={120}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="business-logo business-logo-initials"
      aria-label={`${business.name} logo`}
    >
      {getBusinessInitials(business.name)}
    </div>
  );
}

/* -------------------------------------------------------
   VERIFIED
------------------------------------------------------- */

function isVerified(status: string) {
  const value = status.toLowerCase();

  return (
    value === "verified" ||
    value === "approved" ||
    value === "fully_verified"
  );
}

/* -------------------------------------------------------
   BUSINESS CARD
------------------------------------------------------- */

function BusinessCard({
  business,
  locations,
  media,
}: {
  business: Business;
  locations: Location[];
  media: BusinessMedia[];
}) {
  const location = getBusinessLocation(
    business.id,
    locations
  );

  const locationText =
    getLocationText(location);

  const verified = isVerified(
    business.verification_status
  );

  return (
    <Link
      href={`/business/${business.slug}`}
      className="business-card"
    >
      <div className="business-card-top">
        <BusinessLogo
          business={business}
          media={media}
        />

        <div className="business-card-main">
          <div className="business-name-row">
            <h3>{business.name}</h3>

            {verified && (
              <span
                className="verified-badge"
                aria-label="Verified business"
              >
                ✓
              </span>
            )}
          </div>

          {locationText && (
            <div className="business-location">
              <span className="location-icon">
                ⌖
              </span>

              <span>{locationText}</span>
            </div>
          )}

          {business.description && (
            <p className="business-description">
              {business.description}
            </p>
          )}
        </div>

        <span className="business-arrow">
          ›
        </span>
      </div>

      <div className="business-card-bottom">
        {business.is_featured && (
          <span className="featured-label">
            Featured
          </span>
        )}

        <span className="view-business">
          View business
        </span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------
   CATEGORY
------------------------------------------------------- */

function CategoryCard({
  category,
}: {
  category: Category;
}) {
  const slug =
    category.slug ||
    category.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

  return (
    <Link
      href={`/business?category=${encodeURIComponent(
        slug
      )}`}
      className="category-card"
    >
      <div className="category-icon">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            width={42}
            height={42}
            unoptimized
          />
        ) : category.icon ? (
          <span>{category.icon}</span>
        ) : (
          <span>
            {getBusinessInitials(category.name)}
          </span>
        )}
      </div>

      <span className="category-name">
        {category.name}
      </span>
    </Link>
  );
}

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    location?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;

  const search =
    params.search?.trim() || "";

  const locationSearch =
    params.location?.trim().toLowerCase() || "";

  const categorySearch =
    params.category?.trim().toLowerCase() || "";

  const supabase =
    await createSupabaseServerClient();

  /* -----------------------------------------------------
     BUSINESSES
  ----------------------------------------------------- */

  let businessesQuery = supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      description,
      email,
      phone,
      website_url,
      logo_url,
      country_code,
      status,
      verification_status,
      is_featured,
      is_public
    `)
    .eq("is_public", true)
    .order("is_featured", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (search) {
    businessesQuery =
      businessesQuery.ilike(
        "name",
        `%${search}%`
      );
  }

  const {
    data: businessesData,
    error: businessesError,
  } = await businessesQuery;

  if (businessesError) {
    console.error(
      "Business query error:",
      businessesError
    );
  }

  const businesses =
    (businessesData || []) as Business[];

  /* -----------------------------------------------------
     LOCATIONS
  ----------------------------------------------------- */

  const {
    data: locationsData,
    error: locationsError,
  } = await supabase
    .from("business_locations")
    .select(`
      id,
      business_id,
      city,
      state_region,
      address,
      country_code,
      is_primary,
      is_active,
      is_public
    `)
    .eq("is_active", true)
    .eq("is_public", true);

  if (locationsError) {
    console.error(
      "Location query error:",
      locationsError
    );
  }

  const locations =
    (locationsData || []) as Location[];

  /* -----------------------------------------------------
     MEDIA
  ----------------------------------------------------- */

  const {
    data: mediaData,
    error: mediaError,
  } = await supabase
    .from("business_media")
    .select("*");

  if (mediaError) {
    console.error(
      "Media query error:",
      mediaError
    );
  }

  const media =
    (mediaData || []) as BusinessMedia[];

  /* -----------------------------------------------------
     CATEGORIES
  ----------------------------------------------------- */

  const {
    data: categoriesData,
    error: categoriesError,
  } = await supabase
    .from("business_categories")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (categoriesError) {
    console.error(
      "Category query error:",
      categoriesError
    );
  }

  const categories =
    (categoriesData || []) as Category[];

  /* -----------------------------------------------------
     LOCATION FILTER
  ----------------------------------------------------- */

  let filteredBusinesses = businesses;

  if (locationSearch) {
    const matchingIds = new Set(
      locations
        .filter((location) => {
          const city =
            location.city?.toLowerCase() || "";

          const state =
            location.state_region?.toLowerCase() ||
            "";

          const country =
            location.country_code?.toLowerCase() ||
            "";

          return (
            city.includes(locationSearch) ||
            state.includes(locationSearch) ||
            country.includes(locationSearch)
          );
        })
        .map(
          (location) =>
            location.business_id
        )
    );

    filteredBusinesses =
      filteredBusinesses.filter((business) =>
        matchingIds.has(business.id)
      );
  }

  /*
   * Category filtering is intentionally not guessed.
   * Your current businesses schema does not expose
   * a category_id column.
   */
  if (categorySearch) {
    const categoryExists =
      categories.some(
        (category) =>
          category.slug?.toLowerCase() ===
            categorySearch ||
          category.name?.toLowerCase() ===
            categorySearch
      );

    if (!categoryExists) {
      filteredBusinesses = [];
    }
  }

  const featuredBusinesses =
    filteredBusinesses.filter(
      (business) => business.is_featured
    );

  return (
    <main className="business-directory">
      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <header className="business-header">
        <div className="business-header-inner">
          <Link
            href="/"
            className="business-brand"
          >
            <span className="business-brand-mark">
              IFC
            </span>

            <span className="business-brand-name">
              BIZGROWTH
            </span>
          </Link>

          <Link
            href="/business/register"
            className="business-header-action"
          >
            List business
          </Link>
        </div>
      </header>

      {/* =================================================
          SEARCH AREA
      ================================================= */}

      <section className="business-search-section">
        <div className="business-search-inner">
          <div className="business-search-heading">
            <span>Discover</span>

            <h1>
              Businesses around you
            </h1>
          </div>

          <form
            action="/business"
            method="GET"
            className="business-search-form"
          >
            <div className="search-input">
              <span>⌕</span>

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search businesses"
              />
            </div>

            <div className="search-input">
              <span>⌖</span>

              <input
                type="text"
                name="location"
                defaultValue={
                  params.location || ""
                }
                placeholder="City or location"
              />
            </div>

            <button type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      {categories.length > 0 && (
        <section className="categories-section">
          <div className="section-header">
            <div>
              <span>Explore</span>
              <h2>Categories</h2>
            </div>
          </div>

          <div className="categories-scroll">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          FEATURED
      ================================================= */}

      {featuredBusinesses.length > 0 && (
        <section className="businesses-section">
          <div className="section-header">
            <div>
              <span>Recommended</span>
              <h2>Featured businesses</h2>
            </div>

            <Link href="/business">
              View all
            </Link>
          </div>

          <div className="business-list">
            {featuredBusinesses.map(
              (business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  locations={locations}
                  media={media}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* =================================================
          ALL BUSINESSES
      ================================================= */}

      <section className="businesses-section">
        <div className="section-header">
          <div>
            <span>Directory</span>

            <h2>
              {search
                ? `Results for "${search}"`
                : "All businesses"}
            </h2>
          </div>

          <span className="business-count">
            {filteredBusinesses.length}
          </span>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="business-list">
            {filteredBusinesses.map(
              (business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  locations={locations}
                  media={media}
                />
              )
            )}
          </div>
        ) : (
          <div className="empty-businesses">
            <div className="empty-icon">
              ⌕
            </div>

            <h3>No businesses found</h3>

            <p>
              Try another business name or
              location.
            </p>

            <Link href="/business">
              Clear search
            </Link>
          </div>
        )}
      </section>
    </main>
  );
   }
