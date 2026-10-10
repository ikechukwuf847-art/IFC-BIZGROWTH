import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

const ALLOWED_EVENTS = new Set([
  "profile_view",
  "website_click",
  "phone_click",
  "whatsapp_click",
  "directions_click",
  "share",
  "product_view",
  "service_view",
  "promotion_view",
  "review_submit",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return jsonError("Analytics service is not configured.", 500);
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const businessId =
    typeof body.business_id === "string" ? body.business_id : "";

  const eventType =
    typeof body.event_type === "string" ? body.event_type : "";

  const visitorId =
    typeof body.visitor_id === "string" ? body.visitor_id : null;

  const sessionId =
    typeof body.session_id === "string" ? body.session_id : null;

  const metadata =
    body.metadata &&
    typeof body.metadata === "object" &&
    !Array.isArray(body.metadata)
      ? body.metadata
      : {};

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(businessId)) {
    return jsonError("Invalid business ID.", 400);
  }

  if (visitorId && !uuidPattern.test(visitorId)) {
    return jsonError("Invalid visitor ID.", 400);
  }

  if (
    !ALLOWED_EVENTS.has(eventType) ||
    eventType.length > 80
  ) {
    return jsonError("Unsupported analytics event.", 400);
  }

  if (sessionId && sessionId.length > 128) {
    return jsonError("Invalid session ID.", 400);
  }

  if (JSON.stringify(metadata).length > 3000) {
    return jsonError("Analytics metadata is too large.", 400);
  }

  const { error } = await supabase.rpc("record_business_analytics", {
    p_business_id: businessId,
    p_event_type: eventType,
    p_visitor_id: visitorId,
    p_session_id: sessionId,
    p_metadata: metadata,
  });

  if (error) {
    console.error("Business analytics recording failed:", error.message);
    return jsonError("Unable to record analytics event.", 500);
  }

  return NextResponse.json({ success: true });
  }
