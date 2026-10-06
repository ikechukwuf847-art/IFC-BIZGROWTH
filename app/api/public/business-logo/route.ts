import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return new NextResponse("Missing logo path", {
        status: 400,
      });
    }

    const parts = path.split("/");

    if (parts.length !== 2) {
      return new NextResponse("Invalid logo path", {
        status: 400,
      });
    }

    const businessId = parts[0];

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Missing Supabase server environment variables."
      );

      return new NextResponse(
        "Server configuration error",
        {
          status: 500,
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: business, error: businessError } =
      await supabase
        .from("businesses")
        .select(
          "id, logo_url, is_public, status"
        )
        .eq("id", businessId)
        .eq("is_public", true)
        .eq("status", "active")
        .maybeSingle();

    if (businessError) {
      console.error(
        "Business lookup error:",
        businessError
      );

      return new NextResponse(
        "Unable to verify business",
        {
          status: 500,
        }
      );
    }

    if (!business) {
      return new NextResponse(
        "Business not found",
        {
          status: 404,
        }
      );
    }

    if (business.logo_url !== path) {
      console.error(
        "Logo path mismatch:",
        {
          databasePath: business.logo_url,
          requestedPath: path,
        }
      );

      return new NextResponse(
        "Logo path does not match business",
        {
          status: 404,
        }
      );
    }

    const {
      data: signedUrl,
      error: signedUrlError,
    } = await supabase.storage
      .from("business-logos")
      .createSignedUrl(path, 3600);

    if (signedUrlError || !signedUrl?.signedUrl) {
      console.error(
        "Unable to create signed logo URL:",
        signedUrlError
      );

      return new NextResponse(
        "Unable to load logo",
        {
          status: 500,
        }
      );
    }

    return NextResponse.redirect(
      signedUrl.signedUrl,
      302
    );
  } catch (error) {
    console.error(
      "Business logo route error:",
      error
    );

    return new NextResponse(
      "Internal server error",
      {
        status: 500,
      }
    );
  }
  }
