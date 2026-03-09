export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";

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

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    console.log("[dispatch] auth header =", auth);
    console.log("[dispatch] expected =", `Bearer ${process.env.CRON_SECRET}`);
    console.log("[dispatch] has cron secret =", !!process.env.CRON_SECRET);

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

    const nowIso = new Date().toISOString();

    const { data: dueEvents, error } = await supabaseAdmin
      .from("calendar_events")
      .select("id, user_id, title, starts_at, remind_at, reminder_sent, type_main")
      .not("remind_at", "is", null)
      .eq("reminder_sent", false)
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
      title: "일정 알림",
      body: ev.title ?? "예정된 일정이 있어요.",
      url: "/calendar",
    });

    if (result.sent > 0) {
      await supabaseAdmin
        .from("calendar_events")
        .update({ reminder_sent: true })
        .eq("id", ev.id);

      sent += 1;
    } else {
      console.warn("No push sent for event", ev.id, result);
    }
  } catch (e) {
    console.error("sendPushToUser failed", ev.id, e);
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