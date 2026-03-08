export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, subscription, deviceLabel } = body ?? {};

    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return Response.json({ ok: false, error: "Invalid subscription" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const payload = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      device_label: deviceLabel ?? null,
      enabled: true,
      last_seen_at: now,
      updated_at: now,
    };

    const { error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(payload, { onConflict: "endpoint" });

    if (subError) throw subError;

    const { error: settingsError } = await supabaseAdmin
      .from("notification_settings")
      .upsert(
        {
          user_id: userId,
          push_enabled: true,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );

    if (settingsError) throw settingsError;

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}