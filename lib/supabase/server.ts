import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url,
    key,
  };
}

export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseConfig();

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>,
      ) {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              cookieStore.set(
                name,
                value,
                options,
              );
            },
          );
        } catch {
          // Cookie changes may not be available
          // in some Server Component contexts.
        }
      },
    },
  });
            }
