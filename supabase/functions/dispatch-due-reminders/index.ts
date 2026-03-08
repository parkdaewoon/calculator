// @ts-nocheck
/// <reference lib="deno.ns" />

import { createClient } from "npm:@supabase/supabase-js@2";

type CalendarEvent = {
  id: string;
  user_id: string;
  title: string | null;
  starts_at: string;
  remind_at: string | null;
  reminder_sent: boolean;
  type_main: string | null;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
};

function formatWhen(startsAtIso: string) {
  const d = new Date(startsAtIso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}월 ${dd}일 ${hh}:${mi}`;
}

Deno.serve(async (req: Request) => {
  try {
    const auth = req.headers.get("authorization");
    const expected = `Bearer ${Deno.env.get("CRON_EDGE_FUNCTION_TOKEN")}`;

    if (auth !== expected) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const bridgeUrl = Deno.env.get("WEB_PUSH_BRIDGE_URL");
    const bridgeSecret = Deno.env.get("WEB_PUSH_BRIDGE_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !bridgeUrl || !bridgeSecret) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing required environment variables",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const nowIso = new Date().toISOString();

    const { data: dueEvents, error: dueError } = await supabase
      .from("calendar_events")
      .select("id, user_id, title, starts_at, remind_at, reminder_sent, type_main")
      .not("remind_at", "is", null)
      .eq("reminder_sent", false)
      .lte("remind_at", nowIso)
      .limit(100);

    if (dueError) {
      console.error("dueEvents error:", dueError);
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "dueEvents",
          error: dueError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const results: Array<{ eventId: string; ok: boolean; reason?: string }> = [];

    for (const ev of (dueEvents ?? []) as CalendarEvent[]) {
      const body = ev.title
        ? `${ev.title} · ${formatWhen(ev.starts_at)}`
        : `일정 알림 · ${formatWhen(ev.starts_at)}`;

      const payload = {
        title: "일정 알림",
        body,
        url: "/calendar",
        tag: `event-${ev.id}`,
      };

      const { data: subs, error: subsError } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth, enabled")
        .eq("user_id", ev.user_id)
        .eq("enabled", true);

      if (subsError) {
        console.error("subs error:", ev.id, subsError);
        results.push({ eventId: ev.id, ok: false, reason: "subs query failed" });
        continue;
      }

      if (!subs || subs.length === 0) {
        const { error: markError } = await supabase
          .from("calendar_events")
          .update({ reminder_sent: true })
          .eq("id", ev.id);

        if (markError) {
          console.error("mark sent no-subs error:", ev.id, markError);
        }

        results.push({
          eventId: ev.id,
          ok: true,
          reason: "no subscriptions; marked sent",
        });
        continue;
      }

      let sent = false;

      for (const sub of subs as PushSubscriptionRow[]) {
        try {
          const resp = await fetch(bridgeUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-bridge-secret": bridgeSecret,
            },
            body: JSON.stringify({
              subscription: {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload,
            }),
          });

          if (resp.ok) {
            sent = true;
          } else {
            const text = await resp.text();
            console.error("push bridge failed:", ev.id, sub.id, text);
          }
        } catch (e) {
          console.error("push send exception:", ev.id, sub.id, e);
        }
      }

      if (sent) {
        const { error: markError } = await supabase
          .from("calendar_events")
          .update({ reminder_sent: true })
          .eq("id", ev.id);

        if (markError) {
          console.error("mark sent error:", ev.id, markError);
          results.push({ eventId: ev.id, ok: false, reason: "sent but mark failed" });
        } else {
          results.push({ eventId: ev.id, ok: true });
        }
      } else {
        results.push({ eventId: ev.id, ok: false, reason: "all sends failed" });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        nowIso,
        dueCount: dueEvents?.length ?? 0,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("dispatch-due-reminders fatal:", e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : "server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});