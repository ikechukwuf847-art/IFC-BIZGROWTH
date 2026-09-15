import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random()
    .toString(36)
    .slice(2, 8);

  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to create a business.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const countryCode =
      typeof body.country_code === "string"
        ? body.country_code
            .trim()
            .toUpperCase()
        : "NG";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    const websiteUrl =
      typeof body.website_url === "string"
        ? body.website_url.trim()
        : null;

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Business name must be at least 2 characters.",
        },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          error:
            "Business name is too long.",
        },
        { status: 400 },
      );
    }

    if (countryCode.length !== 2) {
      return NextResponse.json(
        {
          error: "Invalid country code.",
        },
        { status: 400 },
      );
    }

    const slug = createSlug(name);

    const { data: business, error } =
      await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name,
          slug,
          description,
          country_code: countryCode,
          email,
          phone,
          website_url: websiteUrl,
          status: "active",
          verification_status:
            "not_submitted",
          is_public: true,
        })
        .select("id, name, slug")
        .single();

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to create your business.",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        business,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your business.",
      },
      { status: 500 },
    );
  }
  }
