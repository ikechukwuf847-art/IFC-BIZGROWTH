import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country_code: string;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  status: string;
  verification_status: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

type Country = {
  name: string;
  currency_code: string;
};

function formatVerificationStatus(
  status: string,
) {
  switch (status) {
    case "approved":
      return "Verified";

    case "pending":
      return "Verification pending";

    case "under_review":
      return "Under review";

    case "rejected":
      return "Verification rejected";

    case "needs_more_information":
      return "More information required";

    default:
      return "Not verified";
  }
}

function getVerificationClass(status: string) {
  switch (status) {
    case "approved":
      return "status-success";

    case "pending":
    case "under_review":
      return "status-warning";

    case "rejected":
      return "status-danger";

    default:
      return "status-neutral";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function BusinessDashboardPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?next=/business/dashboard",
    );
  }

  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        slug,
        description,
        country_code,
        phone,
        email,
        website_url,
        status,
        verification_status,
        is_public,
        is_featured,
        created_at,
        updated_at
      `,
      )
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle<Business>();

  if (businessError) {
    console.error(
      "Dashboard business query failed:",
      businessError,
    );
  }

  if (!business) {
    redirect("/business/create");
  }

  const [
    countryResult,
    productsResult,
    servicesResult,
    analyticsResult,
    campaignsResult,
    marketingResult,
  ] = await Promise.all([
    supabase
      .from("countries")
      .select("name, currency_code")
      .eq("code", business.country_code)
      .maybeSingle<Country>(),

    supabase
      .from("business_products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id),

    supabase
      .from("business_services")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id),

    supabase
      .from("business_analytics_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id),

    supabase
      .from("ad_campaigns")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id),

    supabase
      .from("marketing_service_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id),
  ]);

  const country = countryResult.data;

  const productCount =
    productsResult.count ?? 0;

  const serviceCount =
    servicesResult.count ?? 0;

  const analyticsEventCount =
    analyticsResult.count ?? 0;

  const campaignCount =
    campaignsResult.count ?? 0;

  const marketingRequestCount =
    marketingResult.count ?? 0;

  const verificationStatus =
    business.verification_status;

  const profileFields = [
    business.name,
    business.description,
    business.country_code,
    business.phone,
    business.email,
    business.website_url,
  ];

  const completedFields =
    profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) *
      100,
  );

  return (
    <main className="business-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              BUSINESS DASHBOARD
            </span>

            <h1>
              Welcome, {business.name}
            </h1>

            <p>
              Manage your business presence,
              products, services and growth from
              one place.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Link
              href="/business/profile"
              className="dashboard-secondary-button"
            >
              Manage profile
            </Link>

            <Link
              href="/business/products"
              className="dashboard-primary-button"
            >
              Add product
            </Link>
          </div>
        </header>

        <section className="dashboard-status-card">
          <div className="dashboard-status-main">
            <div className="dashboard-business-avatar">
              {business.name
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2>{business.name}</h2>

              <p>
                {country?.name ??
                  business.country_code}
              </p>
            </div>
          </div>

          <div className="dashboard-status-items">
            <div className="dashboard-status-item">
              <span>Business status</span>

              <strong className="status-success">
                {business.status === "active"
                  ? "Active"
                  : business.status}
              </strong>
            </div>

            <div className="dashboard-status-item">
              <span>Verification</span>

              <strong
                className={getVerificationClass(
                  verificationStatus,
                )}
              >
                {formatVerificationStatus(
                  verificationStatus,
                )}
              </strong>
            </div>

            <div className="dashboard-status-item">
              <span>Visibility</span>

              <strong>
                {business.is_public
                  ? "Public"
                  : "Private"}
              </strong>
            </div>
          </div>
        </section>

        {verificationStatus !== "approved" && (
          <section className="dashboard-notice">
            <div className="dashboard-notice-icon">
              !
            </div>

            <div className="dashboard-notice-content">
              <h3>
                Complete your business
                verification
              </h3>

              <p>
                Verified businesses can build
                stronger trust with customers on
                IFC BIZGROWTH.
              </p>
            </div>

            <Link
              href="/business/verification"
              className="dashboard-notice-link"
            >
              {verificationStatus ===
              "not_submitted"
                ? "Start verification"
                : "View verification"}
            </Link>
          </section>
        )}

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Profile activity
            </span>

            <strong>
              {analyticsEventCount.toLocaleString()}
            </strong>

            <small>
              Recorded business interactions
            </small>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Products
            </span>

            <strong>
              {productCount.toLocaleString()}
            </strong>

            <small>
              Products listed
            </small>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Services
            </span>

            <strong>
              {serviceCount.toLocaleString()}
            </strong>

            <small>
              Services listed
            </small>
          </div>

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Campaigns
            </span>

            <strong>
              {campaignCount.toLocaleString()}
            </strong>

            <small>
              Advertising campaigns
            </small>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">
                  BUSINESS PROFILE
                </span>

                <h2>
                  Build your business presence
                </h2>
              </div>

              <span className="dashboard-profile-percent">
                {profileCompletion}%
              </span>
            </div>

            <div className="dashboard-progress">
              <span
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>

            <p className="dashboard-panel-description">
              Complete your business information
              so customers can understand what you
              offer and how to reach you.
            </p>

            <div className="dashboard-checklist">
              <div
                className={
                  business.name
                    ? "dashboard-check completed"
                    : "dashboard-check"
                }
              >
                <span>✓</span>
                Business name
              </div>

              <div
                className={
                  business.description
                    ? "dashboard-check completed"
                    : "dashboard-check"
                }
              >
                <span>✓</span>
                Business description
              </div>

              <div
                className={
                  business.phone
                    ? "dashboard-check completed"
                    : "dashboard-check"
                }
              >
                <span>✓</span>
                Phone number
              </div>

              <div
                className={
                  business.email
                    ? "dashboard-check completed"
                    : "dashboard-check"
                }
              >
                <span>✓</span>
                Business email
              </div>

              <div
                className={
                  business.website_url
                    ? "dashboard-check completed"
                    : "dashboard-check"
                }
              >
                <span>✓</span>
                Website
                <small>Optional</small>
              </div>
            </div>

            <Link
              href="/business/profile"
              className="dashboard-panel-button"
            >
              Complete profile
            </Link>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">
                  GROW YOUR BUSINESS
                </span>

                <h2>
                  Business tools
                </h2>
              </div>
            </div>

            <div className="dashboard-tools">
              <Link
                href="/business/products"
                className="dashboard-tool"
              >
                <span className="dashboard-tool-icon">
                  P
                </span>

                <span>
                  <strong>
                    Products
                  </strong>

                  <small>
                    Add what you sell
                  </small>
                </span>

                <b>→</b>
              </Link>

              <Link
                href="/business/services"
                className="dashboard-tool"
              >
                <span className="dashboard-tool-icon">
                  S
                </span>

                <span>
                  <strong>
                    Services
                  </strong>

                  <small>
                    Show what you offer
                  </small>
                </span>

                <b>→</b>
              </Link>

              <Link
                href="/business/advertising"
                className="dashboard-tool"
              >
                <span className="dashboard-tool-icon">
                  A
                </span>

                <span>
                  <strong>
                    Advertising
                  </strong>

                  <small>
                    Promote your business
                  </small>
                </span>

                <b>→</b>
              </Link>

              <Link
                href="/business/marketing"
                className="dashboard-tool"
              >
                <span className="dashboard-tool-icon">
                  M
                </span>

                <span>
                  <strong>
                    Marketing
                  </strong>

                  <small>
                    Get marketing support
                  </small>
                </span>

                <b>→</b>
              </Link>
            </div>
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="dashboard-panel dashboard-activity-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">
                  ACTIVITY
                </span>

                <h2>
                  Your business at a glance
                </h2>
              </div>
            </div>

            <div className="dashboard-activity-list">
              <div className="dashboard-activity-row">
                <span>
                  Products listed
                </span>

                <strong>
                  {productCount}
                </strong>
              </div>

              <div className="dashboard-activity-row">
                <span>
                  Services listed
                </span>

                <strong>
                  {serviceCount}
                </strong>
              </div>

              <div className="dashboard-activity-row">
                <span>
                  Advertising campaigns
                </span>

                <strong>
                  {campaignCount}
                </strong>
              </div>

              <div className="dashboard-activity-row">
                <span>
                  Marketing requests
                </span>

                <strong>
                  {marketingRequestCount}
                </strong>
              </div>

              <div className="dashboard-activity-row">
                <span>
                  Currency
                </span>

                <strong>
                  {country?.currency_code ??
                    "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="dashboard-panel dashboard-about-panel">
            <span className="dashboard-panel-eyebrow">
              ABOUT YOUR BUSINESS
            </span>

            <h2>
              {business.name}
            </h2>

            <p>
              {business.description ||
                "Add a description to tell customers more about your business."}
            </p>

            <div className="dashboard-business-meta">
              <span>
                Country:{" "}
                {country?.name ??
                  business.country_code}
              </span>

              <span>
                Joined{" "}
                {formatDate(
                  business.created_at,
                )}
              </span>
            </div>

            <Link
              href="/business/profile"
              className="dashboard-panel-button"
            >
              Edit business
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
