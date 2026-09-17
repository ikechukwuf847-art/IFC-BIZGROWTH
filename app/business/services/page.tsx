import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ServicesForm from "./services-form";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/services");
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

  const { data: services, error: servicesError } = await supabase
    .from("business_services")
    .select(`
      id,
      business_id,
      name,
      slug,
      description,
      price,
      currency_code,
      image_path,
      is_available,
      is_featured,
      sort_order,
      created_at,
      updated_at
    `)
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (servicesError) {
    throw new Error("Unable to load your services.");
  }

  return (
    <main className="services-page">
      <section className="services-header">
        <div>
          <span className="services-eyebrow">
            Business directory
          </span>

          <h1>Services</h1>

          <p>
            Add and manage the services your business offers
            on IFC BIZGROWTH.
          </p>
        </div>

        <div className="services-business">
          <span className="services-business__label">
            Business
          </span>

          <strong>{business.name}</strong>
        </div>
      </section>

      <ServicesForm
        businessId={business.id}
        initialServices={services ?? []}
      />
    </main>
  );
}
