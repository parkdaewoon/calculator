export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";

const REMINDER_LOOKBACK_MS = 60 * 1000;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function formatReminderWhen(startsAt: string | null | undefined) {
  if (!startsAt) return "";

  const dt = new Date(startsAt);
  if (Number.isNaN(dt.getTime())) return "";

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(dt);

  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";

  if (!month || !day || !hour || !minute) return "";

  return `${month}.${day}. ${hour}:${minute}`;
}

function buildPushBody(ev: {
  title?: string | null;
  starts_at?: string | null;
}) {
  const when = formatReminderWhen(ev?.starts_at);
  const title = String(ev?.title ?? "").trim() || "일정";

  if (!when) return title;

  return `(${when}) ${title}`;
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        {
          ok: false,
          error: "Unauthorized",
          got: auth,
          expectedExists: !!process.env.CRON_SECRET,
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const nowIso = now.toISOString();
    const windowStartIso = new Date(now.getTime() - REMINDER_LOOKBACK_MS).toISOString();

    const { data: dueEvents, error } = await supabaseAdmin
      .from("calendar_events")
      .select("id, user_id, title, starts_at, remind_at, reminder_sent, type_main")
      .not("remind_at", "is", null)
      .eq("reminder_sent", false)
      .gte("remind_at", windowStartIso)
      .lte("remind_at", nowIso);

    if (error) {
      console.error("dueEvents query failed", error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!dueEvents || dueEvents.length === 0) {
      return Response.json({ ok: true, sent: 0 });
    }

    let sent = 0;

    for (const ev of dueEvents) {
      try {
        const result = await sendPushToUser(ev.user_id, {
          title: "일정 놓치지 않기!!",
          body: buildPushBody(ev),
          url: "/calendar",
        });

        if (result.sent > 0) {
          await supabaseAdmin
            .from("calendar_events")
            .update({ reminder_sent: true })
            .eq("id", ev.id);

          sent += 1;
        } else {
          console.warn("push not sent", ev.id);
        }
      } catch (e) {
        console.error("push failed", ev.id, e);
      }
    }

    return Response.json({ ok: true, sent });
  } catch (e) {
    console.error("dispatch-due-reminders failed", e);
    return Response.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
