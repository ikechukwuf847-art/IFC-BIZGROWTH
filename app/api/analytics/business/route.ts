import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
"section_view",
"product_view",
"service_view",
"promotion_view",
"website_click",
"phone_click",
"contact_click",
"whatsapp_click",
"social_click",
"location_view",
"directions_click",
"email_click",
"share",
"share_click",
"share_menu_open",
"photo_click",
"photo_view",
"review_submit",
"review_submitted",
]);

const UUID_PATTERN =
/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_SIZE = 8192;
const MAX_METADATA_SIZE = 3000;
const MAX_SESSION_ID_LENGTH = 128;

function jsonError(message: string, status: number) {
return NextResponse.json(
{ success: false, error: message },
{
status,
headers: {
"Cache-Control": "no-store",
},
},
);
}

function isPlainObject(
value: unknown,
): value is Record<string, unknown> {
return (
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
);
}

export async function POST(request: NextRequest) {
if (!supabase) {
console.error(
"Business analytics is not configured. Check Supabase environment variables.",
);

return jsonError(
  "Analytics service is not configured.",
  500,
);

}

const contentType = request.headers.get("content-type") ?? "";

if (!contentType.toLowerCase().includes("application/json")) {
return jsonError(
"Content-Type must be application/json.",
415,
);
}

const contentLength = Number(
request.headers.get("content-length") ?? "0",
);

if (
Number.isFinite(contentLength) &&
contentLength > MAX_BODY_SIZE
) {
return jsonError("Request body is too large.", 413);
}

let rawBody: string;

try {
rawBody = await request.text();
} catch {
return jsonError("Unable to read request body.", 400);
}

if (rawBody.length === 0) {
return jsonError("Request body is required.", 400);
}

if (rawBody.length > MAX_BODY_SIZE) {
return jsonError("Request body is too large.", 413);
}

let body: unknown;

try {
body = JSON.parse(rawBody);
} catch {
return jsonError("Invalid JSON body.", 400);
}

if (!isPlainObject(body)) {
return jsonError("Invalid request body.", 400);
}

const businessId =
typeof body.business_id === "string"
? body.business_id.trim()
: "";

const eventType =
typeof body.event_type === "string"
? body.event_type.trim()
: "";

const visitorId =
typeof body.visitor_id === "string"
? body.visitor_id.trim()
: body.visitor_id == null
? null
: "";

const sessionId =
typeof body.session_id === "string"
? body.session_id.trim()
: body.session_id == null
? null
: "";

const metadata = isPlainObject(body.metadata)
? body.metadata
: body.metadata == null
? {}
: null;

if (!UUID_PATTERN.test(businessId)) {
return jsonError("Invalid business ID.", 400);
}

if (
visitorId !== null &&
(visitorId.length === 0 ||
!UUID_PATTERN.test(visitorId))
) {
return jsonError("Invalid visitor ID.", 400);
}

if (
eventType.length > 80 ||
!ALLOWED_EVENTS.has(eventType)
) {
return jsonError(
"Unsupported analytics event.",
400,
);
}

if (
sessionId !== null &&
(sessionId.length === 0 ||
sessionId.length > MAX_SESSION_ID_LENGTH)
) {
return jsonError("Invalid session ID.", 400);
}

if (metadata === null) {
return jsonError(
"Analytics metadata must be an object.",
400,
);
}

let metadataSize: number;

try {
metadataSize = JSON.stringify(metadata).length;
} catch {
return jsonError(
"Invalid analytics metadata.",
400,
);
}

if (metadataSize > MAX_METADATA_SIZE) {
return jsonError(
"Analytics metadata is too large.",
400,
);
}

try {
const { error } = await supabase.rpc(
"record_business_analytics",
{
p_business_id: businessId,
p_event_type: eventType,
p_visitor_id: visitorId,
p_session_id: sessionId,
p_metadata: metadata,
},
);

if (error) {
  console.error(
    "Business analytics recording failed:",
    error.message,
  );

  return jsonError(
    "Unable to record analytics event.",
    500,
  );
}

return NextResponse.json(
  { success: true },
  {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  },
);

} catch (error) {
console.error(
"Business analytics request failed:",
error,
);

return jsonError(
  "Unable to record analytics event.",
  500,
);

}
  }
