import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const randomPart = crypto.randomUUID().slice(0, 8);

  return `${base || "business"}-${randomPart}`;
}

/* =========================================================
   POST — CREATE BUSINESS
========================================================= */

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    const {
      data: existingBusiness,
      error: existingError,
    } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, country_code, status, verification_status, is_public, website_url",
      )
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Existing business check failed:",
        existingError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to check your existing business.",
        },
        { status: 500 },
      );
    }

    /*
     * If this account already has a business,
     * send it to the dashboard instead of treating
     * the situation as an error.
     */
    if (existingBusiness) {
      return NextResponse.json(
        {
          success: true,
          code: "BUSINESS_ALREADY_EXISTS",
          message:
            "You already have a business on this account.",
          business: existingBusiness,
          next_step: "/business/dashboard",
        },
        { status: 200 },
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
        : "";

    const countryCode =
      typeof body.country_code === "string"
        ? body.country_code.trim().toUpperCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const websiteUrl =
      typeof body.website_url === "string"
        ? body.website_url.trim()
        : "";

    /* ---------- VALIDATION ---------- */

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business name must contain at least 2 characters.",
        },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business name must not exceed 150 characters.",
        },
        { status: 400 },
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business description must not exceed 5000 characters.",
        },
        { status: 400 },
      );
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please select a valid business country.",
        },
        { status: 400 },
      );
    }

    if (phone.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Phone number must not exceed 50 characters.",
        },
        { status: 400 },
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business email must not exceed 255 characters.",
        },
        { status: 400 },
      );
    }

    if (websiteUrl.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Website URL must not exceed 500 characters.",
        },
        { status: 400 },
      );
    }

    if (websiteUrl) {
      try {
        const website = new URL(websiteUrl);

        if (
          website.protocol !== "http:" &&
          website.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please provide a valid website URL.",
          },
          { status: 400 },
        );
      }
    }

    /* ---------- VALIDATE COUNTRY ---------- */

    const {
      data: country,
      error: countryError,
    } = await supabase
      .from("countries")
      .select("code")
      .eq("code", countryCode)
      .eq("is_african", true)
      .eq("is_active", true)
      .maybeSingle();

    if (countryError) {
      console.error(
        "Country validation failed:",
        countryError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to validate the selected country.",
        },
        { status: 500 },
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The selected country is not available.",
        },
        { status: 400 },
      );
    }

    /* ---------- CREATE BUSINESS ---------- */

    const slug = createSlug(name);

    const {
      data: business,
      error: insertError,
    } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        country_code: countryCode,
        phone: phone || null,
        email: email || null,
        website_url: websiteUrl || null,

        status: "active",
        verification_status: "not_submitted",
        is_public: true,
        is_featured: false,
      })
      .select(
        "id, name, slug, country_code, status, verification_status, is_public, website_url",
      )
      .single();

    if (insertError) {
      console.error(
        "Business creation failed:",
        insertError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to create your business right now.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Business created successfully.",
        business,
        next_step: "/business/dashboard",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Business POST API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while creating your business.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   PATCH — UPDATE BUSINESS PROFILE
========================================================= */

export async function PATCH(request: Request) {
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
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const businessId =
      typeof body.business_id === "string"
        ? body.business_id.trim()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const countryCode =
      typeof body.country_code === "string"
        ? body.country_code.trim().toUpperCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const websiteUrl =
      typeof body.website_url === "string"
        ? body.website_url.trim()
        : "";

    const isPublic =
      typeof body.is_public === "boolean"
        ? body.is_public
        : null;

    /* ---------- VALIDATION ---------- */

    if (!businessId) {
      return NextResponse.json(
        {
          success: false,
          error: "Business ID is required.",
        },
        { status: 400 },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business name must contain at least 2 characters.",
        },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business name must not exceed 150 characters.",
        },
        { status: 400 },
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business description must not exceed 5000 characters.",
        },
        { status: 400 },
      );
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please select a valid business country.",
        },
        { status: 400 },
      );
    }

    if (phone.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Phone number must not exceed 50 characters.",
        },
        { status: 400 },
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Business email must not exceed 255 characters.",
        },
        { status: 400 },
      );
    }

    if (websiteUrl.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Website URL must not exceed 500 characters.",
        },
        { status: 400 },
      );
    }

    if (websiteUrl) {
      try {
        const website =
          new URL(websiteUrl);

        if (
          website.protocol !== "http:" &&
          website.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please provide a valid website URL.",
          },
          { status: 400 },
        );
      }
    }

    /* ---------- VALIDATE COUNTRY ---------- */

    const {
      data: country,
      error: countryError,
    } = await supabase
      .from("countries")
      .select("code")
      .eq("code", countryCode)
      .eq("is_african", true)
      .eq("is_active", true)
      .maybeSingle();

    if (countryError) {
      console.error(
        "Country validation failed:",
        countryError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to validate the selected country.",
        },
        { status: 500 },
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The selected country is not available.",
        },
        { status: 400 },
      );
    }

    /* ---------- BUILD UPDATE ---------- */

    const updateData: Record<
      string,
      unknown
    > = {
      name,
      description:
        description || null,
      country_code: countryCode,
      phone: phone || null,
      email: email || null,
      website_url:
        websiteUrl || null,
    };

    if (isPublic !== null) {
      updateData.is_public = isPublic;
    }

    /* ---------- UPDATE BUSINESS ---------- */

    const {
      data: business,
      error: updateError,
    } = await supabase
      .from("businesses")
      .update(updateData)
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .select(
        "id, name, slug, description, email, phone, website_url, country_code, status, verification_status, is_public, is_featured",
      )
      .single();

    if (updateError) {
      console.error(
        "Business profile update failed:",
        updateError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to update your business profile.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Business profile updated successfully.",
      business,
    });
  } catch (error) {
    console.error(
      "Business PATCH API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while updating your business.",
      },
      { status: 500 },
    );
  }
      }
