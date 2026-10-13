import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(
body: Record<string, unknown>,
status: number,
) {
return NextResponse.json(body, {
status,
headers: {
"Cache-Control": "no-store",
},
});
}

function getSupabaseConfig() {
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
throw new Error("Supabase server configuration is missing.");
}

return { url, anonKey, serviceRoleKey };
}

function getAdminClient() {
const { url, serviceRoleKey } = getSupabaseConfig();

return createClient(url, serviceRoleKey, {
auth: {
autoRefreshToken: false,
persistSession: false,
detectSessionInUrl: false,
},
});
}

function hasValidOrigin(request: Request): boolean {
const origin = request.headers.get("origin");

if (!origin) {
return false;
}

try {
return new URL(origin).origin === new URL(request.url).origin;
} catch {
return false;
}
}

export async function POST(request: Request) {
try {
// Reject cross-origin requests to this destructive endpoint.
if (!hasValidOrigin(request)) {
return jsonResponse(
{ error: "Invalid request origin." },
403,
);
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
  return jsonResponse(
    {
      error:
        'Enter your password and confirm by sending confirm: "DELETE".',
    },
    400,
  );
}

const supabase = await createSupabaseServerClient();

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user || !user.email) {
  return jsonResponse(
    {
      error:
        "Please sign in again before requesting account deletion.",
    },
    401,
  );
}

const { url, anonKey } = getSupabaseConfig();

// Use a separate client so password verification does not replace
// the user's existing cookie-based session.
const verificationClient = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const {
  data: verified,
  error: verificationError,
} = await verificationClient.auth.signInWithPassword({
  email: user.email,
  password: body.password,
});

if (
  verificationError ||
  !verified.user ||
  verified.user.id !== user.id
) {
  return jsonResponse(
    {
      error:
        "Password verification failed. No account deletion was performed.",
    },
    403,
  );
}

const admin = getAdminClient();

// Self-service deletion must never remove administrator accounts.
const {
  data: adminRecord,
  error: adminCheckError,
} = await admin
  .from("admin_users")
  .select("id")
  .eq("id", user.id)
  .maybeSingle();

if (adminCheckError) {
  return jsonResponse(
    { error: "Could not verify account permissions." },
    500,
  );
}

if (adminRecord) {
  return jsonResponse(
    {
      error:
        "Administrator accounts cannot be deleted through self-service.",
    },
    403,
  );
}

// Check that the account's business records can be inspected.
const {
  error: businessCheckError,
} = await admin
  .from("businesses")
  .select("id")
  .eq("owner_id", user.id)
  .limit(1);

if (businessCheckError) {
  return jsonResponse(
    {
      error:
        "Could not verify business records. No deletion was performed.",
    },
    500,
  );
}

/*
 * Storage deletion is deliberately not performed here.
 *
 * Before removing Storage objects, we must establish ownership,
 * verify the bucket and path, and ensure no remaining records
 * reference the same object.
 */

const {
  error: cleanupError,
} = await admin.rpc("prepare_account_deletion", {
  p_user_id: user.id,
});

if (cleanupError) {
  console.error(
    "Account deletion database cleanup failed:",
    cleanupError.message,
  );

  return jsonResponse(
    {
      error:
        "Database preparation failed. Your authentication account has not been deleted. Contact support before retrying.",
    },
    500,
  );
}

const {
  error: deleteUserError,
} = await admin.auth.admin.deleteUser(user.id);

if (deleteUserError) {
  console.error(
    "Supabase Auth deletion failed:",
    deleteUserError.message,
  );

  return jsonResponse(
    {
      error:
        "Database preparation completed, but authentication deletion failed. Contact support to complete the process.",
    },
    500,
  );
}

return jsonResponse(
  {
    success: true,
    message: "Your account has been permanently deleted.",
  },
  200,
);

} catch (error) {
console.error(
"Account deletion endpoint failed:",
error instanceof Error ? error.message : "Unknown error",
);

return jsonResponse(
  {
    error:
      "Account deletion could not be completed. Please contact support.",
  },
  500,
);

}
}
