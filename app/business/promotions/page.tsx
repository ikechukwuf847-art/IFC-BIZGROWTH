import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PromotionsForm from "./promotions-form";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/promotions");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    throw new Error("Unable to load your business.");
  }

  if (!business) {
    redirect("/business/create");
  }

  const { data: promotions, error: promotionsError } = await supabase
    .from("business_promotions")
    .select(`
      id,
      business_id,
      title,
      description,
      image_path,
      starts_at,
      ends_at,
      is_active,
      created_at,
      updated_at
    `)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (promotionsError) {
    throw new Error("Unable to load your promotions.");
  }

  return (
    <main className="promotions-page">
      <section className="promotions-header">
        <div>
          <span className="promotions-eyebrow">
            Business promotion
          </span>

          <h1>Promotions</h1>

          <p>
            Create offers and promotional campaigns to help
            customers discover what your business has to offer.
          </p>
        </div>

        <div className="promotions-business">
          <span className="promotions-business__label">
            Business
          </span>

          <strong>{business.name}</strong>
        </div>
      </section>

      <PromotionsForm
        businessId={business.id}
        initialPromotions={promotions ?? []}
      />
    </main>
  );
  }
