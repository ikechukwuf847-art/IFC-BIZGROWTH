import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsWorkspace from "./settings-workspace";

type Business = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  country_code: string;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  status: string;
  verification_status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export default async function BusinessSettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/settings");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      id,
      owner_id,
      name,
      description,
      country_code,
      phone,
      email,
      website_url,
      status,
      verification_status,
      is_public,
      created_at,
      updated_at
    `)
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle<Business>();

  if (error || !business) {
    redirect("/business/create");
  }

  if (business.status !== "active") {
    redirect("/business/dashboard");
  }

  return (
    <SettingsWorkspace
      business={business}
      accountEmail={user.email ?? ""}
    />
  );
           }
