export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    const [{ data: settings, error: settingsError }, { data: subs, error: subsError }] =
      await Promise.all([
        supabaseAdmin
          .from("notification_settings")
          .select("user_id, push_enabled, updated_at")
          .eq("user_id", userId)
          .maybeSingle(),

        supabaseAdmin
          .from("push_subscriptions")
          .select("endpoint", { count: "exact" })
          .eq("user_id", userId)
          .eq("enabled", true)
          .limit(1),
      ]);

    if (settingsError) throw settingsError;
    if (subsError) throw subsError;

    const hasActiveSubscription = (subs?.length ?? 0) > 0;
    const pushEnabled = Boolean(settings?.push_enabled) && hasActiveSubscription;

    return Response.json({
      ok: true,
      data: {
        user_id: userId,
        push_enabled: pushEnabled,
        has_active_subscription: hasActiveSubscription,
        updated_at: settings?.updated_at ?? null,
      },
    });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, push_enabled } = body ?? {};

    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (typeof push_enabled !== "boolean") {
      return Response.json({ ok: false, error: "Missing push_enabled(boolean)" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error: settingsError } = await supabaseAdmin
      .from("notification_settings")
      .upsert(
        {
          user_id: userId,
          push_enabled,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );

    if (settingsError) throw settingsError;

    if (!push_enabled) {
      const { error: subsError } = await supabaseAdmin
        .from("push_subscriptions")
        .update({
          enabled: false,
          updated_at: now,
        })
        .eq("user_id", userId);

      if (subsError) throw subsError;
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}