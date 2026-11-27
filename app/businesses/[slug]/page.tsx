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
const parentUrl = "https://ifcbridgelab.com";


// ============================================
// BUSINESS DATA
// ============================================

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


// ============================================
// SEO HELPERS
// ============================================

// Clean business descriptions before using them
// in metadata and structured data.

function cleanDescription(
  description: string | null | undefined,
): string {
  if (!description) return "";

  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}


// Generate business location text.

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


// Generate absolute URLs for business images.

function getAbsoluteUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;

  try {
    const url = new URL(path, siteUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}


// Normalize external business website URLs.
// Supports URLs entered with or without https://.

function getExternalWebsiteUrl(
  website: string | null | undefined,
): string | undefined {
  if (!website) return undefined;

  const value = website.trim();

  if (!value) return undefined;

  try {
    const normalizedUrl = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    const url = new URL(normalizedUrl);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}


// Generate a clean metadata description.

function getMetadataDescription(
  businessName: string,
  description: string,
  locationText: string,
): string {
  const baseDescription = description
    ? description
    : `Discover ${businessName} on IFC BIZGROWTH. Explore its business information, products, services, and available contact details.`;

  const fullDescription = locationText
    ? `${baseDescription} Location: ${locationText}.`
    : baseDescription;

  return fullDescription.slice(0, 160);
}


// ============================================
// DYNAMIC SEO METADATA
// ============================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getBusiness(slug);

  if (!result) {
    return {
      title: "Business Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { business, location, countryName } = result;

  const locationText = getLocationText(
    location,
    countryName,
  );

  const businessDescription = cleanDescription(
    business.description,
  );

  // Next.js automatically appends the global
  // title template: | IFC BIZGROWTH

  const title = locationText
    ? `${business.name} in ${locationText}`
    : business.name;

  const description = getMetadataDescription(
    business.name,
    businessDescription,
    locationText,
  );

  const canonicalUrl =
    `${siteUrl}/businesses/${encodeURIComponent(business.slug)}`;

  const logoUrl = getAbsoluteUrl(business.logo_url);

  return {
    title,

    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",

      locale: "en_NG",

      title: `${title} | IFC BIZGROWTH`,

      description,

      url: canonicalUrl,

      siteName: "IFC BIZGROWTH",

      images: logoUrl
        ? [
            {
              url: logoUrl,
              alt: `${business.name} business logo`,
            },
          ]
        : undefined,
    },

    twitter: {
      card: logoUrl
        ? "summary_large_image"
        : "summary",

      site: "@ifcbizgrowth",

      title: `${title} | IFC BIZGROWTH`,

      description,

      images: logoUrl ? [logoUrl] : undefined,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}


// ============================================
// BUSINESS PROFILE PAGE
// ============================================

export default async function BusinessPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const result = await getBusiness(slug);

  if (!result) {
    notFound();
  }

  const { business, location, countryName } = result;

  const canonicalUrl =
    `${siteUrl}/businesses/${encodeURIComponent(business.slug)}`;

  const logoUrl = getAbsoluteUrl(business.logo_url);

  const websiteUrl = getExternalWebsiteUrl(
    business.website_url,
  );

  const locationText = getLocationText(
    location,
    countryName,
  );

  const businessDescription = cleanDescription(
    business.description,
  );


  // ==========================================
  // POSTAL ADDRESS STRUCTURED DATA
  // ==========================================

  const address = location
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
    : undefined;


  // ==========================================
  // BUSINESS STRUCTURED DATA
  // ==========================================

  const businessStructuredData = {
    "@context": "https://schema.org",

    "@type": "Organization",

    "@id": `${canonicalUrl}#business`,

    name: business.name,

    description:
      businessDescription || undefined,

    // Only use the actual external business
    // website as its official URL.

    url: websiteUrl,

    // Connect the business entity to its
    // public IFC BIZGROWTH profile.

    mainEntityOfPage: {
      "@id": `${canonicalUrl}#webpage`,
    },

    // Business logo and image.

    logo: logoUrl
      ? {
          "@type": "ImageObject",
          url: logoUrl,
        }
      : undefined,

    image: logoUrl || undefined,

    email:
      business.email || undefined,

    telephone:
      business.phone || undefined,

    address,

  };


  // ==========================================
  // WEBPAGE STRUCTURED DATA
  // ==========================================

  const webpageStructuredData = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${canonicalUrl}#webpage`,

    url: canonicalUrl,

    name: locationText
      ? `${business.name} in ${locationText} | IFC BIZGROWTH`
      : `${business.name} | IFC BIZGROWTH`,

    description:
      getMetadataDescription(
        business.name,
        businessDescription,
        locationText,
      ),

    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },

    about: {
      "@id": `${canonicalUrl}#business`,
    },

    publisher: {
      "@id": `${parentUrl}/#organization`,
    },

    inLanguage: "en-NG",

  };


  // ==========================================
  // COMBINED STRUCTURED DATA
  // ==========================================

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      businessStructuredData,
      webpageStructuredData,
    ],
  };


  return (
    <>

      {/* BUSINESS AND WEBPAGE STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />


      {/* EXISTING BUSINESS PROFILE COMPONENT */}

      <BusinessProfileClient
        initialBusiness={business}
      />

    </>
  );
  }
