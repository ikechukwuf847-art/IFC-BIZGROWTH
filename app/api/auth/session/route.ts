import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 },
      );
    }

    const body = await request.json();

    const accessToken =
      typeof body.access_token === "string" ? body.access_token : "";

    const refreshToken =
      typeof body.refresh_token === "string" ? body.refresh_token : "";

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing authentication tokens." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.headers
              .get("cookie")
              ?.split(";")
              .map((item) => {
                const index = item.indexOf("=");

                return {
                  name: index >= 0 ? item.slice(0, index).trim() : item.trim(),
                  value:
                    index >= 0
                      ? decodeURIComponent(item.slice(index + 1).trim())
                      : "",
                };
              }) ?? [];
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return NextResponse.json(
        {
          error: "Unable to create session.",
        },
        { status: 401 },
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid session request.",
      },
      { status: 400 },
    );
  }
        }
