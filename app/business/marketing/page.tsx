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

type MarketingPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_days: number;
  daily_price: number;
  total_price: number;
  currency_code: string;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type MarketingRequest = {
  id: string;
  business_id: string;
  plan_id: string | null;
  title: string;
  description: string | null;
  budget: number;
  currency_code: string;
  starts_at: string | null;
  ends_at: string | null;
  duration_days: number | null;
  daily_rate: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default async function MarketingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/marketing");
  }

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
      "Marketing business lookup failed:",
      businessError,
    );
  }

  if (!business) {
    redirect("/business/create");
  }

  if (business.status !== "active") {
    redirect("/business/dashboard");
  }

  const [
    { data: country, error: countryError },
    { data: plans, error: plansError },
    { data: requests, error: requestsError },
  ] = await Promise.all([
    supabase
      .from("countries")
      .select("name, currency_code")
      .eq("code", business.country_code)
      .maybeSingle<Country>(),

    supabase
      .from("marketing_campaign_plans")
      .select("*")
      .eq("is_active", true)
      .order("duration_days", {
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

  if (countryError) {
    console.error(
      "Marketing country lookup failed:",
      countryError,
    );
  }

  if (plansError) {
    console.error(
      "Marketing campaign plans lookup failed:",
      plansError,
    );
  }

  if (requestsError) {
    console.error(
      "Marketing requests lookup failed:",
      requestsError,
    );
  }

  const currencyCode =
    country?.currency_code ??
    "NGN";

  const businessForWorkspace = {
    ...business,
    currency_code: currencyCode,
  };

  return (
    <MarketingWorkspace
      business={businessForWorkspace}
      plans={(plans ?? []) as MarketingPlan[]}
      requests={(requests ?? []) as MarketingRequest[]}
    />
  );
  }
