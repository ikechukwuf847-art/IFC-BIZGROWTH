import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/business/profile");
  }

  // Get the business owned by this user
  const { data: business, error: businessError } = await supabase
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
      `
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("Business profile error:", businessError);
  }

  // User has no business yet
  if (!business) {
    redirect("/business/create");
  }

  // Get country information
  const { data: country } = await supabase
    .from("countries")
    .select("code, name, official_name, currency_code")
    .eq("code", business.country_code)
    .maybeSingle();

  // Get all active African countries
  const { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("code, name, official_name, currency_code")
    .eq("is_african", true)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (countriesError) {
    console.error("Countries error:", countriesError);
  }

  /*
   * Generate a signed URL for the business logo.
   *
   * logo_url stores the STORAGE PATH, not a public URL.
   *
   * Example:
   * 00b54f90-2e90-4b3f-b34a-ceb3717556d3/logo.png
   */
  let logoSignedUrl: string | null = null;

  if (business.logo_url) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("business-logos")
        .createSignedUrl(business.logo_url, 60 * 60);

    if (signedUrlError) {
      console.error("Logo signed URL error:", signedUrlError);
    } else {
      logoSignedUrl = signedUrlData?.signedUrl ?? null;
    }
  }

  return (
    <main className="business-page">
      <div className="business-page__container">

        {/* Page header */}
        <header className="business-page__header">
          <div>
            <p className="business-page__eyebrow">Business</p>

            <h1>Business Profile</h1>

            <p>
              Manage your business information, visibility and verification.
            </p>
          </div>
        </header>

        {/* Business status */}
        <section className="profile-status-card">
          <div className="profile-status-main">

            <div className="profile-business-icon">
              {logoSignedUrl ? (
                <img
                  src={logoSignedUrl}
                  alt={`${business.name} logo`}
                />
              ) : (
                <span>
                  {business.name?.charAt(0)?.toUpperCase() || "B"}
                </span>
              )}
            </div>

            <div className="profile-status-info">
              <h2>{business.name}</h2>

              <div className="profile-status-badges">

                <span
                  className={`profile-status-badge profile-status-badge--${business.status}`}
                >
                  {business.status === "active"
                    ? "Active"
                    : business.status}
                </span>

                <span
                  className={`profile-status-badge profile-status-badge--${business.verification_status}`}
                >
                  {business.verification_status === "approved"
                    ? "Verified"
                    : business.verification_status === "pending"
                    ? "Verification Pending"
                    : business.verification_status === "rejected"
                    ? "Verification Rejected"
                    : business.verification_status ===
                      "needs_more_information"
                    ? "More Information Needed"
                    : "Not Verified"}
                </span>

                <span
                  className={`profile-status-badge ${
                    business.is_public
                      ? "profile-status-badge--public"
                      : "profile-status-badge--private"
                  }`}
                >
                  {business.is_public ? "Public" : "Private"}
                </span>

              </div>
            </div>

          </div>
        </section>

        {/* Profile form */}
        <ProfileForm
          business={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            description: business.description,
            email: business.email,
            phone: business.phone,
            website_url: business.website_url,
            logo_url: business.logo_url,
            country_code: business.country_code,
            status: business.status,
            verification_status: business.verification_status,
            is_public: business.is_public,
            is_featured: business.is_featured,
          }}
          country={country}
          countries={countries ?? []}
          logoSignedUrl={logoSignedUrl}
        />

      </div>
    </main>
  );
    }
