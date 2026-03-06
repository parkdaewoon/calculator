export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sender";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ymd = tomorrow.toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("user_schedules")
    .select("user_id, title")
    .eq("date_ymd", ymd)
    .eq("code", "LEAVE");

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const sentUsers = new Set<string>();
  let count = 0;

  for (const row of data ?? []) {
    if (sentUsers.has(row.user_id)) continue;

    const { data: setting } = await supabaseAdmin
      .from("notification_settings")
      .select("push_enabled, leave_enabled")
      .eq("user_id", row.user_id)
      .maybeSingle();

    if (!setting?.push_enabled || !setting?.leave_enabled) continue;

    await sendPushToUser(row.user_id, {
      title: "공무원 노트",
      body: "내일 연가 일정이 마무리돼요.",
      url: "/calendar",
    });

    sentUsers.add(row.user_id);
    count += 1;
  }

  return Response.json({ ok: true, count });
}