import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

export default async function BusinessProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/profile");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        description,
        email,
        phone,
        website_url,
        logo_url,
        country_code,
        status,
        verification_status,
        is_public,
        is_featured
      `,
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Business profile query failed:", error);
  }

  if (!business) {
    redirect("/business/create");
  }

  const { data: country } = await supabase
    .from("countries")
    .select("code, name")
    .eq("code", business.country_code)
    .maybeSingle();

  const { data: countries } = await supabase
    .from("countries")
    .select("code, name, official_name, currency_code")
    .eq("is_african", true)
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <main className="business-page">
      <div className="business-page-shell">
        <header className="business-page-header">
          <div>
            <span className="page-eyebrow">
              Business
            </span>

            <h1>Business Profile</h1>

            <p>
              Manage the information customers see
              about your business.
            </p>
          </div>

          <a
            href="/business/dashboard"
            className="back-dashboard-link"
          >
            ← Dashboard
          </a>
        </header>

        <section className="profile-status-card">
          <div className="profile-status-main">
            <div className="profile-business-icon">
              {business.logo_url ? (
                <img
                  src="/api/businesses/logo"
                  alt={`${business.name} logo`}
                />
              ) : (
                business.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>
              <h2>{business.name}</h2>

              <p>
                {country?.name ??
                  business.country_code}
              </p>
            </div>
          </div>

          <div className="profile-status-badges">
            <span
              className={`status-badge ${
                business.status === "active"
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              {business.status === "active"
                ? "Active"
                : business.status}
            </span>

            <span
              className={`status-badge ${
                business.verification_status ===
                "approved"
                  ? "status-verified"
                  : "status-pending"
              }`}
            >
              {business.verification_status ===
              "approved"
                ? "Verified"
                : business.verification_status ===
                    "needs_more_information"
                  ? "More information needed"
                  : business.verification_status ===
                      "pending"
                    ? "Verification pending"
                    : "Not verified"}
            </span>
          </div>
        </section>

        <ProfileForm
          business={business}
          countries={countries ?? []}
        />
      </div>
    </main>
  );
    }
