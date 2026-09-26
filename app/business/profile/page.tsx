import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileWorkspace from "./profile-workspace";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_code: string;
  status: string;
  verification_status: string;
  is_public: boolean;
  is_featured: boolean;
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default async function BusinessProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/profile");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      id,
      owner_id,
      name,
      slug,
      description,
      email,
      phone,
      website_url,
      logo_url,
      country_code,
      status,
      verification_status,
      is_public,
      is_featured
    `)
    .eq("owner_id", user.id)
    .maybeSingle<Business>();

  if (error) {
    console.error("Business profile error:", error);
  }

  if (!business) {
    redirect("/business/create");
  }

  let logoUrl: string | null = null;

  if (business.logo_url) {
    const { data } = await supabase.storage
      .from("business-logos")
      .createSignedUrl(business.logo_url, 60 * 60);

    logoUrl = data?.signedUrl ?? null;
  }

  const [
    locationResult,
    socialResult,
    hoursResult,
    mediaResult,
    productsResult,
    servicesResult,
    promotionsResult,
    reviewsResult,
    ratingResult,
    countryResult,
  ] = await Promise.all([
    supabase
      .from("business_locations")
      .select("*")
      .eq("business_id", business.id)
      .order("is_primary", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("business_social_links")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", business.id)
      .order("day_of_week", { ascending: true }),

    supabase
      .from("business_media")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_products")
      .select("*")
      .eq("business_id", business.id)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true }),

    supabase
      .from("business_services")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("business_promotions")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_reviews")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .rpc("get_business_rating", {
        p_business_id: business.id,
      })
      .maybeSingle(),

    supabase
      .from("countries")
      .select("code, name, official_name, currency_code")
      .eq("code", business.country_code)
      .maybeSingle(),
  ]);

  const location = locationResult.data ?? null;
  const socialLinks = socialResult.data ?? [];
  const businessHours = hoursResult.data ?? [];
  const media = mediaResult.data ?? [];
  const products = productsResult.data ?? [];
  const services = servicesResult.data ?? [];
  const promotions = promotionsResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const rating = ratingResult.data ?? null;
  const country = countryResult.data ?? null;

  return (
    <ProfileWorkspace
      business={business}
      accountEmail={user.email ?? ""}
      logoUrl={logoUrl}
      initials={getInitials(business.name)}
      location={location}
      socialLinks={socialLinks}
      businessHours={businessHours}
      media={media}
      products={products}
      services={services}
      promotions={promotions}
      reviews={reviews}
      rating={rating}
      country={country}
    />
  );
    }
