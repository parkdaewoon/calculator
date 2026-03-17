export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const id = isNonEmptyString(body?.id) ? body.id.trim() : "";
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!id || !deviceId) {
      return Response.json(
        { ok: false, error: "Missing id or device id" },
        { status: 400 }
      );
    }

    const { error, count } = await supabaseAdmin
      .from("calendar_events")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", deviceId);

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    if (!count) {
      return Response.json(
        { ok: false, error: "Event not found or not owned by this device" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}