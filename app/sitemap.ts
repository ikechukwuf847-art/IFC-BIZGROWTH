import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SITE_URL = "https://ifcbizgrowth.africa";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/businesses`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug")
      .eq("is_public", true)
      .eq("status", "active")
      .order("slug", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(
        `Failed to generate business sitemap: ${error.message}`
      );
    }

    const businesses = data ?? [];

    for (const business of businesses) {
      if (!business.slug) continue;

      sitemapEntries.push({
        url: `${SITE_URL}/businesses/${encodeURIComponent(
          business.slug
        )}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    hasMore = businesses.length === pageSize;
    from += pageSize;
  }

  return sitemapEntries;
}
