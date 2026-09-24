import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./business.css";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Business = {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
  verification_status?: string | null;
  is_public?: boolean | null;
  description?: string | null;
};

type Media = {
  business_id?: string | null;
  url?: string | null;
  image_url?: string | null;
  storage_path?: string | null;
  path?: string | null;
  media_type?: string | null;
  type?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type Location = {
  business_id?: string | null;
  country?: string | null;
  country_name?: string | null;
  state?: string | null;
  state_name?: string | null;
  city?: string | null;
  city_name?: string | null;
  address?: string | null;
  is_primary?: boolean | null;
};

type Category = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

/**
 * Gets the location that belongs to a business.
 */
function getBusinessLocation(
  businessId: string,
  locations: Location[]
): Location | undefined {
  const businessLocations = locations.filter(
    (location) => location.business_id === businessId
  );

  if (!businessLocations.length) {
    return undefined;
  }

  return (
    businessLocations.find(
      (location) => location.is_primary === true
    ) || businessLocations[0]
  );
}

/**
 * Converts the backend location fields into readable text.
 */
function getLocationText(location?: Location) {
  if (!location) {
    return "Location not available";
  }

  const city = location.city_name || location.city;
  const state = location.state_name || location.state;
  const country =
    location.country_name || location.country;

  if (city && state) {
    return `${city}, ${state}`;
  }

  if (city && country) {
    return `${city}, ${country}`;
  }

  if (state && country) {
    return `${state}, ${country}`;
  }

  if (city) {
    return city;
  }

  if (state) {
    return state;
  }

  if (country) {
    return country;
  }

  if (location.address) {
    return location.address;
  }

  return "Location not available";
}

/**
 * Gets a usable image URL from the backend media record.
 */
function getMediaUrl(media?: Media) {
  if (!media) {
    return null;
  }

  return (
    media.url ||
    media.image_url ||
    media.storage_path ||
    media.path ||
    null
  );
}

/**
 * Gets the best media record for a business.
 *
 * Priority:
 * 1. Primary media
 * 2. Logo media
 * 3. First media by sort order
 */
function getBusinessMedia(
  businessId: string,
  media: Media[]
): Media | undefined {
  const businessMedia = media.filter(
    (item) => item.business_id === businessId
  );

  if (!businessMedia.length) {
    return undefined;
  }

  const primaryMedia = businessMedia.find(
    (item) => item.is_primary === true
  );

  if (primaryMedia) {
    return primaryMedia;
  }

  const logoMedia = businessMedia
    .filter(
      (item) =>
        item.media_type?.toLowerCase() === "logo" ||
        item.type?.toLowerCase() === "logo"
    )
    .sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

  if (logoMedia.length) {
    return logoMedia[0];
  }

  return [...businessMedia].sort(
    (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )[0];
}

/**
 * Finds a category from backend category data.
 *
 * This function does NOT contain a hardcoded category list.
 */
function getCategoryByBusiness(
  business: Business,
  categories: Category[]
): Category | undefined {
  /*
   * Your current businesses select does not expose a category_id.
   *
   * Therefore we don't pretend that a category relationship exists.
   * The page can still display all backend categories.
   *
   * When your businesses table has a confirmed category relationship,
   * this function can be connected directly to it.
   */

  void business;
  void categories;

  return undefined;
}

/* =========================================================
   BUSINESS IMAGE
========================================================= */

function BusinessImage({
  media,
  name,
}: {
  media?: Media;
  name: string;
}) {
  const imageUrl = getMediaUrl(media);

  if (!imageUrl) {
    return (
      <div className="business-card-image business-card-image-fallback">
        <span aria-hidden="true">⌂</span>
      </div>
    );
  }

  return (
    <div className="business-card-image">
      <Image
        src={imageUrl}
        alt={`${name} logo`}
        fill
        unoptimized
        sizes="(max-width: 700px) 45vw, 240px"
        className="business-card-logo"
      />
    </div>
  );
}

/* =========================================================
   BUSINESS CARD
========================================================= */

function BusinessCard({
  business,
  media,
  location,
  category,
}: {
  business: Business;
  media?: Media;
  location?: Location;
  category?: Category;
}) {
  const verified =
    business.verification_status === "verified" ||
    business.verification_status === "approved";

  return (
    <article className="business-card">
      <div className="business-card-top">
        <BusinessImage
          media={media}
          name={business.name}
        />

        {verified && (
          <span className="verified-badge">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="business-card-body">
        <h3>{business.name}</h3>

        {category?.name && (
          <p className="business-category">
            {category.name}
          </p>
        )}

        <p className="business-location">
          <span aria-hidden="true">⌖</span>
          {getLocationText(location)}
        </p>

        {business.description && (
          <p className="business-description">
            {business.description}
          </p>
        )}

        <div className="business-card-actions">
          <Link
            href={`/business/${business.slug}`}
            className="view-business-btn"
          >
            View Business
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function BusinessDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    location?: string;
  }>;
}) {
  const params = await searchParams;

  const query = params.q?.trim() || "";
  const selectedLocation =
    params.location?.trim() || "";

  const supabase =
    await createSupabaseServerClient();

  /* =======================================================
     BUSINESSES
  ======================================================= */

  let businessQuery = supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        status,
        verification_status,
        is_public,
        description
      `
    )
    .eq("is_public", true)
    .order("name", {
      ascending: true,
    })
    .limit(100);

  if (query) {
    businessQuery = businessQuery.ilike(
      "name",
      `%${query}%`
    );
  }

  /* =======================================================
     FETCH ALL PUBLIC DATA
  ======================================================= */

  const [
    businessResult,
    categoryResult,
    mediaResult,
    locationResult,
  ] = await Promise.all([
    businessQuery,

    supabase
      .from("business_categories")
      .select(
        `
          id,
          name,
          slug,
          description,
          icon,
          image_url
        `
      )
      .order("name", {
        ascending: true,
      })
      .limit(100),

    supabase
      .from("business_media")
      .select(
        `
          business_id,
          url,
          image_url,
          storage_path,
          path,
          media_type,
          type,
          is_primary,
          sort_order
        `
      )
      .order("sort_order", {
        ascending: true,
      })
      .limit(1000),

    supabase
      .from("business_locations")
      .select(
        `
          business_id,
          country,
          country_name,
          state,
          state_name,
          city,
          city_name,
          address,
          is_primary
        `
      )
      .limit(1000),
  ]);

  /* =======================================================
     ERROR HANDLING
  ======================================================= */

  if (businessResult.error) {
    console.error(
      "Business discovery error:",
      businessResult.error
    );
  }

  if (categoryResult.error) {
    console.error(
      "Categories error:",
      categoryResult.error
    );
  }

  if (mediaResult.error) {
    console.error(
      "Business media error:",
      mediaResult.error
    );
  }

  if (locationResult.error) {
    console.error(
      "Business locations error:",
      locationResult.error
    );
  }

  /* =======================================================
     BACKEND DATA
  ======================================================= */

  const publicBusinesses =
    (businessResult.data || []) as Business[];

  const publicCategories =
    (categoryResult.data || []) as Category[];

  const businessMedia =
    (mediaResult.data || []) as Media[];

  const businessLocations =
    (locationResult.data || []) as Location[];

  /* =======================================================
     LOCATION FILTER
  ======================================================= */

  const filteredBusinesses =
    selectedLocation
      ? publicBusinesses.filter((business) => {
          const location =
            getBusinessLocation(
              business.id,
              businessLocations
            );

          const locationText =
            getLocationText(location).toLowerCase();

          return locationText.includes(
            selectedLocation.toLowerCase()
          );
        })
      : publicBusinesses;

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const featuredBusinesses =
    filteredBusinesses.slice(0, 8);

  const nearbyBusinesses =
    filteredBusinesses.slice(0, 8);

  return (
    <main className="business-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="business-header">
        <div className="business-header-inner">

          <Link
            href="/"
            className="business-brand"
          >
            <div className="brand-mark">
              <span>↗</span>
            </div>

            <div>
              <strong>
                IFC BIZGROWTH
              </strong>

              <small>
                Business Advertising &
                Discovery Platform
              </small>
            </div>
          </Link>

          <div className="business-header-actions">

            <Link
              href="/business/search"
              className="header-search-icon"
              aria-label="Search businesses"
            >
              ⌕
            </Link>

            <Link
              href="/business/locations"
              className="header-location"
            >
              <span>⌖</span>

              {selectedLocation ||
                "Africa"}

              <span className="chevron">
                ⌄
              </span>
            </Link>

            <Link
              href="/login"
              className="header-account"
              aria-label="Account"
            >
              ●
            </Link>

          </div>

        </div>
      </header>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="business-hero">
        <div className="hero-content">

          <div>
            <h1>
              Discover Amazing
              <br />
              Businesses Across Africa
            </h1>

            <p>
              Find trusted businesses near you.
              Support local. Grow together.
            </p>
          </div>

          <div className="hero-slogan">
            <span>
              More Visibility.
            </span>

            <span>
              More Customers.
            </span>

            <span>
              More Growth.
            </span>
          </div>

        </div>
      </section>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <section className="discovery-search-section">

        <form
          action="/business/search"
          method="GET"
          className="discovery-search"
        >

          <div className="search-input-wrapper">
            <span>⌕</span>

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="What business are you looking for?"
            />
          </div>

          <Link
            href="/business/locations"
            className="search-location"
          >
            <span>⌖</span>

            {selectedLocation ||
              "Africa"}

            <span>⌄</span>
          </Link>

          <button type="submit">
            Search
          </button>

        </form>

      </section>

      {/* ===================================================
          CATEGORIES
      =================================================== */}

      <section className="discovery-section categories-section">

        <div className="section-heading">

          <h2>
            Explore Categories
          </h2>

          <Link
            href="/business/categories"
          >
            See All →
          </Link>

        </div>

        <div className="category-scroll">

          <Link
            href="/business/categories"
            className="category-card"
          >
            <div className="category-icon">
              ▦
            </div>

            <span>
              All
            </span>

            <small>
              Categories
            </small>
          </Link>

          {publicCategories
            .slice(0, 7)
            .map((category) => {

              const categoryIcon =
                category.icon ||
                null;

              return (
                <Link
                  key={category.id}
                  href={
                    category.slug
                      ? `/business/category/${category.slug}`
                      : "/business/categories"
                  }
                  className="category-card"
                >

                  <div className="category-icon">

                    {category.image_url ? (
                      <Image
                        src={
                          category.image_url
                        }
                        alt={
                          category.name ||
                          "Category"
                        }
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : categoryIcon ? (
                      <span>
                        {categoryIcon}
                      </span>
                    ) : (
                      <span>
                        ▦
                      </span>
                    )}

                  </div>

                  <span>
                    {category.name ||
                      "Category"}
                  </span>

                </Link>
              );
            })}

        </div>
      </section>

      {/* ===================================================
          FEATURED BUSINESSES
      =================================================== */}

      <section className="discovery-section">

        <div className="section-heading">

          <h2>
            <span className="section-star">
              ☆
            </span>

            Featured Businesses
          </h2>

          <Link
            href="/business/search"
          >
            See All →
          </Link>

        </div>

        {featuredBusinesses.length > 0 ? (

          <div className="business-grid">

            {featuredBusinesses.map(
              (business) => {

                const media =
                  getBusinessMedia(
                    business.id,
                    businessMedia
                  );

                const location =
                  getBusinessLocation(
                    business.id,
                    businessLocations
                  );

                const category =
                  getCategoryByBusiness(
                    business,
                    publicCategories
                  );

                return (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    media={media}
                    location={location}
                    category={category}
                  />
                );
              }
            )}

          </div>

        ) : (

          <div className="empty-discovery">

            <span>⌂</span>

            <h3>
              No businesses found
            </h3>

            <p>
              There are currently no
              public businesses matching
              your search.
            </p>

            {query && (
              <Link href="/business">
                Browse all businesses
              </Link>
            )}

          </div>
        )}

      </section>

      {/* ===================================================
          POPULAR CATEGORIES
      =================================================== */}

      <section className="discovery-section">

        <div className="section-heading">

          <h2>
            <span className="grid-icon">
              ▦
            </span>

            Popular Categories
          </h2>

          <Link
            href="/business/categories"
          >
            View All →
          </Link>

        </div>

        <div className="popular-categories">

          {publicCategories
            .slice(0, 6)
            .map((category) => (

              <Link
                key={category.id}
                href={
                  category.slug
                    ? `/business/category/${category.slug}`
                    : "/business/categories"
                }
                className="popular-category"
              >

                <div className="popular-category-icon">

                  {category.image_url ? (

                    <Image
                      src={
                        category.image_url
                      }
                      alt={
                        category.name ||
                        "Category"
                      }
                      width={48}
                      height={48}
                      unoptimized
                    />

                  ) : (

                    <span>
                      {category.icon ||
                        "▦"}
                    </span>

                  )}

                </div>

                <span>
                  {category.name ||
                    "Category"}
                </span>

              </Link>
            ))}

          <Link
            href="/business/categories"
            className="popular-category more-category"
          >

            <div className="popular-category-icon">
              •••
            </div>

            <span>
              More
            </span>

          </Link>

        </div>
      </section>

      {/* ===================================================
          NEARBY BUSINESSES
      =================================================== */}

      <section className="discovery-section">

        <div className="section-heading">

          <h2>
            <span className="location-heading-icon">
              ⌖
            </span>

            Businesses Near You
          </h2>

          <Link
            href="/business/locations"
          >
            See All →
          </Link>

        </div>

        {nearbyBusinesses.length > 0 ? (

          <div className="business-grid">

            {nearbyBusinesses.map(
              (business) => {

                const media =
                  getBusinessMedia(
                    business.id,
                    businessMedia
                  );

                const location =
                  getBusinessLocation(
                    business.id,
                    businessLocations
                  );

                const category =
                  getCategoryByBusiness(
                    business,
                    publicCategories
                  );

                return (
                  <BusinessCard
                    key={`nearby-${business.id}`}
                    business={business}
                    media={media}
                    location={location}
                    category={category}
                  />
                );
              }
            )}

          </div>

        ) : (

          <div className="empty-discovery">

            <span>⌖</span>

            <h3>
              No businesses available here yet
            </h3>

            <p>
              Businesses will appear here
              as they become publicly listed.
            </p>

          </div>
        )}

      </section>

      {/* ===================================================
          BUSINESS CTA
      =================================================== */}

      <section className="business-owner-cta">

        <div className="owner-icon">
          ⌂
        </div>

        <div>
          <strong>
            Own a Business?
            Get Discovered Today.
          </strong>

          <p>
            List your business on
            IFC BIZGROWTH and reach
            more customers across Africa.
          </p>
        </div>

        <Link href="/signup">
          Register Your Business →
        </Link>

      </section>

      {/* ===================================================
          MOBILE NAV
      =================================================== */}

      <nav className="mobile-business-nav">

        <Link
          href="/business"
          className="active"
        >
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/business/search">
          <span>⌕</span>
          <small>Search</small>
        </Link>

        <Link href="/business/categories">
          <span>▦</span>
          <small>Categories</small>
        </Link>

        <Link href="/business/locations">
          <span>⌖</span>
          <small>Nearby</small>
        </Link>

        <Link href="/business/deals">
          <span>◇</span>
          <small>Deals</small>
        </Link>

        <Link href="/login">
          <span>•••</span>
          <small>More</small>
        </Link>

      </nav>

    </main>
  );
  }
