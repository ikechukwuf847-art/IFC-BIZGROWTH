import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Verification = {
  id: string;
  business_name: string;
  status: string;
  created_at: string;
};

type Report = {
  id: string;
  target_type: string;
  reason: string;
  status: string;
  created_at: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "pending") {
    return "admin-status admin-status-pending";
  }

  if (normalized === "open" || normalized === "new") {
    return "admin-status admin-status-open";
  }

  if (
    normalized === "approved" ||
    normalized === "resolved" ||
    normalized === "completed"
  ) {
    return "admin-status admin-status-approved";
  }

  if (
    normalized === "rejected" ||
    normalized === "closed" ||
    normalized === "failed"
  ) {
    return "admin-status admin-status-rejected";
  }

  return "admin-status admin-status-default";
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    adminUsersResult,
    verificationResult,
    reportsResult,
    supportResult,
    recentVerificationResult,
    recentReportsResult,
    recentSupportResult,
  ] = await Promise.all([
    supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("business_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),

    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),

    supabase
      .from("business_verifications")
      .select("id, business_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("reports")
      .select("id, target_type, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("support_tickets")
      .select("id, subject, category, priority, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const activeAdmins = adminUsersResult.count ?? 0;
  const pendingVerifications = verificationResult.count ?? 0;
  const openReports = reportsResult.count ?? 0;
  const openSupportTickets = supportResult.count ?? 0;

  const verifications =
    (recentVerificationResult.data as Verification[] | null) ?? [];

  const reports = (recentReportsResult.data as Report[] | null) ?? [];

  const supportTickets =
    (recentSupportResult.data as SupportTicket[] | null) ?? [];

  return (
    <>
      <header className="admin-page-header">
        <h1>Dashboard</h1>
        <p>
          Monitor the areas of IFC BIZGROWTH currently available to
          administrators.
        </p>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-label">Active administrators</div>
          <div className="admin-stat-value">{activeAdmins}</div>
          <div className="admin-stat-note">
            Active records in admin_users
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Pending verifications</div>
          <div className="admin-stat-value">{pendingVerifications}</div>
          <div className="admin-stat-note">
            Business verification requests awaiting review
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Open reports</div>
          <div className="admin-stat-value">{openReports}</div>
          <div className="admin-stat-note">
            Reports currently marked open
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-label">Open support tickets</div>
          <div className="admin-stat-value">{openSupportTickets}</div>
          <div className="admin-stat-note">
            Support tickets currently marked open
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent verification requests</h2>
            <Link href="/admin/businesses/verification">
              View all
            </Link>
          </div>

          <div className="admin-panel-body">
            {verifications.length === 0 ? (
              <div className="admin-empty">
                No verification requests found.
              </div>
            ) : (
              <div className="admin-list">
                {verifications.map((verification) => (
                  <div
                    className="admin-list-item"
                    key={verification.id}
                  >
                    <div className="admin-list-title">
                      {verification.business_name}
                    </div>

                    <div className="admin-list-meta">
                      {formatDate(verification.created_at)}
                    </div>

                    <div style={{ marginTop: 7 }}>
                      <span
                        className={statusClass(verification.status)}
                      >
                        {verification.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent reports</h2>
            <Link href="/admin/reports">View all</Link>
          </div>

          <div className="admin-panel-body">
            {reports.length === 0 ? (
              <div className="admin-empty">
                No reports found.
              </div>
            ) : (
              <div className="admin-list">
                {reports.map((report) => (
                  <div className="admin-list-item" key={report.id}>
                    <div className="admin-list-title">
                      {report.reason}
                    </div>

                    <div className="admin-list-meta">
                      {report.target_type} ·{" "}
                      {formatDate(report.created_at)}
                    </div>

                    <div style={{ marginTop: 7 }}>
                      <span className={statusClass(report.status)}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent support tickets</h2>
            <Link href="/admin/support">View all</Link>
          </div>

          <div className="admin-panel-body">
            {supportTickets.length === 0 ? (
              <div className="admin-empty">
                No support tickets found.
              </div>
            ) : (
              <div className="admin-list">
                {supportTickets.map((ticket) => (
                  <div
                    className="admin-list-item"
                    key={ticket.id}
                  >
                    <div className="admin-list-title">
                      {ticket.subject}
                    </div>

                    <div className="admin-list-meta">
                      {ticket.category} · {ticket.priority} ·{" "}
                      {formatDate(ticket.created_at)}
                    </div>

                    <div style={{ marginTop: 7 }}>
                      <span className={statusClass(ticket.status)}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <h2>Administration</h2>
          </div>

          <div className="admin-panel-body">
            <div className="admin-list">
              <div className="admin-list-item">
                <div className="admin-list-title">
                  Business verification
                </div>
                <div className="admin-list-meta">
                  Review submitted business verification requests.
                </div>
              </div>

              <div className="admin-list-item">
                <div className="admin-list-title">
                  Reports
                </div>
                <div className="admin-list-meta">
                  Review platform reports and their resolution status.
                </div>
              </div>

              <div className="admin-list-item">
                <div className="admin-list-title">
                  Support
                </div>
                <div className="admin-list-meta">
                  Manage incoming support tickets and assignments.
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
  }
