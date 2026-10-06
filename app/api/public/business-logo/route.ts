import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const path =
      request.nextUrl.searchParams.get("path");

    if (!path) {
      return new NextResponse(
        "Missing logo path.",
        {
          status: 400,
        },
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        "Missing Supabase server environment variables.",
      );

      return new NextResponse(
        "Server configuration error.",
        {
          status: 500,
        },
      );
    }

    /*
     * Expected storage path:
     *
     * business_id/logo.jpg
     *
     * Example:
     * a8219d77-4572-47e6-a8da-62bcfa9ca698/logo.jpg
     */

    const pathParts =
      path.split("/");

    if (pathParts.length !== 2) {
      return new NextResponse(
        "Invalid logo path.",
        {
          status: 400,
        },
      );
    }

    const businessId =
      pathParts[0];

    const filePath =
      pathParts[1];

    if (
      !businessId ||
      !filePath
    ) {
      return new NextResponse(
        "Invalid logo path.",
        {
          status: 400,
        },
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    /*
     * Make sure the business is actually
     * public and active before exposing
     * its logo.
     */
    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        "id, logo_url, is_public, status",
      )
      .eq(
        "id",
        businessId,
      )
      .maybeSingle();

    if (businessError) {
      console.error(
        "Unable to verify business logo:",
        businessError,
      );

      return new NextResponse(
        "Unable to verify business.",
        {
          status: 500,
        },
      );
    }

    if (!business) {
      return new NextResponse(
        "Business not found.",
        {
          status: 404,
        },
      );
    }

    if (
      business.is_public !== true ||
      business.status !== "active"
    ) {
      return new NextResponse(
        "Business is not publicly available.",
        {
          status: 404,
        },
      );
    }

    /*
     * Make sure the requested file is
     * actually the business' registered logo.
     */
    if (
      business.logo_url !== path
    ) {
      return new NextResponse(
        "Logo does not belong to this business.",
        {
          status: 403,
        },
      );
    }

    /*
     * Create a temporary signed URL
     * for the private Storage object.
     */
    const {
      data: signedUrlData,
      error: signedUrlError,
    } = await supabase.storage
      .from("business-logos")
      .createSignedUrl(
        path,
        60 * 60,
      );

    if (signedUrlError) {
      console.error(
        "Unable to create signed logo URL:",
        signedUrlError,
      );

      return new NextResponse(
        "Unable to load business logo.",
        {
          status: 404,
        },
      );
    }

    if (
      !signedUrlData?.signedUrl
    ) {
      return new NextResponse(
        "Logo URL was not generated.",
        {
          status: 404,
        },
      );
    }

    return NextResponse.redirect(
      signedUrlData.signedUrl,
      {
        status: 302,
      },
    );
  } catch (error) {
    console.error(
      "Business logo route error:",
      error,
    );

    return new NextResponse(
      "Unable to load business logo.",
      {
        status: 500,
      },
    );
  }
        }
