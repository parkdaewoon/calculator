export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const nowIso = new Date().toISOString();

    const { data: dueEvents, error } = await supabaseAdmin
      .from("calendar_events")
      .select("id, user_id, title, starts_at, remind_at, reminder_sent, type_main")
      .not("remind_at", "is", null)
      .eq("reminder_sent", false)
      .lte("remind_at", nowIso)
      .order("remind_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    let count = 0;
    let failed = 0;

    for (const ev of dueEvents ?? []) {
      try {
        const startsAt = new Date(ev.starts_at);
        const month = String(startsAt.getMonth() + 1).padStart(2, "0");
        const day = String(startsAt.getDate()).padStart(2, "0");
        const hh = String(startsAt.getHours()).padStart(2, "0");
        const mm = String(startsAt.getMinutes()).padStart(2, "0");

        const isSalary =
          String(ev.type_main ?? "") === "SALARY" ||
          String(ev.title ?? "").includes("월급");

        const pushResult = await sendPushToUser(ev.user_id, {
          title: "공무원 노트",
          body: isSalary
            ? "월급 확인하기!!"
            : `(일정) ${ev.title ?? "일정"}\n일정 놓치지 않기!! (${month}.${day}. ${hh}:${mm})`,
          url: "/calendar",
        });

        console.log("[dispatch] result", {
          eventId: ev.id,
          userId: ev.user_id,
          pushResult,
        });

        await supabaseAdmin
          .from("calendar_events")
          .update({
            reminder_sent: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ev.id);

        count += 1;
      } catch (err) {
        console.error("dispatch reminder failed:", ev.id, err);
        failed += 1;
      }
    }

    return Response.json({
      ok: true,
      count,
      failed,
      dueCount: dueEvents?.length ?? 0,
    });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}