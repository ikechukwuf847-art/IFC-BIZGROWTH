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
  country_code: string | null;
  status: string;
  verification_status: string;
  is_public: boolean;
  is_featured: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export default async function BusinessProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/profile");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      `
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
      `
    )
    .eq("owner_id", user.id)
    .maybeSingle<Business>();

  if (businessError) {
    console.error("Failed to load business:", businessError);
  }

  if (!business) {
    redirect("/business/create");
  }

  let logoUrl: string | null = null;

  if (business.logo_url) {
    const { data: signedLogo } = await supabase.storage
      .from("business-logos")
      .createSignedUrl(business.logo_url, 60 * 60);

    logoUrl = signedLogo?.signedUrl ?? null;
  }

  const [
    locationResult,
    socialLinksResult,
    businessHoursResult,
    mediaResult,
    productsResult,
    servicesResult,
    promotionsResult,
    reviewsResult,
    ratingResult,
    countryResult,
    categoriesResult,
    subcategoriesResult,
    categoryAssignmentResult,
    subcategoryAssignmentResult,
  ] = await Promise.all([
    supabase
      .from("business_locations")
      .select(
        `
          id,
          business_id,
          country_id,
          country_code,
          city,
          state_region,
          address,
          address_line_1,
          address_line_2,
          postal_code,
          latitude,
          longitude,
          is_primary,
          is_active,
          is_public
        `
      )
      .eq("business_id", business.id)
      .eq("is_primary", true)
      .eq("is_active", true)
      .maybeSingle(),

    supabase
      .from("business_social_links")
      .select("*")
      .eq("business_id", business.id)
      .order("platform", { ascending: true }),

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
      .order("created_at", { ascending: false }),

    supabase
      .from("business_services")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_promotions")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_reviews")
      .select("*")
      .eq("business_id", business.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase.rpc("get_business_rating", {
      p_business_id: business.id,
    }),

    supabase
      .from("countries")
      .select("*")
      .eq("code", business.country_code)
      .maybeSingle(),

    supabase
      .from("business_categories")
      .select("id, name, slug, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("business_subcategories")
      .select(
        "id, category_id, name, slug, is_active, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("business_category_assignments")
      .select("category_id")
      .eq("business_id", business.id)
      .limit(1)
      .maybeSingle(),

    supabase
      .from("business_subcategory_assignments")
      .select("subcategory_id")
      .eq("business_id", business.id)
      .limit(1)
      .maybeSingle(),
  ]);

  if (locationResult.error) {
    console.error(
      "Failed to load business location:",
      locationResult.error
    );
  }

  if (socialLinksResult.error) {
    console.error(
      "Failed to load social links:",
      socialLinksResult.error
    );
  }

  if (businessHoursResult.error) {
    console.error(
      "Failed to load business hours:",
      businessHoursResult.error
    );
  }

  if (mediaResult.error) {
    console.error("Failed to load business media:", mediaResult.error);
  }

  if (productsResult.error) {
    console.error(
      "Failed to load business products:",
      productsResult.error
    );
  }

  if (servicesResult.error) {
    console.error(
      "Failed to load business services:",
      servicesResult.error
    );
  }

  if (promotionsResult.error) {
    console.error(
      "Failed to load business promotions:",
      promotionsResult.error
    );
  }

  if (reviewsResult.error) {
    console.error(
      "Failed to load business reviews:",
      reviewsResult.error
    );
  }

  if (ratingResult.error) {
    console.error(
      "Failed to load business rating:",
      ratingResult.error
    );
  }

  if (countryResult.error) {
    console.error(
      "Failed to load business country:",
      countryResult.error
    );
  }

  if (categoriesResult.error) {
    console.error(
      "Failed to load business categories:",
      categoriesResult.error
    );
  }

  if (subcategoriesResult.error) {
    console.error(
      "Failed to load business subcategories:",
      subcategoriesResult.error
    );
  }

  if (categoryAssignmentResult.error) {
    console.error(
      "Failed to load business category assignment:",
      categoryAssignmentResult.error
    );
  }

  if (subcategoryAssignmentResult.error) {
    console.error(
      "Failed to load business subcategory assignment:",
      subcategoryAssignmentResult.error
    );
  }

  const location = locationResult.data ?? null;

  const socialLinks = socialLinksResult.data ?? [];

  const businessHours = businessHoursResult.data ?? [];

  const media = mediaResult.data ?? [];

  const products = productsResult.data ?? [];

  const services = servicesResult.data ?? [];

  const promotions = promotionsResult.data ?? [];

  const reviews = reviewsResult.data ?? [];

  const rating = ratingResult.data ?? null;

  const country = countryResult.data ?? null;

  const categories = (categoriesResult.data ?? []) as Category[];

  const subcategories =
    (subcategoriesResult.data ?? []) as Subcategory[];

  const categoryAssignment =
    categoryAssignmentResult.data ?? null;

  const subcategoryAssignment =
    subcategoryAssignmentResult.data ?? null;

  const initials =
    business.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "B";

  return (
    <ProfileWorkspace
      business={business}
      accountEmail={user.email ?? ""}
      logoUrl={logoUrl}
      initials={initials}
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
      categories={categories}
      subcategories={subcategories}
      categoryAssignment={categoryAssignment}
      subcategoryAssignment={subcategoryAssignment}
    />
  );
  }
