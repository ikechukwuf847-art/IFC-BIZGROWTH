import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MarketingWorkspace from "./marketing-workspace";
import "./marketing.css";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        status,
        currency_code
      `,
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("Marketing business lookup error:", businessError);
  }

  if (!business) {
    redirect("/business/create");
  }

  if (business.status !== "active") {
    redirect("/business/dashboard");
  }

  const [{ data: services, error: servicesError }, { data: requests, error: requestsError }] =
    await Promise.all([
      supabase
        .from("marketing_services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),

      supabase
        .from("marketing_service_requests")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
    ]);

  if (servicesError) {
    console.error("Marketing services lookup error:", servicesError);
  }

  if (requestsError) {
    console.error("Marketing requests lookup error:", requestsError);
  }

  return (
    <MarketingWorkspace
      business={business}
      services={services ?? []}
      requests={requests ?? []}
    />
  );
      }
