import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsForm from "./products-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/products");
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

  const { data: products, error: productsError } = await supabase
    .from("business_products")
    .select(
      `
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
      `,
    )
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (productsError) {
    throw new Error("Unable to load your products.");
  }

  return (
    <main className="products-page">
      <section className="products-header">
        <div>
          <span className="products-eyebrow">Business directory</span>

          <h1>Products</h1>

          <p>
            Add and manage the products your business offers on IFC BIZGROWTH.
          </p>
        </div>

        <div className="products-business">
          <span className="products-business__label">Business</span>
          <strong>{business.name}</strong>
        </div>
      </section>

      <ProductsForm
        businessId={business.id}
        initialProducts={products ?? []}
      />
    </main>
  );
    }
