import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./businesses.css";

export const dynamic = "force-dynamic";

type SearchParams = {
  tab?: string;
};

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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
    redirect("/admin/login");
  }

  const params = await searchParams;
  const tab = params.tab || "businesses";

  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, status, is_public, created_at, owner_id, country_code"
    )
    .order("created_at", { ascending: false });

  const { data: verifications } = await supabase
    .from("business_verifications")
    .select(
      "id, business_id, status, submitted_by, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  const { data: members } = await supabase
    .from("business_members")
    .select("id, business_id, user_id, role, created_at")
    .order("created_at", { ascending: false });

  const businessMap = new Map(
    (businesses ?? []).map((business) => [
      business.id,
      business,
    ])
  );

  return (
    <main className="business-admin-page">
      <header className="business-admin-header">
        <div>
          <p className="business-admin-eyebrow">
            BUSINESS MANAGEMENT
          </p>

          <h1>Businesses</h1>

          <p>
            Manage businesses, verification and business members.
          </p>
        </div>

        <a href="/admin" className="business-back-link">
          ← Dashboard
        </a>
      </header>

      <nav className="business-tabs">
        <a
          href="/admin/businesses?tab=businesses"
          className={
            tab === "businesses"
              ? "business-tab active"
              : "business-tab"
          }
        >
          All Businesses
        </a>

        <a
          href="/admin/businesses?tab=verification"
          className={
            tab === "verification"
              ? "business-tab active"
              : "business-tab"
          }
        >
          Verification
        </a>

        <a
          href="/admin/businesses?tab=members"
          className={
            tab === "members"
              ? "business-tab active"
              : "business-tab"
          }
        >
          Members
        </a>
      </nav>

      {tab === "businesses" && (
        <section className="business-section">
          <div className="business-section-header">
            <div>
              <h2>All Businesses</h2>
              <span>
                {businesses?.length ?? 0} businesses
              </span>
            </div>
          </div>

          <div className="business-table-wrapper">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Country</th>
                  <th>Public</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {(businesses ?? []).map((business) => (
                  <tr key={business.id}>
                    <td>
                      <strong>{business.name}</strong>
                      <small>{business.slug}</small>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${business.status}`}
                      >
                        {business.status}
                      </span>
                    </td>

                    <td>
                      {business.country_code || "—"}
                    </td>

                    <td>
                      {business.is_public ? "Yes" : "No"}
                    </td>

                    <td>
                      {formatDate(business.created_at)}
                    </td>
                  </tr>
                ))}

                {!businesses?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="empty-cell"
                    >
                      No businesses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "verification" && (
        <section className="business-section">
          <div className="business-section-header">
            <div>
              <h2>Business Verification</h2>
              <span>
                {verifications?.length ?? 0} submissions
              </span>
            </div>
          </div>

          <div className="business-table-wrapper">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Submitted</th>
                  <th>Updated</th>
                </tr>
              </thead>

              <tbody>
                {(verifications ?? []).map((verification) => {
                  const business = businessMap.get(
                    verification.business_id
                  );

                  return (
                    <tr key={verification.id}>
                      <td>
                        <strong>
                          {business?.name ||
                            "Unknown business"}
                        </strong>

                        <small>
                          {verification.business_id}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${verification.status}`}
                        >
                          {verification.status}
                        </span>
                      </td>

                      <td>
                        {verification.submitted_by || "—"}
                      </td>

                      <td>
                        {formatDate(
                          verification.created_at
                        )}
                      </td>

                      <td>
                        {formatDate(
                          verification.updated_at
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!verifications?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="empty-cell"
                    >
                      No verification submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "members" && (
        <section className="business-section">
          <div className="business-section-header">
            <div>
              <h2>Business Members</h2>
              <span>
                {members?.length ?? 0} members
              </span>
            </div>
          </div>

          <div className="business-table-wrapper">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {(members ?? []).map((member) => {
                  const business = businessMap.get(
                    member.business_id
                  );

                  return (
                    <tr key={member.id}>
                      <td>
                        <strong>
                          {business?.name ||
                            "Unknown business"}
                        </strong>
                      </td>

                      <td>
                        <small>{member.user_id}</small>
                      </td>

                      <td>
                        <span className="role-badge">
                          {member.role}
                        </span>
                      </td>

                      <td>
                        {formatDate(member.created_at)}
                      </td>
                    </tr>
                  );
                })}

                {!members?.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="empty-cell"
                    >
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
  }
