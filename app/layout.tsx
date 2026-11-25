import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://ifcbizgrowth.africa";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "IFC BIZGROWTH | Discover Businesses Across Africa",
    template: "%s | IFC BIZGROWTH",
  },

  description:
    "Discover businesses, products, and services across Africa with IFC BIZGROWTH. Explore our African business directory and connect with businesses in different industries and locations.",

  applicationName: "IFC BIZGROWTH",

  keywords: [
    "African business directory",
    "businesses in Africa",
    "discover African businesses",
    "Africa business listings",
    "business directory Africa",
    "find businesses in Africa",
    "African companies",
    "small businesses in Africa",
    "business products and services",
    "business discovery platform",
    "Nigeria business directory",
    "verified businesses in Africa",
    "IFC BIZGROWTH",
  ],

  authors: [
    {
      name: "IFC BIZGROWTH",
      url: siteUrl,
    },
  ],

  creator: "IFC BIZGROWTH",
  publisher: "IFC BIZGROWTH",

  alternates: {
    canonical: "/",
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

  openGraph: {
    type: "website",
    locale: "en",
    url: siteUrl,
    siteName: "IFC BIZGROWTH",
    title: "IFC BIZGROWTH | Discover Businesses Across Africa",
    description:
      "Explore the African business directory. Discover businesses, products, and services and connect with businesses across Africa.",
  },

  twitter: {
    card: "summary_large_image",
    title: "IFC BIZGROWTH | Discover Businesses Across Africa",
    description:
      "Discover businesses, products, and services across Africa with IFC BIZGROWTH.",
  },

  icons: {
    icon: "/favicon.ico",
  },

  category: "business",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "IFC BIZGROWTH",
  url: siteUrl,
  description:
    "An African business discovery and growth platform that helps people discover businesses, products, and services.",
  slogan: "Discover. Connect. Grow.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "IFC BIZGROWTH",
  url: siteUrl,
  description:
    "Discover businesses, products, and services across Africa.",
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(
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
