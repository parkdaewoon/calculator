export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, endpoint } = body ?? {};

    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (endpoint) {
      const { error: subError } = await supabaseAdmin
        .from("push_subscriptions")
        .update({
          enabled: false,
          updated_at: now,
        })
        .eq("endpoint", endpoint);

      if (subError) throw subError;
    } else {
      const { error: subError } = await supabaseAdmin
        .from("push_subscriptions")
        .update({
          enabled: false,
          updated_at: now,
        })
        .eq("user_id", userId);

      if (subError) throw subError;
    }

    const { error: settingsError } = await supabaseAdmin
      .from("notification_settings")
      .upsert(
        {
          user_id: userId,
          push_enabled: false,
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