import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request: Request) {
  const url = new URL(request.url);

  const pathname = url.pathname;

  const isProtectedRoute =
    pathname === "/business" ||
    pathname.startsWith("/business/");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie");

          if (!cookieHeader) {
            return [];
          }

          return cookieHeader.split(";").map((item) => {
            const index = item.indexOf("=");

            return {
              name:
                index >= 0
                  ? item.slice(0, index).trim()
                  : item.trim(),

              value:
                index >= 0
                  ? decodeURIComponent(
                      item.slice(index + 1).trim(),
                    )
                  : "",
            };
          });
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              request.headers.set(
                "cookie",
                `${name}=${value}`,
              );

              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL(
      "/login",
      request.url,
    );

    loginUrl.searchParams.set(
      "next",
      pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/business/:path*",
  ],
};
