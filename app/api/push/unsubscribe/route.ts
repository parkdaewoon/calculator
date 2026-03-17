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

    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";
    const endpoint = isNonEmptyString(body?.endpoint) ? body.endpoint.trim() : "";

    if (!deviceId) {
      return Response.json(
        { ok: false, error: "Missing device id" },
        { status: 401 }
      );
    }

    if (!endpoint) {
      return Response.json(
        { ok: false, error: "Missing endpoint" },
        { status: 400 }
      );
    }

    const { error, count } = await supabaseAdmin
      .from("push_subscriptions")
      .update(
        {
          enabled: false,
          updated_at: new Date().toISOString(),
        },
        { count: "exact" }
      )
      .eq("endpoint", endpoint)
      .eq("user_id", deviceId);

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      found: !!count,
      alreadyDisabled: !count,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}