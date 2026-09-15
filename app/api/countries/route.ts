import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("countries")
      .select(
        "code, name, official_name, currency_code",
      )
      .eq("is_african", true)
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Countries query failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load countries.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      countries: data ?? [],
    });
  } catch (error) {
    console.error(
      "Countries API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load countries.",
      },
      { status: 500 },
    );
  }
            }
