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

  /*
   * Resolve the business through business_members.
   * This is more reliable than depending only on businesses.owner_id.
   */
  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Marketing membership lookup error:", membershipError);
  }

  if (!membership?.business_id) {
    redirect("/business/create");
  }

  /*
   * Load the actual business after resolving membership.
   */
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
    .eq("id", membership.business_id)
    .maybeSingle();

  if (businessError) {
    console.error("Marketing business lookup error:", businessError);
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
   * Load marketing services and this business's requests.
   */
  const [
    { data: services, error: servicesError },
    { data: requests, error: requestsError },
  ] = await Promise.all([
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
