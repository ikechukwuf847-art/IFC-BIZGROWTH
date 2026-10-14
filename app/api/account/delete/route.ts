import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respond(
  body: Record<string, unknown>,
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase configuration is missing.");
  }

  return { url, anonKey, serviceRoleKey };
}

function getAdminClient() {
  const { url, serviceRoleKey } = getConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function validOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!validOrigin(request)) {
      return respond({ error: "Invalid request origin." }, 403);
    }

    const body: unknown = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      !("password" in body) ||
      typeof body.password !== "string" ||
      body.password.length === 0 ||
      !("confirm" in body) ||
      body.confirm !== "DELETE"
    ) {
      return respond(
        { error: 'Enter your password and type "DELETE" to confirm.' },
        400,
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return respond(
        { error: "Please sign in again before deleting your account." },
        401,
      );
    }

    const { url, anonKey } = getConfig();

    const verifier = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { data: verification, error: verificationError } =
      await verifier.auth.signInWithPassword({
        email: user.email,
        password: body.password,
      });

    if (
      verificationError ||
      verification.user?.id !== user.id
    ) {
      return respond(
        { error: "Password verification failed. No deletion was performed." },
        403,
      );
    }

    const admin = getAdminClient();

    const { data: adminRecord, error: adminCheckError } = await admin
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (adminCheckError) {
      return respond(
        { error: "Could not verify account permissions." },
        500,
      );
    }

    if (adminRecord) {
      return respond(
        { error: "Administrator accounts cannot self-delete." },
        403,
      );
    }

    // Prepare dependent records before deleting the Auth account.
    const { error: preparationError } = await admin.rpc(
      "prepare_account_deletion",
      { p_user_id: user.id },
    );

    if (preparationError) {
      console.error(
        "Account deletion preparation failed:",
        preparationError.message,
      );

      return respond(
        {
          error:
            "Account preparation failed. Your authentication account was not deleted.",
        },
        500,
      );
    }

    const { error: deletionError } =
      await admin.auth.admin.deleteUser(user.id);

    if (deletionError) {
      console.error(
        "Auth account deletion failed:",
        deletionError.message,
      );

      return respond(
        {
          error:
            "Account deletion could not be completed. Some related records may already have changed. Please contact support before retrying.",
        },
        500,
      );
    }

    // The businesses_owner_fk ON DELETE CASCADE constraint
    // removes businesses owned by this account automatically.

    return respond(
      {
        success: true,
        message: "Your account has been permanently deleted.",
      },
      200,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("[ACCOUNT_DELETE_ERROR]", message);

    return respond(
      {
        error: "Account deletion failed. Please contact support.",
        code: "ACCOUNT_DELETE_ERROR",
      },
      500,
    );
  }
}
