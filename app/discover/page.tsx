import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DiscoverClient from "./discover-client";
import LocationLabel from "./location-label";
import styles from "./discover.module.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country_code: string;
  verification_status: string;
  is_featured: boolean;
  city: string | null;
  state_region: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export default async function DiscoverPage() {
  const supabase =
    await createSupabaseServerClient();

  const [
    featuredResult,
    businessesResult,
    categoriesResult,
  ] = await Promise.all([
    supabase
      .from("public_business_directory")
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        country_code,
        verification_status,
        is_featured,
        city,
        state_region,
        latitude,
        longitude
      `)
      .eq("is_featured", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(12),

    supabase
      .from("public_business_directory")
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        country_code,
        verification_status,
        is_featured,
        city,
        state_region,
        latitude,
        longitude
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(30),

    supabase
      .from("business_categories")
      .select(
        "id, name, slug, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .limit(20),
  ]);

  if (featuredResult.error) {
    console.error(
      "Discover featured businesses error:",
      featuredResult.error
    );
  }

  if (businessesResult.error) {
    console.error(
      "Discover businesses error:",
      businessesResult.error
    );
  }

  if (categoriesResult.error) {
    console.error(
      "Discover categories error:",
      categoriesResult.error
    );
  }

  const featuredBusinesses =
    (featuredResult.data ?? []) as Business[];

  const businesses =
    (businessesResult.data ?? []) as Business[];

  const categories =
    (categoriesResult.data ?? []) as Category[];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/discover"
          className={styles.logo}
        >
          <span className={styles.logoIcon}>
            ↗
          </span>

          <span>
            <strong>IFC BIZGROWTH</strong>

            <small>
              Business Advisory & Discovery Platform
            </small>
          </span>
        </Link>

        <nav className={styles.desktopNav}>
          <Link href="/businesses">
            Businesses
          </Link>

          <Link href="/categories">
            Categories
          </Link>

          <Link href="/locations">
            Locations
          </Link>

          <Link href="/promotions">
            Deals
          </Link>
        </nav>

        <div className={styles.headerActions}>
          <Link
            href="/businesses"
            className={styles.searchIcon}
            aria-label="Search businesses"
          >
            ⌕
          </Link>

          <Link
            href="/locations"
            className={styles.locationButton}
          >
            <span>●</span>

            <LocationLabel />

            <span>⌄</span>
          </Link>

          <Link
            href="/login"
            className={styles.accountButton}
            aria-label="Account"
          >
            ●
          </Link>
        </div>
      </header>

      <section className={styles.searchArea}>
        <div className={styles.searchRow}>
          <form
            action="/businesses"
            method="GET"
            className={styles.searchForm}
          >
            <span
              className={
                styles.searchFormIcon
              }
            >
              ⌕
            </span>

            <input
              type="search"
              name="q"
              placeholder="What business are you looking for?"
              aria-label="Search businesses"
            />

            <button type="submit">
              Search
            </button>
          </form>

          <Link
            href="/locations"
            className={
              styles.mobileLocation
            }
          >
            <span>●</span>

            <LocationLabel />

            <span>⌄</span>
          </Link>
        </div>
      </section>

      <section
        className={
          styles.categoryShortcuts
        }
      >
        <Link
          href="/categories"
          className={
            styles.categoryShortcut
          }
        >
          <span
            className={
              styles.categoryShortcutIcon
            }
          >
            ▦
          </span>

          <span>All</span>

          <span>Categories</span>
        </Link>

        {categories
          .slice(0, 5)
          .map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={
                styles.categoryShortcut
              }
            >
              <span
                className={
                  styles.categoryShortcutIcon
                }
              >
                {getCategoryIcon(
                  category.slug
                )}
              </span>

              <span>
                {getShortCategoryName(
                  category.name
                )}
              </span>
            </Link>
          ))}

        <Link
          href="/categories"
          className={
            styles.categoryShortcut
          }
        >
          <span
            className={
              styles.categoryShortcutIcon
            }
          >
            ⋯
          </span>

          <span>See All</span>
        </Link>
      </section>

      {featuredBusinesses.length > 0 && (
        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <h2>
              <span>★</span>
              Featured Businesses
            </h2>

            <Link href="/featured-businesses">
              See All <span>›</span>
            </Link>
          </div>

          <div
            className={
              styles.businessScroller
            }
          >
            {featuredBusinesses.map(
              (business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  featured
                />
              )
            )}
          </div>
        </section>
      )}

      <section
        className={styles.section}
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <h2>
            <span>▦</span>
            Popular Categories
          </h2>

          <Link href="/categories">
            View All <span>›</span>
          </Link>
        </div>

        <div
          className={
            styles.popularCategories
          }
        >
          {categories
            .slice(0, 5)
            .map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={
                  styles.popularCategory
                }
              >
                <div
                  className={
                    styles.popularCategoryImage
                  }
                >
                  <span>
                    {getCategoryIcon(
                      category.slug
                    )}
                  </span>
                </div>

                <span>
                  {getShortCategoryName(
                    category.name
                  )}
                </span>
              </Link>
            ))}

          <Link
            href="/categories"
            className={`${styles.popularCategory} ${styles.moreCategory}`}
          >
            <div
              className={
                styles.popularCategoryImage
              }
            >
              <span>•••</span>
            </div>

            <span>More</span>
          </Link>
        </div>
      </section>

      <DiscoverClient
        businesses={businesses}
      />

      <section
        className={styles.ownerCta}
      >
        <div className={styles.ownerIcon}>
          ▣
        </div>

        <div className={styles.ownerText}>
          <strong>
            Own a Business? Get Discovered Today.
          </strong>

          <span>
            List your business on IFC BIZGROWTH
            and reach more customers across Africa.
          </span>
        </div>

        <Link
          href="/business/create"
          className={styles.ownerButton}
        >
          Register Your Business
          <span>→</span>
        </Link>
      </section>

      <div
        className={
          styles.mobileBottomSpace
        }
      />

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <Link
          href="/discover"
          className={
            styles.activeNav
          }
        >
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/businesses">
          <span>⌕</span>
          <small>Search</small>
        </Link>

        <Link href="/categories">
          <span>▦</span>
          <small>Categories</small>
        </Link>

        <Link href="/near-me">
          <span>⌖</span>
          <small>Nearby</small>
        </Link>

        <Link href="/promotions">
          <span>◇</span>
          <small>Deals</small>
        </Link>

        <Link href="/more">
          <span>•••</span>
          <small>More</small>
        </Link>
      </nav>
    </main>
  );
}

function BusinessCard({
  business,
  featured = false,
}: {
  business: Business;
  featured?: boolean;
}) {
  const location = [
    business.city,
    business.state_region,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`${styles.businessCard} ${
        featured
          ? styles.featuredCard
          : ""
      }`}
    >
      <div
        className={
          styles.businessImage
        }
      >
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={`${business.name} logo`}
          />
        ) : (
          <span>
            {getInitials(
              business.name
            )}
          </span>
        )}

        {business.verification_status ===
          "approved" && (
          <span
            className={
              styles.verifiedBadge
            }
          >
            ✓ Verified
          </span>
        )}
      </div>

      <div
        className={
          styles.businessContent
        }
      >
        <h3>{business.name}</h3>

        <p
          className={
            styles.businessDescription
          }
        >
          {business.description ||
            "Business information available on IFC BIZGROWTH."}
        </p>

        <p
          className={
            styles.businessLocation
          }
        >
          <span>●</span>

          {location ||
            business.country_code}
        </p>

        <div
          className={
            styles.cardActions
          }
        >
          <Link
            href={`/businesses/${business.slug}`}
            className={
              styles.viewButton
            }
          >
            View Business
          </Link>

          <Link
            href={`/businesses/${business.slug}`}
            className={
              styles.cardIconButton
            }
            aria-label="Business contact"
          >
            ⌕
          </Link>
        </div>
      </div>
    </article>
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "B";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

function getShortCategoryName(
  name: string
) {
  const names: Record<
    string,
    string
  > = {
    "Food & Restaurants":
      "Restaurants",

    "Fashion & Beauty":
      "Fashion & Beauty",

    "Furniture & Interior":
      "Furniture",

    "Real Estate":
      "Real Estate",

    "Construction & Engineering":
      "Construction",

    Education:
      "Education",

    "Health & Wellness":
      "Health",

    Technology:
      "Technology",

    "Professional Services":
      "Services",

    "Retail & Shopping":
      "Retail",

    Automotive:
      "Automotive",

    Agriculture:
      "Agriculture",

    "Finance & Business":
      "Finance",

    "Hospitality & Travel":
      "Hotels",

    "Media & Entertainment":
      "Media",

    "Events & Recreation":
      "Events",

    "Logistics & Transportation":
      "Logistics",

    Manufacturing:
      "Manufacturing",

    "Home & Building":
      "Home",

    Other:
      "Other",
  };

  return names[name] || name;
}

function getCategoryIcon(
  slug: string
) {
  const icons: Record<
    string,
    string
  > = {
    "food-restaurants": "🍴",
    "fashion-beauty": "♧",
    "furniture-interior": "▰",
    "real-estate": "⌂",
    "construction-engineering":
      "▱",
    education: "▤",
    "health-wellness": "✚",
    technology: "⌘",
    "professional-services":
      "▣",
    "retail-shopping": "◇",
    automotive: "▰",
    agriculture: "♧",
    "finance-business": "₦",
    "hospitality-travel": "⌂",
    "media-entertainment": "▶",
    "events-recreation": "☆",
    "logistics-transportation":
      "▰",
    manufacturing: "⚙",
    "home-building": "⌂",
    other: "•••",
  };

  return icons[slug] || "▦";
  }
