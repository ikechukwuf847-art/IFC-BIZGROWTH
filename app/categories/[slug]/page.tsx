import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import CategoryDirectoryClient from "./CategoryDirectoryClient";

const SITE_URL = "https://ifcbizgrowth.africa";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

/*
 * Fetch public category information.
 *
 * React cache prevents duplicate category queries
 * between generateMetadata and the page component
 * within the same request.
 */
const getCategory = cache(
  async (slug: string): Promise<Category | null> => {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("business_categories")
      .select("id, name, slug, description, is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to retrieve category: ${error.message}`
      );
    }

    return data as Category | null;
  }
);

/*
 * Dynamic SEO metadata for individual categories.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl =
    `${SITE_URL}/categories/${encodeURIComponent(category.slug)}`;

  const description =
    category.description?.trim() ||
    `Discover businesses, products and services in the ${category.name} category across Africa. Explore relevant businesses on IFC BIZGROWTH.`;

  const title =
    `${category.name} Businesses Across Africa`;

  return {
    title,

    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      locale: "en_NG",
      url: canonicalUrl,
      siteName: "IFC BIZGROWTH",
      title: `${title} | IFC BIZGROWTH`,
      description,
    },

    twitter: {
      card: "summary",
      site: "@ifcbizgrowth",
      title: `${title} | IFC BIZGROWTH`,
      description,
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const canonicalUrl =
    `${SITE_URL}/categories/${encodeURIComponent(category.slug)}`;

  const description =
    category.description?.trim() ||
    `Discover businesses, products and services in the ${category.name} category across Africa.`;

  /*
   * Category structured data.
   */
  const structuredData = {
    "@context": "https://schema.org",

    "@type": "CollectionPage",

    "@id": `${canonicalUrl}#webpage`,

    url: canonicalUrl,

    name: `${category.name} Businesses Across Africa`,

    description,

    inLanguage: "en-NG",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@type": "DefinedTerm",
      "@id": `${canonicalUrl}#category`,
      name: category.name,
      description,
      url: canonicalUrl,
    },

    breadcrumb: {
      "@type": "BreadcrumbList",

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/discover`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Categories",
          item: `${SITE_URL}/categories`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: canonicalUrl,
        },
      ],
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

      <Suspense
        fallback={
          <main className="category-page">
            <div className="category-loading">
              <div className="loading-spinner" />
              <p>Loading category...</p>
            </div>
          </main>
        }
      >
        <CategoryDirectoryClient />
      </Suspense>
    </>
  );
      }
