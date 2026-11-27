import type { Metadata } from "next";
import BusinessesDirectoryClient from "./BusinessesDirectoryClient";

const SITE_URL = "https://ifcbizgrowth.africa";

export const metadata: Metadata = {
  title: "Discover Businesses Across Africa",
  description:
    "Explore IFC BIZGROWTH's African business directory. Discover businesses, brands, products and services across Africa. Search by category, country and city, and connect with businesses.",

  alternates: {
    canonical: `${SITE_URL}/businesses`,
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: `${SITE_URL}/businesses`,
    siteName: "IFC BIZGROWTH",
    title: "Discover Businesses Across Africa | IFC BIZGROWTH",
    description:
      "Find and discover African businesses, brands, products and services. Explore businesses by category, country and city.",
  },

  twitter: {
    card: "summary_large_image",
    site: "@ifcbizgrowth",
    title: "Discover Businesses Across Africa | IFC BIZGROWTH",
    description:
      "Explore African businesses, brands, products and services with IFC BIZGROWTH.",
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

export default function BusinessesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/businesses#webpage`,
    url: `${SITE_URL}/businesses`,
    name: "Discover Businesses Across Africa",
    description:
      "Explore African businesses, brands, products and services through the IFC BIZGROWTH business directory.",
    inLanguage: "en-NG",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${SITE_URL}/#brand`,
    },

    publisher: {
      "@id": "https://ifcbridgelab.com/#organization",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <BusinessesDirectoryClient />
    </>
  );
}
