import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BusinessProfileClient from "./BusinessProfileClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type LocationSummary = {
  city: string | null;
  state_region: string | null;
  country_code?: string | null;
};

const siteUrl = "https://ifcbizgrowth.africa";

const getBusiness = cache(async (slug: string) => {
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
});

function getLocationText(
  location: LocationSummary | null,
  countryName: string | null,
) {
  return [
    location?.city,
    location?.state_region,
    countryName || location?.country_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function getAbsoluteUrl(path: string | null | undefined) {
  if (!path) return undefined;

  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return undefined;
  }
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
    `Discover ${business.name} on IFC BIZGROWTH. Explore its business information, products, services, and contact details.`;

  const locationText = getLocationText(
    location,
    countryName,
  );

  const title = locationText
    ? `${business.name} | ${locationText} | IFC BIZGROWTH`
    : `${business.name} | IFC BIZGROWTH`;

  const canonicalUrl = `${siteUrl}/businesses/${business.slug}`;
  const logoUrl = getAbsoluteUrl(business.logo_url);

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "IFC BIZGROWTH",
      images: logoUrl
        ? [
            {
              url: logoUrl,
              alt: `${business.name} logo`,
            },
          ]
        : [],
    },

    twitter: {
      card: logoUrl
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: logoUrl ? [logoUrl] : [],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
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

  const { business, location, countryName } = result;

  const canonicalUrl = `${siteUrl}/businesses/${business.slug}`;
  const logoUrl = getAbsoluteUrl(business.logo_url);
  const websiteUrl = getAbsoluteUrl(business.website_url);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${canonicalUrl}#business`,

    name: business.name,
    url: canonicalUrl,

    description: business.description || undefined,

    image: logoUrl,
    logo: logoUrl,

    email: business.email || undefined,
    telephone: business.phone || undefined,

    sameAs: websiteUrl ? [websiteUrl] : undefined,

    address: location
      ? {
          "@type": "PostalAddress",

          streetAddress:
            [
              location.address_line_1 || location.address,
              location.address_line_2,
            ]
              .filter(Boolean)
              .join(", ") || undefined,

          addressLocality:
            location.city || undefined,

          addressRegion:
            location.state_region || undefined,

          postalCode:
            location.postal_code || undefined,

          addressCountry:
            location.country_code ||
            countryName ||
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

      <BusinessProfileClient initialBusiness={business} />
    </>
  );
  }
