import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { suspendBusiness } from "./actions";
import "./suspend.css";

export const dynamic = "force-dynamic";

type Business = {
  id: string;
  name: string;
  status:
    | "draft"
    | "pending_review"
    | "active"
    | "suspended"
    | "rejected"
    | "closed";
};

export default async function SuspendBusinessPage({
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
    .select("id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    redirect("/admin/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, status")
    .eq("id", id)
    .maybeSingle<Business>();

  if (!business) {
    notFound();
  }

  if (business.status === "suspended") {
    redirect(`/admin/businesses/${business.id}`);
  }

  return (
    <main className="suspend-page">
      <section className="suspend-card">
        <div className="suspend-icon">!</div>

        <h1>Suspend business?</h1>

        <p>
          You are about to suspend{" "}
          <strong>{business.name}</strong>.
        </p>

        <p className="suspend-warning">
          A suspended business will no longer appear in public
          business discovery because public business access requires
          the business status to be active.
        </p>

        <div className="suspend-actions">
          <Link
            href={`/admin/businesses/${business.id}`}
            className="suspend-cancel"
          >
            Cancel
          </Link>

          <form action={suspendBusiness}>
            <input
              type="hidden"
              name="business_id"
              value={business.id}
            />

            <button type="submit" className="suspend-confirm">
              Confirm suspension
            </button>
          </form>
        </div>
      </section>
    </main>
  );
  }
