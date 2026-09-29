import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const [
    businessesResult,
    verificationResult,
    campaignsResult,
    paymentOrdersResult,
    marketingRequestsResult,
    reportsResult,
    supportResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("business_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("ad_campaigns")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("payment_orders")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("marketing_service_requests")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("reports")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Businesses",
      value: businessesResult.count ?? 0,
      href: "/admin/businesses",
    },
    {
      label: "Pending Verification",
      value: verificationResult.count ?? 0,
      href: "/admin/businesses?tab=verification",
    },
    {
      label: "Advertising Campaigns",
      value: campaignsResult.count ?? 0,
      href: "/admin/advertising",
    },
    {
      label: "Payment Orders",
      value: paymentOrdersResult.count ?? 0,
      href: "/admin/payments",
    },
    {
      label: "Marketing Requests",
      value: marketingRequestsResult.count ?? 0,
      href: "/admin/marketing",
    },
    {
      label: "Reports",
      value: reportsResult.count ?? 0,
      href: "/admin?section=reports",
    },
    {
      label: "Support Tickets",
      value: supportResult.count ?? 0,
      href: "/admin?section=support",
    },
  ];

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-logo">IFC</div>

          <div>
            <strong>IFC BIZGROWTH</strong>
            <span>Administration</span>
          </div>
        </div>

        <nav className="admin-nav">
          <a href="/admin" className="admin-nav-item active">
            Dashboard
          </a>

          <a href="/admin/businesses" className="admin-nav-item">
            Businesses
          </a>

          <a href="/admin/advertising" className="admin-nav-item">
            Advertising
          </a>

          <a href="/admin/payments" className="admin-nav-item">
            Payments
          </a>

          <a href="/admin/marketing" className="admin-nav-item">
            Marketing
          </a>

          <div className="admin-nav-divider" />

          <a href="/admin?section=reports" className="admin-nav-item">
            Reports
          </a>

          <a href="/admin?section=support" className="admin-nav-item">
            Support
          </a>

          <a href="/admin?section=admin-users" className="admin-nav-item">
            Admin Users
          </a>

          <a href="/admin?section=audit-logs" className="admin-nav-item">
            Audit Logs
          </a>

          <a href="/admin?section=settings" className="admin-nav-item">
            Settings
          </a>

          <a href="/admin?section=content" className="admin-nav-item">
            Content
          </a>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">
              Overview of IFC BIZGROWTH activity.
            </p>
          </div>

          <div className="admin-user">
            <span className="admin-user-email">{user.email}</span>
            <span className="admin-user-role">Administrator</span>
          </div>
        </header>

        <section className="admin-stats">
          {stats.map((stat) => (
            <a
              href={stat.href}
              className="admin-stat-card"
              key={stat.label}
            >
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </a>
          ))}
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Business Management</h2>
                <p>
                  Manage businesses, verification and members.
                </p>
              </div>

              <a href="/admin/businesses">Open</a>
            </div>

            <div className="admin-panel-links">
              <a href="/admin/businesses">
                <strong>All Businesses</strong>
                <span>View and manage businesses</span>
              </a>

              <a href="/admin/businesses?tab=verification">
                <strong>Verification</strong>
                <span>Review business verification</span>
              </a>

              <a href="/admin/businesses?tab=members">
                <strong>Members</strong>
                <span>Manage business members</span>
              </a>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Advertising</h2>
                <p>
                  Manage the business advertising system.
                </p>
              </div>

              <a href="/admin/advertising">Open</a>
            </div>

            <div className="admin-panel-links">
              <a href="/admin/advertising?tab=campaigns">
                <strong>Campaigns</strong>
                <span>Advertising campaigns</span>
              </a>

              <a href="/admin/advertising?tab=advertisements">
                <strong>Advertisements</strong>
                <span>Manage advertisements</span>
              </a>

              <a href="/admin/advertising?tab=statistics">
                <strong>Statistics</strong>
                <span>Advertising performance</span>
              </a>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Payments</h2>
                <p>
                  Monitor orders, payments, invoices and refunds.
                </p>
              </div>

              <a href="/admin/payments">Open</a>
            </div>

            <div className="admin-panel-links">
              <a href="/admin/payments?tab=orders">
                <strong>Orders</strong>
                <span>Payment orders</span>
              </a>

              <a href="/admin/payments?tab=payments">
                <strong>Payments</strong>
                <span>Completed payments</span>
              </a>

              <a href="/admin/payments?tab=refunds">
                <strong>Refunds</strong>
                <span>Refund management</span>
              </a>
            </div>
          </div>

          <div className="admin-panel admin-panel-marketing">
            <div className="admin-panel-header">
              <div>
                <h2>Marketing</h2>
                <p>
                  Manage IFC BIZGROWTH marketing services and requests.
                </p>
              </div>

              <a href="/admin/marketing">Open</a>
            </div>

            <div className="admin-panel-links">
              <a href="/admin/marketing?tab=services">
                <strong>Services</strong>
                <span>Marketing services</span>
              </a>

              <a href="/admin/marketing?tab=plans">
                <strong>Plans</strong>
                <span>Marketing campaign plans</span>
              </a>

              <a href="/admin/marketing?tab=requests">
                <strong>Requests</strong>
                <span>Business marketing requests</span>
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
    }
