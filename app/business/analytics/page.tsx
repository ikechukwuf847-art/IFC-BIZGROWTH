import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AnalyticsWorkspace from "./analytics-workspace";
import "./analytics.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  name: string;
  status: string;
};

type AnalyticsEvent = {
  id: number;
  business_id: string;
  event_type: string;
  visitor_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle<Business>();

  if (businessError || !business) {
    redirect("/business/create");
  }

  if (business.status !== "active") {
    redirect("/business/dashboard");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: events, error: eventsError } = await supabase
    .from("business_analytics_events")
    .select(
      `
        id,
        business_id,
        event_type,
        visitor_id,
        session_id,
        metadata,
        created_at
      `,
    )
    .eq("business_id", business.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000)
    .returns<AnalyticsEvent[]>();

  if (eventsError) {
    console.error("Analytics events error:", eventsError);
  }

  return (
    <AnalyticsWorkspace
      business={{
        id: business.id,
        name: business.name,
      }}
      events={events || []}
    />
  );
}
