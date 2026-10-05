"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function suspendBusiness(formData: FormData) {
  const businessId = String(
    formData.get("business_id") || "",
  ).trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    adminError ||
    !admin ||
    !admin.is_active
  ) {
    redirect("/admin/login");
  }

  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select("id, status")
      .eq("id", businessId)
      .maybeSingle();

  if (businessError) {
    console.error(
      "Unable to load business before suspension:",
      businessError,
    );

    throw new Error(
      "Unable to verify the business before suspension.",
    );
  }

  if (!business) {
    throw new Error("Business not found.");
  }

  if (business.status === "suspended") {
    redirect(`/admin/businesses/${businessId}`);
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      status: "suspended",
    })
    .eq("id", businessId);

  if (updateError) {
    console.error(
      "Business suspension failed:",
      updateError,
    );

    throw new Error(
      "Business could not be suspended.",
    );
  }

  redirect(`/admin/businesses/${businessId}`);
}
