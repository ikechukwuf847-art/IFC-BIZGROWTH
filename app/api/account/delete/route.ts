import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StorageFile = {
  bucket: string;
  path: string;
};

type StorageReference = {
  bucket: string;
  value: string | null;
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
) {
  return NextResponse.json(body, { status });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Server-side Supabase administrative configuration is missing.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Accepts either a plain storage path or a Supabase Storage URL.
 * External URLs are ignored because they are not owned Storage objects
 */
function resolveStorageReference(
  reference: StorageReference,
): StorageFile | null {
  const value = reference.value?.trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    let parsed: URL;

    try {
      parsed = new URL(value);
    } catch {
      return null;
    }

    const match = parsed.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
    );

    if (!match) {
      return null;
    }

    let bucket: string;
    let path: string;

    try {
      bucket = decodeURIComponent(match[1]);
      path = decodeURIComponent(match[2]);
    } catch {
      return null;
    }

    return path
      ? { bucket, path }
      : null;
  }

  // Plain paths are accepted only when the caller supplies
  // the known bucket associated with that database column.
  return {
    bucket: reference.bucket,
    path: value.replace(/^\/+/, ""),
  };
}

function addStorageReference(
  files: Map<string, StorageFile>,
  reference: StorageReference,
) {
  const file = resolveStorageReference(reference);

  if (!file || !file.path) {
    return;
  }

  const key = `${file.bucket}\0${file.path}`;

  files.set(key, file);
}

function addDocumentReferences(
  files: Map<string, StorageFile>,
  documents: unknown,
) {
  if (!Array.isArray(documents)) {
    return;
  }

  for (const document of documents) {
    if (typeof document === "string") {
      addStorageReference(files, {
        bucket: "business-verification",
        value: document,
      });
      continue;
    }

    if (
      document &&
      typeof document === "object" &&
      "url" in document &&
      typeof document.url === "string"
    ) {
      // Only recognized Supabase Storage URLs are accepted here.
      addStorageReference(files, {
        bucket: "business-verification",
        value: document.url,
      });
    }
  }
}

async function collectBusinessStorageFiles(
  admin: ReturnType<typeof getAdminClient>,
  businessIds: string[],
): Promise<StorageFile[]> {
  const files = new Map<string, StorageFile>();

  if (businessIds.length === 0) {
    return [];
  }

  const businessesResult = await admin
    .from("businesses")
    .select("id, logo_url")
    .in("id", businessIds);

  if (businessesResult.error) {
    throw new Error("Could not inspect business logo references.");
  }

  for (const business of businessesResult.data ?? []) {
    if (!business.logo_url) continue;

    // URL values identify their actual bucket.
    // A plain path is assumed to belong to business-logos.
    addStorageReference(files, {
      bucket: "business-logos",
      value: business.logo_url,
    });
  }

  const mediaResult = await admin
    .from("business_media")
    .select("storage_path")
    .in("business_id", businessIds);

  if (mediaResult.error) {
    throw new Error("Could not inspect business media references.");
  }

  for (const media of mediaResult.data ?? []) {
    addStorageReference(files, {
      bucket: "business-media",
      value: media.storage_path,
    });
  }

  const productsResult = await admin
    .from("business_products")
    .select("image_path")
    .in("business_id", businessIds);

  if (productsResult.error) {
    throw new Error("Could not inspect product image references.");
  }

  for (const product of productsResult.data ?? []) {
    addStorageReference(files, {
      bucket: "product-media",
      value: product.image_path,
    });
  }

  const servicesResult = await admin
    .from("business_services")
    .select("image_path")
    .in("business_id", businessIds);

  if (servicesResult.error) {
    throw new Error("Could not inspect service image references.");
  }

  for (const service of servicesResult.data ?? []) {
    addStorageReference(files, {
      bucket: "product-media",
      value: service.image_path,
    });
  }

  const promotionsResult = await admin
    .from("business_promotions")
    .select("image_path")
    .in("business_id", businessIds);

  if (promotionsResult.error) {
    throw new Error("Could not inspect promotion image references.");
  }

  for (const promotion of promotionsResult.data ?? []) {
    addStorageReference(files, {
      bucket: "business-media",
      value: promotion.image_path,
    });
  }

  const verificationsResult = await admin
    .from("business_verifications")
    .select("document_urls")
    .in("business_id", businessIds);

  if (verificationsResult.error) {
    throw new Error("Could not inspect verification file references.");
  }

  for (const verification of verificationsResult.data ?? []) {
    addDocumentReferences(files, verification.document_urls);
  }

  // Advertising files belonging to this account's businesses.
  const campaignsResult = await admin
    .from("ad_campaigns")
    .select("id")
    .in("business_id", businessIds);

  if (campaignsResult.error) {
    throw new Error("Could not inspect advertising campaigns.");
  }

  const campaignIds = (campaignsResult.data ?? []).map(
    (campaign) => campaign.id as string,
  );

  if (campaignIds.length > 0) {
    const advertisementsResult = await admin
      .from("advertisements")
      .select("id")
      .in("campaign_id", campaignIds);

    if (advertisementsResult.error) {
      throw new Error("Could not inspect advertisements.");
    }

    const advertisementIds = (
      advertisementsResult.data ?? []
    ).map((advertisement) => advertisement.id as string);

    if (advertisementIds.length > 0) {
      const creativesResult = await admin
        .from("ad_creatives")
        .select("storage_path")
        .in("advertisement_id", advertisementIds);

      if (creativesResult.error) {
        throw new Error("Could not inspect advertising creatives.");
      }

      for (const creative of creativesResult.data ?? []) {
        addStorageReference(files, {
          bucket: "ad-creatives",
          value: creative.storage_path,
        });
      }
    }
  }

  // Marketing files are attached to requests belonging to these businesses.
  const requestsResult = await admin
    .from("marketing_service_requests")
    .select("id")
    .in("business_id", businessIds);

  if (requestsResult.error) {
    throw new Error("Could not inspect marketing requests.");
  }

  const requestIds = (requestsResult.data ?? []).map(
    (request) => request.id as string,
  );

  if (requestIds.length > 0) {
    const marketingFilesResult = await admin
      .from("marketing_service_files")
      .select("storage_path")
      .in("request_id", requestIds);

    if (marketingFilesResult.error) {
      throw new Error("Could not inspect marketing file references.");
    }

    for (const file of marketingFilesResult.data ?? []) {
      addStorageReference(files, {
        bucket: "marketing-files",
        value: file.storage_path,
      });
    }
  }

  return Array.from(files.values());
}

async function removeStorageFiles(
  admin: ReturnType<typeof getAdminClient>,
  files: StorageFile[],
) {
  const grouped = new Map<string, string[]>();

  for (const file of files) {
    const paths = grouped.get(file.bucket) ?? [];
    paths.push(file.path);
    grouped.set(file.bucket, paths);
  }

  for (const [bucket, paths] of grouped) {
    // Keep batches small enough for the Storage API.
    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);

      const { error } = await admin.storage
        .from(bucket)
        .remove(batch);

      if (error) {
        throw new Error(
          `Storage cleanup failed for bucket "${bucket}".`,
        );
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.password !== "string" ||
      body.password.length === 0 ||
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
        { error: "Please sign in again before deleting your account." },
        401,
      );
    }

    // Verify the user's password before performing destructive operations.
    const {
      data: reauthenticated,
      error: reauthenticationError,
    } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.password,
    });

    if (
      reauthenticationError ||
      !reauthenticated.user ||
      reauthenticated.user.id !== user.id
    ) {
      return jsonResponse(
        { error: "The password is incorrect. No deletion was performed." },
        403,
      );
    }

    const admin = getAdminClient();

    // The SQL cleanup function also rejects administrator accounts.
    const { data: adminRecord, error: adminCheckError } = await admin
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

    // Retrieve every business owned by this account.
    const { data: businesses, error: businessesError } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id);

    if (businessesError) {
      return jsonResponse(
        { error: "Could not inspect owned businesses." },
        500,
      );
    }

    const businessIds = (businesses ?? []).map(
      (business) => business.id as string,
    );

    // Collect Storage references before database cleanup removes them.
    const storageFiles = await collectBusinessStorageFiles(
      admin,
      businessIds,
    );

    // Remove files before removing the database references.
    // If Storage cleanup fails, do not continue to Auth deletion.
    await removeStorageFiles(admin, storageFiles);

    // Prepare database records for permanent Auth deletion.
    const { error: cleanupError } = await admin.rpc(
      "prepare_account_deletion",
      {
        p_user_id: user.id,
      },
    );

    if (cleanupError) {
      console.error(
        "Account deletion database cleanup failed:",
        cleanupError.message,
      );

      return jsonResponse(
        {
          error:
            "Database cleanup failed. Your authentication account has not been deleted. Contact support before retrying.",
        },
        500,
      );
    }

    // This is the operation that permanently deletes the Supabase Auth user.
    const { error: deleteUserError } =
      await admin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error(
        "Supabase Auth account deletion failed:",
        deleteUserError.message,
      );

      return jsonResponse(
        {
          error:
            "The database cleanup completed, but authentication deletion failed. Contact support to complete account deletion.",
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
          "Account deletion could not be completed. No success has been reported.",
      },
      500,
    );
  }
}
