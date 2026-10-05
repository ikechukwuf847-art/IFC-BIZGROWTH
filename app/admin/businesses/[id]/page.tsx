import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./business-details.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_code: string;
  status:
    | "draft"
    | "pending_review"
    | "active"
    | "suspended"
    | "rejected"
    | "closed";
  verification_status: string;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Country = {
  code: string;
  name: string;
  official_name: string | null;
};

type Location = {
  id: string;
  business_id: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_id: string | null;
};

type Member = {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "active":
      return "business-status business-status-active";

    case "suspended":
      return "business-status business-status-suspended";

    case "pending_review":
      return "business-status business-status-pending";

    case "rejected":
      return "business-status business-status-rejected";

    case "closed":
      return "business-status business-status-closed";

    default:
      return "business-status business-status-default";
  }
}

export default async function AdminBusinessDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, is_active, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    redirect("/admin/login");
  }

  const businessResult = await supabase
    .from("businesses")
    .select(
      `
        id,
        owner_id,
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
        is_featured,
        is_public,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .maybeSingle<Business>();

  if (businessResult.error) {
    console.error("Business details error:", businessResult.error);
  }

  if (!businessResult.data) {
    notFound();
  }

  const business = businessResult.data;

  const [
    countryResult,
    locationsResult,
    membersResult,
    servicesResult,
    productsResult,
  ] = await Promise.all([
    supabase
      .from("countries")
      .select("code, name, official_name")
      .eq("code", business.country_code)
      .maybeSingle<Country>(),

    supabase
      .from("business_locations")
      .select(
        `
          id,
          business_id,
          address_line_1,
          address_line_2,
          city,
          state_region,
          postal_code,
          country_id
        `,
      )
      .eq("business_id", business.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("business_members")
      .select("id, user_id, role, joined_at")
      .eq("business_id", business.id)
      .order("joined_at", { ascending: true }),

    supabase
      .from("business_services")
      .select("id, name, description")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true })
      .limit(10),

    supabase
      .from("business_products")
      .select("id, name, description")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true })
      .limit(10),
  ]);

  const country = countryResult.data;

  const locations = (locationsResult.data ?? []) as Location[];
  const members = (membersResult.data ?? []) as Member[];
  const services = (servicesResult.data ?? []) as Service[];
  const products = (productsResult.data ?? []) as Product[];

  return (
    <div className="business-details-page">
      <div className="business-details-breadcrumb">
        <Link href="/admin/businesses">Businesses</Link>
        <span>/</span>
        <span>{business.name}</span>
      </div>

      <header className="business-details-header">
        <div className="business-heading">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={`${business.name} logo`}
              className="business-logo"
            />
          ) : (
            <div className="business-logo business-logo-placeholder">
              {business.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="business-title-row">
              <h1>{business.name}</h1>

              <span className={statusClass(business.status)}>
                {business.status.replace("_", " ")}
              </span>
            </div>

            <p className="business-slug">
              /{business.slug}
            </p>
          </div>
        </div>

        <div className="business-actions">
          <Link
            href={`/admin/businesses/${business.id}/edit`}
            className="business-button business-button-secondary"
          >
            Edit business
          </Link>

          {business.status !== "suspended" &&
            business.status !== "closed" && (
              <Link
                href={`/admin/businesses/${business.id}/suspend`}
                className="business-button business-button-danger"
              >
                Suspend business
              </Link>
            )}
        </div>
      </header>

      <div className="business-details-grid">
        <section className="business-card business-card-wide">
          <div className="business-card-header">
            <h2>Business information</h2>
          </div>

          <div className="business-card-body">
            <div className="business-description">
              <span>Description</span>
              <p>
                {business.description || "No description provided."}
              </p>
            </div>

            <div className="business-info-grid">
              <div>
                <span>Email</span>
                <strong>
                  {business.email || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {business.phone || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Website</span>
                {business.website_url ? (
                  <a
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {business.website_url}
                  </a>
                ) : (
                  <strong>Not provided</strong>
                )}
              </div>

              <div>
                <span>Country</span>
                <strong>
                  {country?.name || business.country_code}
                </strong>
              </div>

              <div>
                <span>Verification</span>
                <strong>
                  {business.verification_status.replace(
                    "_",
                    " ",
                  )}
                </strong>
              </div>

              <div>
                <span>Public listing</span>
                <strong>
                  {business.is_public ? "Yes" : "No"}
                </strong>
              </div>

              <div>
                <span>Featured</span>
                <strong>
                  {business.is_featured ? "Yes" : "No"}
                </strong>
              </div>

              <div>
                <span>Owner ID</span>
                <strong className="business-id">
                  {business.owner_id}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="business-card">
          <div className="business-card-header">
            <h2>Record</h2>
          </div>

          <div className="business-card-body">
            <div className="business-record-row">
              <span>Business ID</span>
              <strong className="business-id">
                {business.id}
              </strong>
            </div>

            <div className="business-record-row">
              <span>Created</span>
              <strong>
                {formatDate(business.created_at)}
              </strong>
            </div>

            <div className="business-record-row">
              <span>Last updated</span>
              <strong>
                {formatDate(business.updated_at)}
              </strong>
            </div>
          </div>
        </section>

        <section className="business-card">
          <div className="business-card-header">
            <h2>Locations</h2>
          </div>

          <div className="business-card-body">
            {locations.length === 0 ? (
              <p className="business-empty">
                No locations found.
              </p>
            ) : (
              <div className="business-list">
                {locations.map((location) => (
                  <div
                    className="business-list-item"
                    key={location.id}
                  >
                    <strong>
                      {[
                        location.address_line_1,
                        location.address_line_2,
                        location.city,
                        location.state_region,
                        location.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Location details unavailable"}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="business-card">
          <div className="business-card-header">
            <h2>Members</h2>
            <Link href="/admin/businesses/members">
              Manage
            </Link>
          </div>

          <div className="business-card-body">
            {members.length === 0 ? (
              <p className="business-empty">
                No members found.
              </p>
            ) : (
              <div className="business-list">
                {members.map((member) => (
                  <div
                    className="business-list-item"
                    key={member.id}
                  >
                    <strong>{member.role}</strong>
                    <span className="business-list-meta">
                      {member.user_id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="business-card">
          <div className="business-card-header">
            <h2>Services</h2>
          </div>

          <div className="business-card-body">
            {services.length === 0 ? (
              <p className="business-empty">
                No services found.
              </p>
            ) : (
              <div className="business-list">
                {services.map((service) => (
                  <div
                    className="business-list-item"
                    key={service.id}
                  >
                    <strong>{service.name}</strong>
                    {service.description && (
                      <span className="business-list-meta">
                        {service.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="business-card">
          <div className="business-card-header">
            <h2>Products</h2>
          </div>

          <div className="business-card-body">
            {products.length === 0 ? (
              <p className="business-empty">
                No products found.
              </p>
            ) : (
              <div className="business-list">
                {products.map((product) => (
                  <div
                    className="business-list-item"
                    key={product.id}
                  >
                    <strong>{product.name}</strong>
                    {product.description && (
                      <span className="business-list-meta">
                        {product.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
  }
