import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BusinessProfileClient from "./BusinessProfileClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

function getLocationText(
  location: {
    city?: string | null;
    state_region?: string | null;
  } | null,
  countryName: string | null,
) {
  return [
    location?.city,
    location?.state_region,
    countryName,
  ]
    .filter(Boolean)
    .join(", ");
}

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

  const description =
    business.description?.trim().slice(0, 155) ||
    `Discover ${business.name} on IFC BIZGROWTH. Explore its business information and contact details.`;

  const locationText = getLocationText(
    location,
    countryName,
  );

  const title = locationText
    ? `${business.name} | ${locationText} | IFC BIZGROWTH`
    : `${business.name} | IFC BIZGROWTH`;

  const canonicalPath = `/businesses/${business.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      siteName: "IFC BIZGROWTH",
      images: business.logo_url
        ? [{ url: business.logo_url }]
        : [],
    },

    twitter: {
      card: business.logo_url
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: business.logo_url
        ? [business.logo_url]
        : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BusinessPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const result = await getBusiness(slug);

  if (!result) {
    notFound();
  }

  const {
    business,
    location,
    countryName,
  } = result;

  const locationText = getLocationText(
    location,
    countryName,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.name,
    description: business.description || undefined,
    url: `/businesses/${business.slug}`,
    logo: business.logo_url || undefined,
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
            undefined,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData,
          ).replace(/</g, "\\u003c"),
        }}
      />

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

      {/* Pass server-fetched business data to the client component. */}
      <BusinessProfileClient
        initialBusiness={business}
      />
    </>
  );
        }
