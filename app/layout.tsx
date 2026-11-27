import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://ifcbizgrowth.africa";
const parentUrl = "https://ifcbridgelab.com";

// Official IFC BIZGROWTH social media profiles
const socialProfiles = [
  "https://www.facebook.com/ifcbizgrowth",
  "https://www.instagram.com/ifcbizgrowth",
  "https://www.tiktok.com/@ifcbizgrowth",
  "https://x.com/ifcbizgrowth",
  "https://www.youtube.com/@ifcbizgrowth",
  "https://www.linkedin.com/company/ifcbizgrowth/",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "IFC BIZGROWTH | Discover Businesses Across Africa",
    template: "%s | IFC BIZGROWTH",
  },

  description:
    "Discover businesses, products, and services across Africa with IFC BIZGROWTH. Explore business listings, find products and services, and connect directly with businesses across different industries and locations.",

  applicationName: "IFC BIZGROWTH",

  keywords: [
    "IFC BIZGROWTH",
    "African business directory",
    "business directory Africa",
    "businesses in Africa",
    "African business listings",
    "discover African businesses",
    "find businesses in Africa",
    "Nigeria business directory",
    "African small businesses",
    "business products and services",
    "verified businesses in Africa",
    "African business discovery platform",
  ],

  authors: [
    {
      name: "IFC Bridge Lab",
      url: parentUrl,
    },
  ],

  creator: "IFC Bridge Lab",
  publisher: "IFC Bridge Lab",

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

  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "IFC BIZGROWTH",
    url: siteUrl,

    title: "IFC BIZGROWTH | Discover Businesses Across Africa",

    description:
      "Discover businesses, products, and services across Africa with IFC BIZGROWTH. Explore the African business directory and connect directly with businesses.",

  },

  twitter: {
    card: "summary_large_image",

    site: "@ifcbizgrowth",

    title: "IFC BIZGROWTH | Discover Businesses Across Africa",

    description:
      "Discover businesses, products, and services across Africa with IFC BIZGROWTH.",
  },

  icons: {
    icon: "/favicon.ico",
  },

  category: "business",

  referrer: "strict-origin-when-cross-origin",

  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};


// Global structured data
const structuredData = {
  "@context": "https://schema.org",

  "@graph": [

    // Parent organization
    {
      "@type": "Organization",

      "@id": `${parentUrl}/#organization`,

      name: "IFC Bridge Lab",

      url: parentUrl,

      description:
        "IFC Bridge Lab is the parent organization behind IFC BIZGROWTH and its digital business-growth initiatives.",

      brand: {
        "@type": "Brand",

        "@id": `${siteUrl}/#brand`,

        name: "IFC BIZGROWTH",

        alternateName: "IFC BIZGROWTH African Business Discovery Platform",

        url: siteUrl,

        description:
          "IFC BIZGROWTH is an African business discovery platform that helps people discover businesses, products, and services across Africa.",

        sameAs: socialProfiles,
      },
    },

    // IFC BIZGROWTH website
    {
      "@type": "WebSite",

      "@id": `${siteUrl}/#website`,

      name: "IFC BIZGROWTH",

      alternateName: [
        "IFC BIZGROWTH African Business Directory",
        "IFC BIZGROWTH Business Discovery Platform",
      ],

      url: siteUrl,

      description:
        "An African business discovery platform where people can discover businesses, products, and services across different industries and geographical locations.",

      publisher: {
        "@id": `${parentUrl}/#organization`,
      },

      about: {
        "@id": `${siteUrl}/#brand`,
      },

      inLanguage: "en",
    },

  ],
};


export default function RootLayout({
  children,
}: LayoutProps<"/">) {

  return (
    <html
      lang="en-NG"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        {children}

      </body>

    </html>
  );
  }
