import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MarketingWorkspace from "./marketing-workspace";
import "./marketing.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  name: string;
  country_code: string;
  status: string;
};

type Country = {
  name: string;
  currency_code: string;
};

export default async function MarketingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/marketing");
  }

  /*
   * Use the same business lookup that already works
   * on the business dashboard.
   */
  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select(
        `
          id,
          name,
          country_code,
          status
        `,
      )
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle<Business>();

  if (businessError) {
    console.error(
      "Marketing business query failed:",
      businessError,
    );
  }

  if (!business) {
    redirect("/business/create");
  }

  /*
   * Only active businesses can use marketing.
   */
  if (business.status !== "active") {
    redirect("/business/dashboard");
  }

  /*
   * Currency belongs to the country's record,
   * not directly to businesses.
   */
  const { data: country, error: countryError } =
    await supabase
      .from("countries")
      .select("name, currency_code")
      .eq("code", business.country_code)
      .maybeSingle<Country>();

  if (countryError) {
    console.error(
      "Marketing country lookup failed:",
      countryError,
    );
  }

  /*
   * Keep the object passed to the existing
   * MarketingWorkspace compatible with the
   * expected business shape.
   */
  const businessForWorkspace = {
    ...business,
    currency_code: country?.currency_code ?? null,
  };

  /*
   * Load marketing services and this business's
   * existing marketing requests.
   */
  const [
    { data: services, error: servicesError },
    { data: requests, error: requestsError },
  ] = await Promise.all([
    supabase
      .from("marketing_services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("marketing_service_requests")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (servicesError) {
    console.error(
      "Marketing services query failed:",
      servicesError,
    );
  }

  if (requestsError) {
    console.error(
      "Marketing requests query failed:",
      requestsError,
    );
  }

  return (
    <MarketingWorkspace
      business={businessForWorkspace}
      services={services ?? []}
      requests={requests ?? []}
    />
  );
}
