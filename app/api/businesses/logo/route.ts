import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "business-logos";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function jsonError(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function getExtension(
  mimeType: string,
) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return null;
  }
}

function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server environment variables are not configured.",
    );
  }

  return createClient(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function getAuthenticatedBusiness() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      business: null,
      admin: null,
    };
  }

  const admin = createAdminClient();

  const {
    data: business,
    error: businessError,
  } = await admin
    .from("businesses")
    .select(
      `
        id,
        owner_id,
        name,
        logo_url
      `,
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error(
      "Business logo lookup failed:",
      businessError,
    );

    return {
      user,
      business: null,
      admin,
    };
  }

  return {
    user,
    business,
    admin,
  };
}

export async function POST(
  request: Request,
) {
  try {
    const {
      user,
      business,
      admin,
    } = await getAuthenticatedBusiness();

    if (!user) {
      return jsonError(
        "You must be logged in to update your business logo.",
        401,
      );
    }

    if (!business || !admin) {
      return jsonError(
        "Business profile not found.",
        404,
      );
    }

    const formData =
      await request.formData();

    const file = formData.get("logo");

    if (!(file instanceof File)) {
      return jsonError(
        "Please select a logo image.",
      );
    }

    if (!file.size) {
      return jsonError(
        "The selected logo is empty.",
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError(
        "Logo image must not be larger than 5 MB.",
      );
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type,
      )
    ) {
      return jsonError(
        "Only JPG, PNG, and WebP images are allowed.",
      );
    }

    const extension = getExtension(
      file.type,
    );

    if (!extension) {
      return jsonError(
        "Unsupported logo format.",
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(
      arrayBuffer,
    );

    const logoPath =
      `${business.id}/logo.${extension}`;

    const oldLogoPath =
      typeof business.logo_url ===
        "string" &&
      business.logo_url
        ? business.logo_url
        : null;

    const { error: uploadError } =
      await admin.storage
        .from(BUCKET)
        .upload(
          logoPath,
          buffer,
          {
            contentType: file.type,
            upsert: true,
            cacheControl:
              "3600",
          },
        );

    if (uploadError) {
      console.error(
        "Business logo upload failed:",
        uploadError,
      );

      return jsonError(
        "Unable to upload your logo right now. Please try again.",
        500,
      );
    }

    const { error: updateError } =
      await admin
        .from("businesses")
        .update({
          logo_url: logoPath,
        })
        .eq(
          "id",
          business.id,
        )
        .eq(
          "owner_id",
          user.id,
        );

    if (updateError) {
      console.error(
        "Business logo database update failed:",
        updateError,
      );

      await admin.storage
        .from(BUCKET)
        .remove([
          logoPath,
        ]);

      return jsonError(
        "Logo uploaded but could not be saved to your business profile.",
        500,
      );
    }

    if (
      oldLogoPath &&
      oldLogoPath !== logoPath &&
      !oldLogoPath.startsWith(
        "http://",
      ) &&
      !oldLogoPath.startsWith(
        "https://",
      )
    ) {
      const {
        error: deleteError,
      } = await admin.storage
        .from(BUCKET)
        .remove([
          oldLogoPath,
        ]);

      if (deleteError) {
        console.error(
          "Old business logo cleanup failed:",
          deleteError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Business logo updated successfully.",
      logo_path: logoPath,
    });
  } catch (error) {
    console.error(
      "Business logo POST error:",
      error,
    );

    return jsonError(
      "Something went wrong while updating your business logo.",
      500,
    );
  }
}

export async function DELETE() {
  try {
    const {
      user,
      business,
      admin,
    } = await getAuthenticatedBusiness();

    if (!user) {
      return jsonError(
        "You must be logged in.",
        401,
      );
    }

    if (!business || !admin) {
      return jsonError(
        "Business profile not found.",
        404,
      );
    }

    const logoPath =
      business.logo_url;

    if (!logoPath) {
      return NextResponse.json({
        success: true,
        message:
          "Your business does not currently have a logo.",
      });
    }

    if (
      !logoPath.startsWith(
        "http://",
      ) &&
      !logoPath.startsWith(
        "https://",
      )
    ) {
      const {
        error: deleteError,
      } = await admin.storage
        .from(BUCKET)
        .remove([
          logoPath,
        ]);

      if (deleteError) {
        console.error(
          "Business logo deletion failed:",
          deleteError,
        );

        return jsonError(
          "Unable to remove your business logo.",
          500,
        );
      }
    }

    const {
      error: updateError,
    } = await admin
      .from("businesses")
      .update({
        logo_url: null,
      })
      .eq(
        "id",
        business.id,
      )
      .eq(
        "owner_id",
        user.id,
      );

    if (updateError) {
      console.error(
        "Business logo removal database update failed:",
        updateError,
      );

      return jsonError(
        "The logo file was removed, but the profile could not be updated.",
        500,
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Business logo removed successfully.",
    });
  } catch (error) {
    console.error(
      "Business logo DELETE error:",
      error,
    );

    return jsonError(
      "Something went wrong while removing your business logo.",
      500,
    );
  }
}

export async function GET() {
  try {
    const {
      user,
      business,
      admin,
    } = await getAuthenticatedBusiness();

    if (!user) {
      return new NextResponse(
        "Unauthorized",
        { status: 401 },
      );
    }

    if (!business || !admin) {
      return new NextResponse(
        "Business not found",
        { status: 404 },
      );
    }

    const logoPath =
      business.logo_url;

    if (!logoPath) {
      return new NextResponse(
        "Logo not found",
        { status: 404 },
      );
    }

    /*
     * Backward compatibility:
     * If logo_url already contains a complete
     * external URL, redirect to it.
     */
    if (
      logoPath.startsWith(
        "http://",
      ) ||
      logoPath.startsWith(
        "https://",
      )
    ) {
      return NextResponse.redirect(
        logoPath,
      );
    }

    const {
      data: signedUrl,
      error: signedUrlError,
    } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(
        logoPath,
        60 * 10,
      );

    if (
      signedUrlError ||
      !signedUrl?.signedUrl
    ) {
      console.error(
        "Business logo signed URL failed:",
        signedUrlError,
      );

      return new NextResponse(
        "Unable to load logo",
        { status: 404 },
      );
    }

    return NextResponse.redirect(
      signedUrl.signedUrl,
    );
  } catch (error) {
    console.error(
      "Business logo GET error:",
      error,
    );

    return new NextResponse(
      "Unable to load logo",
      { status: 500 },
    );
  }
  }
