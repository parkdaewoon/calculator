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

    if (!deviceId) {
      return Response.json({ ok: false, error: "Missing device id" }, { status: 401 });
    }

    const subscription = body?.subscription;
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;
    const deviceLabel = isNonEmptyString(body?.deviceLabel)
      ? body.deviceLabel.trim()
      : null;

    if (!isNonEmptyString(endpoint)) {
      return Response.json({ ok: false, error: "Missing subscription endpoint" }, { status: 400 });
    }

    if (!isNonEmptyString(p256dh) || !isNonEmptyString(auth)) {
      return Response.json({ ok: false, error: "Missing subscription keys" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: endpoint.trim(),
          user_id: deviceId,
          p256dh: p256dh.trim(),
          auth: auth.trim(),
          device_label: deviceLabel,
          enabled: true,
          last_seen_at: now,
          updated_at: now,
        },
        { onConflict: "endpoint" }
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