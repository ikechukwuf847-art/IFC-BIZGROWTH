import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./business.css";

export const dynamic = "force-dynamic";

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

const categoryIcons: Record<string, string> = {
  furniture: "🛋️",
  restaurants: "🍴",
  restaurant: "🍴",
  hotels: "🛏️",
  hotel: "🛏️",
  "fashion-beauty": "👗",
  fashion: "👗",
  beauty: "💇",
  salons: "✂️",
  salon: "✂️",
  healthcare: "⚕️",
  health: "⚕️",
  logistics: "🚚",
  automotive: "🚗",
  education: "🎓",
  construction: "🏗️",
  technology: "💻",
  real-estate: "🏠",
  default: "▦",
};

function getCategoryIcon(category: Category) {
  const slug = category.slug?.toLowerCase();

  if (slug && categoryIcons[slug]) {
    return categoryIcons[slug];
  }

  const name = category.name?.toLowerCase();

  if (name) {
    const found = Object.keys(categoryIcons).find((key) =>
      name.includes(key.replace("-", " "))
    );

    if (found) return categoryIcons[found];
  }

  return categoryIcons.default;
}

function getLocationText(location?: Location) {
  if (!location) return "Location not available";

  const city = location.city_name || location.city;
  const state = location.state_name || location.state;

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;

  return location.country_name || location.country || "Location not available";
}

function getMediaUrl(media?: Media) {
  if (!media) return null;

  return (
    media.url ||
    media.image_url ||
    media.storage_path ||
    media.path ||
    null
  );
}

function BusinessImage({
  media,
  name,
}: {
  media?: Media;
  name: string;
}) {
  const url = getMediaUrl(media);

  if (!url) {
    return (
      <div className="business-card-image business-card-image-fallback">
        <span className="fallback-building">⌂</span>
      </div>
    );
  }

  return (
    <div className="business-card-image">
      <Image
        src={url}
        alt={`${name} logo`}
        fill
        sizes="(max-width: 700px) 45vw, 240px"
        className="business-card-logo"
      />
    </div>
  );
}

function getBusinessMedia(
  businessId: string,
  media: Media[]
): Media | undefined {
  const businessMedia = media.filter(
    (item) => item.business_id === businessId
  );

  if (!businessMedia.length) return undefined;

  return (
    businessMedia.find((item) => item.is_primary === true) ||
    businessMedia
      .filter(
        (item) =>
          item.media_type === "logo" ||
          item.type === "logo"
      )
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] ||
    businessMedia.sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )[0]
  );
}

function getBusinessLocation(
  businessId: string,
  locations: Location[]
): Location | undefined {
  const businessLocations = locations.filter(
    (item) => item.business_id === businessId
  );

  return (
    businessLocations.find((item) => item.is_primary === true) ||
    businessLocations[0]
  );
}

function BusinessCard({
  business,
  media,
  location,
}: {
  business: Business;
  media?: Media;
  location?: Location;
}) {
  const verified =
    business.verification_status === "verified" ||
    business.verification_status === "approved";

  return (
    <article className="business-card">
      <div className="business-card-top">
        <BusinessImage media={media} name={business.name} />

        {verified && (
          <span className="verified-badge">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="business-card-body">
        <h3>{business.name}</h3>

        <p className="business-category">
          Business
        </p>

        <p className="business-location">
          <span>⌖</span>
          {getLocationText(location)}
        </p>

        <div className="business-card-actions">
          <Link
            href={`/business/${business.slug}`}
            className="view-business-btn"
          >
            View Business
          </Link>

          <button
            type="button"
            className="icon-action"
            aria-label={`Call ${business.name}`}
          >
            ☎
          </button>

          <button
            type="button"
            className="icon-action whatsapp"
            aria-label={`WhatsApp ${business.name}`}
          >
            ◉
          </button>
        </div>
      </div>
    </article>
  );
}

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
  const selectedLocation = params.location?.trim() || "";

  const supabase = await createSupabaseServerClient();

  /*
   * PUBLIC BUSINESSES
   *
   * Only businesses that are explicitly public are displayed.
   */
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
    .order("name", { ascending: true })
    .limit(100);

  if (query) {
    businessQuery = businessQuery.ilike("name", `%${query}%`);
  }

  const [
    { data: businesses, error: businessesError },
    { data: categories, error: categoriesError },
    { data: media, error: mediaError },
    { data: locations, error: locationsError },
  ] = await Promise.all([
    businessQuery,

    supabase
      .from("business_categories")
      .select("*")
      .order("name", { ascending: true })
      .limit(20),

    supabase
      .from("business_media")
      .select("*")
      .limit(500),

    supabase
      .from("business_locations")
      .select("*")
      .limit(500),
  ]);

  if (businessesError) {
    console.error("Business discovery error:", businessesError);
  }

  if (categoriesError) {
    console.error("Categories error:", categoriesError);
  }

  if (mediaError) {
    console.error("Business media error:", mediaError);
  }

  if (locationsError) {
    console.error("Business locations error:", locationsError);
  }

  const publicBusinesses = (businesses || []) as Business[];
  const publicCategories = (categories || []) as Category[];
  const businessMedia = (media || []) as Media[];
  const businessLocations = (locations || []) as Location[];

  /*
   * Optional location filtering.
   *
   * This deliberately happens after fetching because the exact location
   * column structure can differ depending on the location record.
   */
  const filteredBusinesses = selectedLocation
    ? publicBusinesses.filter((business) => {
        const location = getBusinessLocation(
          business.id,
          businessLocations
        );

        const locationText = getLocationText(location).toLowerCase();

        return locationText.includes(selectedLocation.toLowerCase());
      })
    : publicBusinesses;

  const featuredBusinesses = filteredBusinesses.slice(0, 8);
  const nearbyBusinesses = filteredBusinesses.slice(0, 8);

  return (
    <main className="business-page">

      {/* HEADER */}
      <header className="business-header">
        <div className="business-header-inner">

          <Link href="/" className="business-brand">
            <div className="brand-mark">
              <span>↗</span>
            </div>

            <div>
              <strong>IFC BIZGROWTH</strong>
              <small>
                Business Advertising & Discovery Platform
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
              {selectedLocation || "Africa"}
              <span className="chevron">⌄</span>
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

      {/* HERO */}
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
            <span>More Visibility.</span>
            <span>More Customers.</span>
            <span>More Growth.</span>
          </div>

        </div>
      </section>

      {/* SEARCH */}
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
            {selectedLocation || "Africa"}
            <span>⌄</span>
          </Link>

          <button type="submit">
            Search
          </button>
        </form>
      </section>

      {/* CATEGORIES */}
      <section className="discovery-section categories-section">

        <div className="section-heading">
          <h2>Explore Categories</h2>

          <Link href="/business/categories">
            See All →
          </Link>
        </div>

        <div className="category-scroll">

          <Link
            href="/business/categories"
            className="category-card"
          >
            <div className="category-icon">▦</div>
            <span>All</span>
            <small>Categories</small>
          </Link>

          {publicCategories.slice(0, 7).map((category) => (
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
                {getCategoryIcon(category)}
              </div>

              <span>
                {category.name || "Category"}
              </span>
            </Link>
          ))}

        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section className="discovery-section">

        <div className="section-heading">
          <h2>
            <span className="section-star">☆</span>
            Featured Businesses
          </h2>

          <Link href="/business/search">
            See All →
          </Link>
        </div>

        {featuredBusinesses.length > 0 ? (
          <div className="business-grid">
            {featuredBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                media={getBusinessMedia(
                  business.id,
                  businessMedia
                )}
                location={getBusinessLocation(
                  business.id,
                  businessLocations
                )}
              />
            ))}
          </div>
        ) : (
          <div className="empty-discovery">
            <span>⌂</span>
            <h3>No businesses found</h3>
            <p>
              There are currently no public businesses matching
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

      {/* POPULAR CATEGORIES */}
      <section className="discovery-section">

        <div className="section-heading">
          <h2>
            <span className="grid-icon">▦</span>
            Popular Categories
          </h2>

          <Link href="/business/categories">
            View All →
          </Link>
        </div>

        <div className="popular-categories">

          {publicCategories.slice(0, 6).map((category) => (
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
                {getCategoryIcon(category)}
              </div>

              <span>
                {category.name || "Category"}
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

            <span>More</span>
          </Link>

        </div>
      </section>

      {/* NEARBY */}
      <section className="discovery-section">

        <div className="section-heading">
          <h2>
            <span className="location-heading-icon">⌖</span>
            Businesses Near You
          </h2>

          <Link href="/business/locations">
            See All →
          </Link>
        </div>

        {nearbyBusinesses.length > 0 ? (
          <div className="business-grid">
            {nearbyBusinesses.map((business) => (
              <BusinessCard
                key={`nearby-${business.id}`}
                business={business}
                media={getBusinessMedia(
                  business.id,
                  businessMedia
                )}
                location={getBusinessLocation(
                  business.id,
                  businessLocations
                )}
              />
            ))}
          </div>
        ) : (
          <div className="empty-discovery">
            <span>⌖</span>
            <h3>No businesses available here yet</h3>
            <p>
              Businesses will appear here as they become
              publicly listed.
            </p>
          </div>
        )}

      </section>

      {/* BUSINESS CTA */}
      <section className="business-owner-cta">

        <div className="owner-icon">
          ⌂
        </div>

        <div>
          <strong>
            Own a Business? Get Discovered Today.
          </strong>

          <p>
            List your business on IFC BIZGROWTH and reach
            more customers across Africa.
          </p>
        </div>

        <Link href="/signup">
          Register Your Business →
        </Link>

      </section>

      {/* MOBILE NAV */}
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
