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

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!deviceId) {
      return Response.json({ ok: false, error: "Missing device id" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("notification_settings")
      .select("user_id, push_enabled, updated_at, endpoint")
      .eq("user_id", deviceId)
      .maybeSingle();

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      data: data ?? {
        user_id: deviceId,
        push_enabled: false,
        updated_at: null,
        endpoint: null,
      },
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!deviceId) {
      return Response.json({ ok: false, error: "Missing device id" }, { status: 401 });
    }

    if (typeof body?.push_enabled !== "boolean") {
      return Response.json({ ok: false, error: "Invalid push_enabled" }, { status: 400 });
    }

    const endpoint =
      typeof body?.endpoint === "string" && body.endpoint.trim().length > 0
        ? body.endpoint.trim()
        : null;

    const { error } = await supabaseAdmin
      .from("notification_settings")
      .upsert(
        {
          user_id: deviceId,
          push_enabled: body.push_enabled,
          endpoint,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}