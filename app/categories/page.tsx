import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./category.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export const metadata = {
  title: "Business Categories | IFC BIZGROWTH",
  description:
    "Explore businesses across different categories on IFC BIZGROWTH.",
};

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: categories, error } = await supabase
    .from("business_categories")
    .select("id,name,slug,description,is_active,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Categories fetch error:", error);
  }

  return (
    <main className="categories-page">
      <section className="categories-hero">
        <div className="categories-container">
          <span className="categories-eyebrow">DISCOVER BUSINESSES</span>

          <h1>Explore business categories</h1>

          <p>
            Find businesses, products, services and opportunities across
            different categories on IFC BIZGROWTH.
          </p>
        </div>
      </section>

      <section className="categories-section">
        <div className="categories-container">
          {categories && categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="category-card"
                >
                  <div className="category-icon" aria-hidden="true">
                    {category.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="category-content">
                    <h2>{category.name}</h2>

                    {category.description && (
                      <p>{category.description}</p>
                    )}

                    <span className="category-link">
                      Explore category <span>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="categories-empty">
              <div className="empty-icon">◎</div>
              <h2>No categories available</h2>
              <p>
                Business categories will appear here when they become
                available.
              </p>
            </div>
          )}

          {error && (
            <div className="categories-error">
              Unable to load categories right now. Please try again later.
            </div>
          )}
        </div>
      </section>
    </main>
  );
          }
