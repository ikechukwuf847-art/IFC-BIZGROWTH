import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* =========================================================
   CONFIGURATION
========================================================= */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* =========================================================
   AUTHENTICATION
   Supports:
   1. Website cookie authentication
   2. Mobile bearer-token authentication

   Both use the same Supabase project and user accounts.
========================================================= */

type AuthResult = {
  supabase: any;
  user: { id: string };
  error: null;
} | {
  supabase: null;
  user: null;
  error: string;
};

async function getAuthenticatedSupabase(
  request: Request,
): Promise<AuthResult> {
  const authorization = request.headers.get("authorization");

  /*
   * MOBILE AUTHENTICATION
   * Verify the access token with Supabase.
   */
  if (authorization !== null) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return {
        supabase: null,
        user: null,
        error: "Invalid authorization header.",
      };
    }

    const token = match[1].trim();

    if (!token) {
      return {
        supabase: null,
        user: null,
        error: "Your session is invalid. Please sign in again.",
      };
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    /*
     * This client uses the user's access token.
     * Database requests therefore run under that user's
     * Supabase identity and are subject to applicable RLS.
     */
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        supabase: null,
        user: null,
        error:
          "Your session is invalid or expired. Please sign in again.",
      };
    }

    return {
      supabase,
      user: { id: user.id },
      error: null,
    };
  }

  /*
   * WEBSITE AUTHENTICATION
   * Preserve the existing cookie-based login.
   */
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase: null,
      user: null,
      error: "You must be logged in.",
    };
  }

  return {
    supabase,
    user: { id: user.id },
    error: null,
  };
}

/* =========================================================
   HELPERS
========================================================= */

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

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

async function readJsonBody(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getString(
  body: Record<string, unknown>,
  key: string,
) {
  return typeof body[key] === "string"
    ? (body[key] as string).trim()
    : "";
}

function validateWebsiteUrl(websiteUrl: string) {
  if (!websiteUrl) {
    return true;
  }

  try {
    const website = new URL(websiteUrl);

    return (
      website.protocol === "http:" ||
      website.protocol === "https:"
    );
  } catch {
    return false;
  }
}

async function validateCountry(
  supabase: any,
  countryCode: string,
) {
  return await supabase
    .from("countries")
    .select("code")
    .eq("code", countryCode)
    .eq("is_african", true)
    .eq("is_active", true)
    .maybeSingle();
}

/* =========================================================
   POST — CREATE BUSINESS
========================================================= */

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedSupabase(request);

    if (!auth.supabase || !auth.user) {
      return jsonError(
        auth.error || "You must be logged in.",
        401,
      );
    }

    const supabase = auth.supabase;
    const user = auth.user;

    /*
     * Preserve the existing one-business-per-account behavior.
     */
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

      return jsonError(
        "Unable to check your existing business.",
        500,
      );
    }

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

    const body = await readJsonBody(request);

    if (!body) {
      return jsonError(
        "Please submit valid business information.",
        400,
      );
    }

    const name = getString(body, "name");
    const description = getString(body, "description");

    const countryCode = getString(
      body,
      "country_code",
    ).toUpperCase();

    const phone = getString(body, "phone");
    const email = getString(body, "email");
    const websiteUrl = getString(body, "website_url");

    /* ---------- VALIDATION ---------- */

    if (name.length < 2) {
      return jsonError(
        "Business name must contain at least 2 characters.",
        400,
      );
    }

    if (name.length > 150) {
      return jsonError(
        "Business name must not exceed 150 characters.",
        400,
      );
    }

    if (description.length > 5000) {
      return jsonError(
        "Business description must not exceed 5000 characters.",
        400,
      );
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return jsonError(
        "Please select a valid business country.",
        400,
      );
    }

    if (phone.length > 50) {
      return jsonError(
        "Phone number must not exceed 50 characters.",
        400,
      );
    }

    if (email.length > 255) {
      return jsonError(
        "Business email must not exceed 255 characters.",
        400,
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError(
        "Please provide a valid business email.",
        400,
      );
    }

    if (websiteUrl.length > 500) {
      return jsonError(
        "Website URL must not exceed 500 characters.",
        400,
      );
    }

    if (!validateWebsiteUrl(websiteUrl)) {
      return jsonError(
        "Please provide a valid website URL.",
        400,
      );
    }

    /* ---------- VALIDATE COUNTRY ---------- */

    const {
      data: country,
      error: countryError,
    } = await validateCountry(supabase, countryCode);

    if (countryError) {
      console.error(
        "Country validation failed:",
        countryError,
      );

      return jsonError(
        "Unable to validate the selected country.",
        500,
      );
    }

    if (!country) {
      return jsonError(
        "The selected country is not available.",
        400,
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

      /*
       * Do not expose raw database errors to the client.
       */
      return jsonError(
        "Unable to create your business right now.",
        500,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Business created successfully.",
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

    return jsonError(
      "Something went wrong while creating your business.",
      500,
    );
  }
}

/* =========================================================
   PATCH — UPDATE BUSINESS PROFILE
========================================================= */

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedSupabase(request);

    if (!auth.supabase || !auth.user) {
      return jsonError(
        auth.error || "You must be logged in.",
        401,
      );
    }

    const supabase = auth.supabase;
    const user = auth.user;

    const body = await readJsonBody(request);

    if (!body) {
      return jsonError(
        "Please submit valid business information.",
        400,
      );
    }

    const businessId = getString(body, "business_id");
    const name = getString(body, "name");
    const description = getString(body, "description");

    const countryCode = getString(
      body,
      "country_code",
    ).toUpperCase();

    const phone = getString(body, "phone");
    const email = getString(body, "email");
    const websiteUrl = getString(body, "website_url");

    const isPublic =
      typeof body.is_public === "boolean"
        ? body.is_public
        : null;

    /* ---------- VALIDATION ---------- */

    if (!businessId) {
      return jsonError(
        "Business ID is required.",
        400,
      );
    }

    if (name.length < 2) {
      return jsonError(
        "Business name must contain at least 2 characters.",
        400,
      );
    }

    if (name.length > 150) {
      return jsonError(
        "Business name must not exceed 150 characters.",
        400,
      );
    }

    if (description.length > 5000) {
      return jsonError(
        "Business description must not exceed 5000 characters.",
        400,
      );
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return jsonError(
        "Please select a valid business country.",
        400,
      );
    }

    if (phone.length > 50) {
      return jsonError(
        "Phone number must not exceed 50 characters.",
        400,
      );
    }

    if (email.length > 255) {
      return jsonError(
        "Business email must not exceed 255 characters.",
        400,
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError(
        "Please provide a valid business email.",
        400,
      );
    }

    if (websiteUrl.length > 500) {
      return jsonError(
        "Website URL must not exceed 500 characters.",
        400,
      );
    }

    if (!validateWebsiteUrl(websiteUrl)) {
      return jsonError(
        "Please provide a valid website URL.",
        400,
      );
    }

    /* ---------- VALIDATE COUNTRY ---------- */

    const {
      data: country,
      error: countryError,
    } = await validateCountry(supabase, countryCode);

    if (countryError) {
      console.error(
        "Country validation failed:",
        countryError,
      );

      return jsonError(
        "Unable to validate the selected country.",
        500,
      );
    }

    if (!country) {
      return jsonError(
        "The selected country is not available.",
        400,
      );
    }

    /* ---------- BUILD UPDATE ---------- */

    const updateData: Record<string, unknown> = {
      name,
      description: description || null,
      country_code: countryCode,
      phone: phone || null,
      email: email || null,
      website_url: websiteUrl || null,
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

      return jsonError(
        "Unable to update your business profile.",
        500,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Business profile updated successfully.",
      business,
    });
  } catch (error) {
    console.error(
      "Business PATCH API error:",
      error,
    );

    return jsonError(
      "Something went wrong while updating your business.",
      500,
    );
  }
}
