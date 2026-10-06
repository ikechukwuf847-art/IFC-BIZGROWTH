import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "business-logos";

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing logo path." },
        { status: 400 },
      );
    }

    const parts = path.split("/");

    if (parts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid logo path." },
        { status: 400 },
      );
    }

    const businessId = parts[0];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase server configuration.");

      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
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
      },
    );

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("logo_url", path)
      .eq("is_public", true)
      .eq("status", "active")
      .maybeSingle();

    if (businessError) {
      console.error("Business lookup error:", businessError);

      return NextResponse.json(
        { error: "Unable to verify business." },
        { status: 500 },
      );
    }

    if (!business) {
      return NextResponse.json(
        { error: "Logo not available." },
        { status: 404 },
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      console.error("Logo signing error:", error);

      return NextResponse.json(
        { error: "Unable to load logo." },
        { status: 500 },
      );
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Business logo route error:", error);

    return NextResponse.json(
      { error: "Unable to load logo." },
      { status: 500 },
    );
  }
}
