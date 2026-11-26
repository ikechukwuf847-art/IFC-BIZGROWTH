import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BusinessProfileClient from "./BusinessProfileClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const SUPABASE_URL =
  "https://iluczxsqdpohzgbknldh.supabase.co";

/**
 * Convert a business logo storage path into a public URL.
 * Already-public URLs are returned unchanged.
 */
function getPublicLogoUrl(
  logoPath: string | null | undefined,
): string | null {
  if (!logoPath?.trim()) {
    return null;
  }

  const value = logoPath.trim();

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const cleanPath = value
    .replace(/^\/+/, "")
    .replace(/^business-logos\//, "");

  return `${SUPABASE_URL}/storage/v1/object/public/business-logos/${cleanPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/**
 * Retrieve only publicly available, active businesses.
 */
async function getBusiness(slug: string) {
  const supabase = await createSupabaseServerClient();

  const { data: business, error } = await supabase
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
      verification_status,
      is_featured,
      is_public,
      status
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (error || !business) {
    return null;
  }

  const { data: location } = await supabase
    .from("business_locations")
    .select(`
      city,
      state_region,
      country_id,
      country_code,
      address,
      address_line_1,
      address_line_2,
      postal_code,
      is_primary
    `)
    .eq("business_id", business.id)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();

  let countryName: string | null = null;

  if (location?.country_id) {
    const { data: country } = await supabase
      .from("countries")
      .select("name")
      .eq("id", location.country_id)
      .maybeSingle();

    countryName = country?.name ?? null;
  }

  return {
    business,
    location,
    countryName,
  };
}

/**
 * Dynamic SEO metadata for each business profile.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBusiness(slug);

  if (!result) {
    return {
      title: "Business Not Found | IFC BIZGROWTH",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { business, location, countryName } = result;

  const logoUrl = getPublicLogoUrl(business.logo_url);

  const description =
    business.description?.trim().slice(0, 155) ||
    `Discover ${business.name} on IFC BIZGROWTH. Explore its business information and contact details.`;

  const locationText = [
    location?.city,
    location?.state_region,
    countryName,
  ]
    .filter(Boolean)
    .join(", ");

  const title = locationText
    ? `${business.name} | ${locationText} | IFC BIZGROWTH`
    : `${business.name} | IFC BIZGROWTH`;

  const profilePath = `/businesses/${business.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: profilePath,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: profilePath,
      siteName: "IFC BIZGROWTH",

      ...(logoUrl
        ? {
            images: [
              {
                url: logoUrl,
                alt: `${business.name} logo`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: logoUrl
        ? "summary_large_image"
        : "summary",
      title,
      description,

      ...(logoUrl
        ? {
            images: [
              {
                url: logoUrl,
                alt: `${business.name} logo`,
              },
            ],
          }
        : {}),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Business profile page.
 */
export default async function BusinessPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const result = await getBusiness(slug);

  if (!result) {
    notFound();
  }

  const { business, location, countryName } = result;

  const logoUrl = getPublicLogoUrl(business.logo_url);

  const locationText = [
    location?.city,
    location?.state_region,
    countryName,
  ]
    .filter(Boolean)
    .join(", ");

  /**
   * Structured data describing the business.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: business.name,

    description:
      business.description || undefined,

    url: `/businesses/${business.slug}`,

    logo: logoUrl || undefined,

    email: business.email || undefined,

    telephone: business.phone || undefined,

    address: location
      ? {
          "@type": "PostalAddress",

          streetAddress:
            location.address_line_1 ||
            location.address ||
            undefined,

          addressLocality:
            location.city || undefined,

          addressRegion:
            location.state_region || undefined,

          postalCode:
            location.postal_code || undefined,

          addressCountry:
            countryName ||
            location.country_code ||
            business.country_code ||
            undefined,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <main>
        <section
          className="bp-seo-intro"
          aria-label={`${business.name} business information`}
        >
          <h1>{business.name}</h1>

          {locationText && (
            <p>{locationText}</p>
          )}

          {business.description && (
            <p>{business.description}</p>
          )}
        </section>

        <BusinessProfileClient />
      </main>
    </>
  );
  }
