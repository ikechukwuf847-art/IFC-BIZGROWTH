import type { Metadata } from "next";
import CategoriesDirectoryClient from "./CategoriesDirectoryClient";

const SITE_URL = "https://ifcbizgrowth.africa";

export const metadata: Metadata = {
  title: "Explore Business Categories Across Africa",
  description:
    "Explore business categories on IFC BIZGROWTH. Discover African businesses, products and services across different industries, and find businesses by category.",

  alternates: {
    canonical: `${SITE_URL}/categories`,
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: `${SITE_URL}/categories`,
    siteName: "IFC BIZGROWTH",
    title: "Explore Business Categories Across Africa | IFC BIZGROWTH",
    description:
      "Browse business categories and discover African businesses, products and services across different industries.",
  },

  twitter: {
    card: "summary_large_image",
    site: "@ifcbizgrowth",
    title: "Explore Business Categories Across Africa | IFC BIZGROWTH",
    description:
      "Discover businesses, products and services across African industries with IFC BIZGROWTH.",
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

export default function CategoriesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/categories#webpage`,
    url: `${SITE_URL}/categories`,
    name: "Explore Business Categories Across Africa",
    description:
      "Browse business categories and discover African businesses, products and services across different industries.",
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

      <CategoriesDirectoryClient />
    </>
  );
    }
