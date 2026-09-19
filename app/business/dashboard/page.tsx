import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./dashboard.css";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country_code: string;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
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

type AnalyticsEvent = {
  event_type: string;
  created_at: string;
};

const VIEW_EVENTS = [
  "profile_view",
  "product_view",
  "service_view",
  "promotion_view",
];

const INTERACTION_EVENTS = [
  "website_click",
  "phone_click",
  "contact_click",
  "whatsapp_click",
  "social_click",
  "location_view",
];

const EVENT_LABELS: Record<string, string> = {
  profile_view: "Profile views",
  product_view: "Product views",
  service_view: "Service views",
  promotion_view: "Promotion views",
  website_click: "Website clicks",
  phone_click: "Phone clicks",
  contact_click: "Contact clicks",
  whatsapp_click: "WhatsApp clicks",
  social_click: "Social clicks",
  location_view: "Location views",
};

function formatVerificationStatus(status: string) {
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
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "B";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function buildDailyAnalytics(
  events: AnalyticsEvent[],
  days = 7,
) {
  const result: Array<{
    key: string;
    label: string;
    views: number;
    interactions: number;
  }> = [];

  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);

    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - index);

    const key = date.toISOString().slice(0, 10);

    const label = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);

    result.push({
      key,
      label,
      views: 0,
      interactions: 0,
    });
  }

  for (const event of events) {
    const key = new Date(event.created_at)
      .toISOString()
      .slice(0, 10);

    const day = result.find((item) => item.key === key);

    if (!day) {
      continue;
    }

    if (VIEW_EVENTS.includes(event.event_type)) {
      day.views += 1;
    }

    if (INTERACTION_EVENTS.includes(event.event_type)) {
      day.interactions += 1;
    }
  }

  return result;
}

function getChartPoints(
  values: number[],
  width = 620,
  height = 220,
  padding = 28,
) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const range = Math.max(max - min, 1);

  return values.map((value, index) => {
    const x =
      padding +
      (index *
        (width - padding * 2)) /
        Math.max(values.length - 1, 1);

    const y =
      height -
      padding -
      ((value - min) / range) *
        (height - padding * 2);

    return {
      x,
      y,
      value,
    };
  });
}

function createPolyline(
  points: Array<{ x: number; y: number }>,
) {
  return points
    .map(
      (point) =>
        `${point.x.toFixed(2)},${point.y.toFixed(2)}`,
    )
    .join(" ");
}

function createAreaPath(
  points: Array<{ x: number; y: number }>,
  height = 220,
  padding = 28,
) {
  if (!points.length) {
    return "";
  }

  const first = points[0];
  const last = points[points.length - 1];

  const bottom = height - padding;

  return [
    `M ${first.x.toFixed(2)} ${bottom}`,
    ...points.map(
      (point) =>
        `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    ),
    `L ${last.x.toFixed(2)} ${bottom}`,
    "Z",
  ].join(" ");
}

function AnalyticsLineChart({
  data,
  type,
}: {
  data: Array<{
    key: string;
    label: string;
    views: number;
    interactions: number;
  }>;
  type: "views" | "interactions";
}) {
  const values = data.map((item) => item[type]);

  const points = getChartPoints(values);

  const maxValue = Math.max(...values, 0);

  const polyline = createPolyline(points);

  const areaPath = createAreaPath(points);

  const latestValue =
    values[values.length - 1] ?? 0;

  const totalValue = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  const title =
    type === "views"
      ? "Views"
      : "Interactions";

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__header">
        <div>
          <span className="analytics-chart__label">
            LAST 7 DAYS
          </span>

          <h3>{title}</h3>
        </div>

        <div className="analytics-chart__summary">
          <strong>
            {formatNumber(totalValue)}
          </strong>

          <span>Total</span>
        </div>
      </div>

      <div className="analytics-chart__canvas">
        {totalValue === 0 ? (
          <div className="analytics-chart__empty">
            <div className="analytics-chart__empty-icon">
              —
            </div>

            <strong>
              No {title.toLowerCase()} yet
            </strong>

            <span>
              Your real {title.toLowerCase()} data
              will appear here when customers
              interact with your business.
            </span>
          </div>
        ) : (
          <svg
            viewBox="0 0 620 220"
            className="analytics-chart__svg"
            role="img"
            aria-label={`${title} over the last 7 days`}
          >
            <defs>
              <linearGradient
                id={`${type}-gradient`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="rgba(37, 99, 235, 0.20)"
                />

                <stop
                  offset="100%"
                  stopColor="rgba(37, 99, 235, 0)"
                />
              </linearGradient>
            </defs>

            <line
              x1="28"
              y1="28"
              x2="592"
              y2="28"
              className="chart-grid-line"
            />

            <line
              x1="28"
              y1="82"
              x2="592"
              y2="82"
              className="chart-grid-line"
            />

            <line
              x1="28"
              y1="137"
              x2="592"
              y2="137"
              className="chart-grid-line"
            />

            <line
              x1="28"
              y1="192"
              x2="592"
              y2="192"
              className="chart-grid-line"
            />

            <path
              d={areaPath}
              fill={`url(#${type}-gradient)`}
            />

            <polyline
              points={polyline}
              fill="none"
              className="chart-line"
            />

            {points.map((point, index) => (
              <g key={`${type}-${data[index].key}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="chart-point"
                />

                <title>
                  {data[index].label}:{" "}
                  {formatNumber(point.value)}
                </title>
              </g>
            ))}

            <text
              x="28"
              y="214"
              className="chart-axis-label"
            >
              {data[0]?.label}
            </text>

            <text
              x="310"
              y="214"
              textAnchor="middle"
              className="chart-axis-label"
            >
              {data[3]?.label}
            </text>

            <text
              x="592"
              y="214"
              textAnchor="end"
              className="chart-axis-label"
            >
              {data[6]?.label}
            </text>

            <text
              x="592"
              y="18"
              textAnchor="end"
              className="chart-value-label"
            >
              {formatNumber(maxValue)}
            </text>
          </svg>
        )}
      </div>

      {totalValue > 0 && (
        <div className="analytics-chart__footer">
          <span>
            Latest day:{" "}
            <strong>
              {formatNumber(latestValue)}
            </strong>
          </span>

          <span>
            Based on recorded business events
          </span>
        </div>
      )}
    </div>
  );
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

  const {
    data: business,
    error: businessError,
  } = await supabase
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
        logo_url,
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

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  sevenDaysAgo.setUTCDate(
    sevenDaysAgo.getUTCDate() - 6,
  );

  const [
    countryResult,
    productsResult,
    servicesResult,
    activeCampaignsResult,
    marketingResult,
    viewsResult,
    interactionsResult,
    recentEventsResult,
    analyticsEventsResult,
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
      .from("ad_campaigns")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id)
      .eq("status", "active"),

    supabase
      .from("marketing_service_requests")
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
      .eq("business_id", business.id)
      .in("event_type", VIEW_EVENTS),

    supabase
      .from("business_analytics_events")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id)
      .in(
        "event_type",
        INTERACTION_EVENTS,
      ),

    supabase
      .from("business_analytics_events")
      .select(
        "event_type, created_at",
      )
      .eq("business_id", business.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(6),

    supabase
      .from("business_analytics_events")
      .select(
        "event_type, created_at",
      )
      .eq("business_id", business.id)
      .gte(
        "created_at",
        sevenDaysAgo.toISOString(),
      )
      .order("created_at", {
        ascending: true,
      }),
  ]);

  const analyticsQueriesFailed =
    Boolean(viewsResult.error) ||
    Boolean(interactionsResult.error) ||
    Boolean(recentEventsResult.error) ||
    Boolean(analyticsEventsResult.error);

  if (analyticsQueriesFailed) {
    console.error(
      "One or more dashboard analytics queries failed:",
      {
        views: viewsResult.error,
        interactions:
          interactionsResult.error,
        recent:
          recentEventsResult.error,
        sevenDay:
          analyticsEventsResult.error,
      },
    );
  }

  const country = countryResult.data;

  const productCount =
    productsResult.count ?? 0;

  const serviceCount =
    servicesResult.count ?? 0;

  const activeCampaignCount =
    activeCampaignsResult.count ?? 0;

  const marketingRequestCount =
    marketingResult.count ?? 0;

  const totalViews =
    analyticsQueriesFailed
      ? null
      : viewsResult.count ?? 0;

  const totalInteractions =
    analyticsQueriesFailed
      ? null
      : interactionsResult.count ?? 0;

  const recentEvents =
    analyticsQueriesFailed
      ? []
      : ((recentEventsResult.data ??
          []) as AnalyticsEvent[]);

  const sevenDayEvents =
    analyticsQueriesFailed
      ? []
      : ((analyticsEventsResult.data ??
          []) as AnalyticsEvent[]);

  const dailyAnalytics =
    buildDailyAnalytics(
      sevenDayEvents,
      7,
    );

  const eventBreakdown = [
    "profile_view",
    "product_view",
    "service_view",
    "promotion_view",
    "website_click",
    "phone_click",
    "contact_click",
    "whatsapp_click",
    "social_click",
    "location_view",
  ].map((eventType) => ({
    eventType,
    label:
      EVENT_LABELS[eventType] ??
      eventType,
    count: analyticsQueriesFailed
      ? null
      : sevenDayEvents.filter(
          (event) =>
            event.event_type ===
            eventType,
        ).length,
  }));

  const requiredProfileFields = [
    business.name,
    business.description,
    business.country_code,
    business.phone,
    business.email,
  ];

  const completedFields =
    requiredProfileFields.filter(
      Boolean,
    ).length;

  const profileCompletion =
    Math.round(
      (completedFields /
        requiredProfileFields.length) *
        100,
    );

  let logoSignedUrl: string | null =
    null;

  if (business.logo_url) {
    if (
      business.logo_url.startsWith(
        "http://",
      ) ||
      business.logo_url.startsWith(
        "https://",
      )
    ) {
      logoSignedUrl =
        business.logo_url;
    } else {
      const { data: signedLogo } =
        await supabase.storage
          .from("business-logos")
          .createSignedUrl(
            business.logo_url,
            60 * 60,
          );

      logoSignedUrl =
        signedLogo?.signedUrl ?? null;
    }
  }

  const verificationStatus =
    business.verification_status;

  return (
    <main className="business-dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <Link
            href="/business/dashboard"
            className="dashboard-brand"
          >
            <span className="dashboard-brand-mark">
              IFC
            </span>

            <span>
              <strong>IFC</strong>
              <small>BIZGROWTH</small>
            </span>
          </Link>

          <nav className="dashboard-sidebar-nav">
            <Link
              href="/business/dashboard"
              className="dashboard-nav-link active"
            >
              <span>⌂</span>
              <span>Home</span>
            </Link>

            <Link
              href="/business/advertising"
              className="dashboard-nav-link"
            >
              <span>◈</span>
              <span>Campaigns</span>
            </Link>

            <Link
              href="/business/analytics"
              className="dashboard-nav-link"
            >
              <span>▥</span>
              <span>Analytics</span>
            </Link>

            <Link
              href="/business/profile"
              className="dashboard-nav-link"
            >
              <span>◎</span>
              <span>Business</span>
            </Link>

            <Link
              href="/business/products"
              className="dashboard-nav-link"
            >
              <span>□</span>
              <span>Products</span>
            </Link>

            <Link
              href="/business/services"
              className="dashboard-nav-link"
            >
              <span>◇</span>
              <span>Services</span>
            </Link>

            <Link
              href="/business/promotions"
              className="dashboard-nav-link"
            >
              <span>✦</span>
              <span>Promotions</span>
            </Link>

            <Link
              href="/business/marketing"
              className="dashboard-nav-link"
            >
              <span>✧</span>
              <span>Marketing</span>
            </Link>

            <Link
              href="/business/verification"
              className="dashboard-nav-link"
            >
              <span>✓</span>
              <span>Verification</span>
            </Link>
          </nav>

          <div className="dashboard-sidebar-bottom">
            <Link
              href="/business/settings"
              className="dashboard-nav-link"
            >
              <span>⚙</span>
              <span>Settings</span>
            </Link>
          </div>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="dashboard-topbar-title">
              <span>BUSINESS WORKSPACE</span>
              <h1>Dashboard</h1>
            </div>

            <div className="dashboard-topbar-actions">
              <Link
                href="/business/profile"
                className="dashboard-icon-button"
                aria-label="Business profile"
              >
                {logoSignedUrl ? (
                  <img
                    src={logoSignedUrl}
                    alt=""
                  />
                ) : (
                  getInitials(
                    business.name,
                  )
                )}
              </Link>
            </div>
          </header>

          <div className="dashboard-container">
            <section className="dashboard-welcome">
              <div>
                <span className="dashboard-eyebrow">
                  BUSINESS OVERVIEW
                </span>

                <h2>
                  Good day,{" "}
                  {business.name}
                </h2>

                <p>
                  Manage your presence,
                  understand your customer
                  activity and grow your
                  business on IFC BIZGROWTH.
                </p>
              </div>

              <div className="dashboard-welcome-actions">
                <Link
                  href="/business/analytics"
                  className="dashboard-secondary-button"
                >
                  View analytics
                </Link>

                <Link
                  href="/business/products"
                  className="dashboard-primary-button"
                >
                  Add product
                </Link>
              </div>
            </section>

            <section className="dashboard-business-card">
              <div className="dashboard-business-main">
                <div className="dashboard-business-avatar">
                  {logoSignedUrl ? (
                    <img
                      src={logoSignedUrl}
                      alt=""
                    />
                  ) : (
                    getInitials(
                      business.name,
                    )
                  )}
                </div>

                <div>
                  <div className="dashboard-business-name-row">
                    <h2>
                      {business.name}
                    </h2>

                    {business.verification_status ===
                      "approved" && (
                      <span className="verified-badge">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p>
                    {country?.name ??
                      business.country_code}
                  </p>
                </div>
              </div>

              <div className="dashboard-status-items">
                <div>
                  <span>Status</span>

                  <strong className="status-success">
                    {business.status ===
                    "active"
                      ? "Active"
                      : business.status}
                  </strong>
                </div>

                <div>
                  <span>Visibility</span>

                  <strong>
                    {business.is_public
                      ? "Public"
                      : "Private"}
                  </strong>
                </div>

                <div>
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
              </div>
            </section>

            {verificationStatus !==
              "approved" && (
              <section className="dashboard-verification-notice">
                <div className="dashboard-notice-icon">
                  !
                </div>

                <div>
                  <strong>
                    Complete business
                    verification
                  </strong>

                  <p>
                    Verification helps customers
                    identify your business as a
                    verified business on IFC
                    BIZGROWTH.
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
                  <span>→</span>
                </Link>
              </section>
            )}

            <section className="dashboard-stat-grid">
              <article className="dashboard-stat-card dashboard-stat-card--primary">
                <div className="dashboard-stat-icon">
                  ◉
                </div>

                <div>
                  <span>
                    Total views
                  </span>

                  <strong>
                    {totalViews === null
                      ? "—"
                      : formatNumber(
                          totalViews,
                        )}
                  </strong>

                  <small>
                    Business and product
                    visibility
                  </small>
                </div>
              </article>

              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon">
                  ↗
                </div>

                <div>
                  <span>
                    Interactions
                  </span>

                  <strong>
                    {totalInteractions ===
                    null
                      ? "—"
                      : formatNumber(
                          totalInteractions,
                        )}
                  </strong>

                  <small>
                    Customer actions
                  </small>
                </div>
              </article>

              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon">
                  □
                </div>

                <div>
                  <span>
                    Products
                  </span>

                  <strong>
                    {formatNumber(
                      productCount,
                    )}
                  </strong>

                  <small>
                    Products listed
                  </small>
                </div>
              </article>

              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon">
                  ◈
                </div>

                <div>
                  <span>
                    Active campaigns
                  </span>

                  <strong>
                    {formatNumber(
                      activeCampaignCount,
                    )}
                  </strong>

                  <small>
                    Currently active
                  </small>
                </div>
              </article>
            </section>

            <section className="dashboard-section-heading">
              <div>
                <span className="dashboard-panel-eyebrow">
                  REAL BUSINESS ANALYTICS
                </span>

                <h2>
                  Understand your business
                  activity
                </h2>

                <p>
                  These charts are generated from
                  actual customer interactions
                  recorded for your business.
                </p>
              </div>

              <Link
                href="/business/analytics"
                className="dashboard-text-link"
              >
                View full analytics →
              </Link>
            </section>

            <section className="dashboard-chart-grid">
              <AnalyticsLineChart
                data={dailyAnalytics}
                type="views"
              />

              <AnalyticsLineChart
                data={dailyAnalytics}
                type="interactions"
              />
            </section>

            <section className="dashboard-main-grid">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <span className="dashboard-panel-eyebrow">
                      BUSINESS PROFILE
                    </span>

                    <h2>
                      Build your presence
                    </h2>
                  </div>

                  <strong className="dashboard-profile-percent">
                    {profileCompletion}%
                  </strong>
                </div>

                <div className="dashboard-progress">
                  <span
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>

                <p className="dashboard-panel-description">
                  Complete the important parts of
                  your business profile so customers
                  can understand what you offer and
                  how to reach you.
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

                  <div className="dashboard-check dashboard-check--optional">
                    <span>
                      {business.website_url
                        ? "✓"
                        : "○"}
                    </span>

                    Website

                    <small>
                      Optional
                    </small>
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
                      BUSINESS TOOLS
                    </span>

                    <h2>
                      Grow your business
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

            <section className="dashboard-main-grid dashboard-main-grid--analytics">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <span className="dashboard-panel-eyebrow">
                      PERFORMANCE
                    </span>

                    <h2>
                      Activity breakdown
                    </h2>
                  </div>

                  <Link
                    href="/business/analytics"
                    className="dashboard-small-link"
                  >
                    Details →
                  </Link>
                </div>

                <div className="dashboard-breakdown">
                  {eventBreakdown.map(
                    (item) => {
                      const maxCount = Math.max(
                        ...eventBreakdown
                          .map(
                            (entry) =>
                              entry.count ??
                              0,
                          ),
                        1,
                      );

                      const percentage =
                        item.count === null
                          ? 0
                          : Math.round(
                              (item.count /
                                maxCount) *
                                100,
                            );

                      return (
                        <div
                          className="dashboard-breakdown-row"
                          key={item.eventType}
                        >
                          <div className="dashboard-breakdown-label">
                            <span>
                              {item.label}
                            </span>

                            <strong>
                              {item.count ===
                              null
                                ? "—"
                                : formatNumber(
                                    item.count,
                                  )}
                            </strong>
                          </div>

                          <div className="dashboard-breakdown-bar">
                            <span
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <span className="dashboard-panel-eyebrow">
                      RECENT ACTIVITY
                    </span>

                    <h2>
                      Latest customer activity
                    </h2>
                  </div>
                </div>

                {recentEvents.length ===
                0 ? (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">
                      ◌
                    </div>

                    <strong>
                      No recent activity
                    </strong>

                    <p>
                      Customer interactions with
                      your business will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-activity-feed">
                    {recentEvents.map(
                      (
                        event,
                        index,
                      ) => (
                        <div
                          className="dashboard-feed-item"
                          key={`${event.created_at}-${index}`}
                        >
                          <span className="dashboard-feed-icon">
                            {event.event_type.includes(
                              "view",
                            )
                              ? "◉"
                              : "↗"}
                          </span>

                          <div>
                            <strong>
                              {EVENT_LABELS[
                                event
                                  .event_type
                              ] ??
                                event.event_type}
                            </strong>

                            <small>
                              Recorded{" "}
                              {formatTime(
                                event.created_at,
                              )}
                            </small>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-bottom-grid">
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

                  <span>
                    Currency:{" "}
                    {country?.currency_code ??
                      "—"}
                  </span>
                </div>

                <Link
                  href="/business/profile"
                  className="dashboard-panel-button"
                >
                  Edit business
                </Link>
              </div>

              <div className="dashboard-panel dashboard-next-panel">
                <span className="dashboard-panel-eyebrow">
                  NEXT STEP
                </span>

                <h2>
                  Keep building your business
                </h2>

                <p>
                  Add more products and services,
                  keep your profile complete and
                  use your analytics to understand
                  how customers discover and interact
                  with your business.
                </p>

                <div className="dashboard-next-actions">
                  <Link
                    href="/business/analytics"
                    className="dashboard-primary-button"
                  >
                    View analytics
                  </Link>

                  <Link
                    href="/business/profile"
                    className="dashboard-secondary-button"
                  >
                    Manage profile
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="dashboard-mobile-nav">
        <Link
          href="/business/dashboard"
          className="dashboard-mobile-nav__item active"
        >
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link
          href="/business/advertising"
          className="dashboard-mobile-nav__item"
        >
          <span>◈</span>
          <small>Campaigns</small>
        </Link>

        <Link
          href="/business/analytics"
          className="dashboard-mobile-nav__item"
        >
          <span>▥</span>
          <small>Analytics</small>
        </Link>

        <Link
          href="/business/profile"
          className="dashboard-mobile-nav__item"
        >
          <span>◎</span>
          <small>Business</small>
        </Link>

        <Link
          href="/business/settings"
          className="dashboard-mobile-nav__item"
        >
          <span>☰</span>
          <small>More</small>
        </Link>
      </nav>
    </main>
  );
  }
