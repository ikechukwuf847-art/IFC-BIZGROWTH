import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./admin.css";

export const dynamic = "force-dynamic";

type AdminUser = {
  id: string;
  role: string;
  is_active: boolean;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle<AdminUser>();

  if (error || !admin || !admin.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">IFC</div>

          <div>
            <strong>IFC BIZGROWTH</strong>
            <span>Administration</span>
          </div>
        </div>

        <nav className="admin-navigation">
          <Link href="/admin">Dashboard</Link>

          <div className="admin-nav-group">
            <span>Businesses</span>
            <Link href="/admin/businesses">All Businesses</Link>
            <Link href="/admin/businesses/verification">
              Verification
            </Link>
            <Link href="/admin/businesses/members">Members</Link>
          </div>

          <div className="admin-nav-group">
            <span>Advertising</span>
            <Link href="/admin/advertising/campaigns">Campaigns</Link>
            <Link href="/admin/advertising/advertisements">
              Advertisements
            </Link>
            <Link href="/admin/advertising/packages">Packages</Link>
            <Link href="/admin/advertising/placements">
              Placements
            </Link>
            <Link href="/admin/advertising/creatives">Creatives</Link>
            <Link href="/admin/advertising/statistics">
              Statistics
            </Link>
          </div>

          <div className="admin-nav-group">
            <span>Payments</span>
            <Link href="/admin/payments/orders">Orders</Link>
            <Link href="/admin/payments/payments">Payments</Link>
            <Link href="/admin/payments/invoices">Invoices</Link>
            <Link href="/admin/payments/refunds">Refunds</Link>
          </div>

          <div className="admin-nav-group">
            <span>Marketing</span>
            <Link href="/admin/marketing/services">Services</Link>
            <Link href="/admin/marketing/plans">Plans</Link>
            <Link href="/admin/marketing/requests">Requests</Link>
          </div>

          <div className="admin-nav-group">
            <span>Platform</span>
            <Link href="/admin/reports">Reports</Link>
            <Link href="/admin/support">Support</Link>
            <Link href="/admin/admin-users">Admin Users</Link>
            <Link href="/admin/audit-logs">Audit Logs</Link>
            <Link href="/admin/countries">Countries</Link>
            <Link href="/admin/currencies">Currencies</Link>
            <Link href="/admin/exchange-rates">Exchange Rates</Link>
          </div>

          <div className="admin-nav-group">
            <span>Content</span>
            <Link href="/admin/content/blog">Blog</Link>
            <Link href="/admin/content/docs">Docs</Link>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <strong>{user.email}</strong>
            <span>{admin.role}</span>
          </div>

          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-logout-button">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">IFC BIZGROWTH</span>
            <strong>Administration</strong>
          </div>

          <div className="admin-topbar-user">
            <span>{user.email}</span>
            <span className="admin-role-badge">{admin.role}</span>
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}
