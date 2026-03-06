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
    .select("user_id, code")
    .eq("date_ymd", ymd)
    .in("code", ["NIGHT", "DANG"]);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const uniqueUsers = new Map<string, string>();

  for (const row of data ?? []) {
    if (!uniqueUsers.has(row.user_id)) uniqueUsers.set(row.user_id, row.code);
  }

  let count = 0;
  for (const [userId, code] of uniqueUsers) {
    const { data: setting } = await supabaseAdmin
      .from("notification_settings")
      .select("push_enabled, shift_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (!setting?.push_enabled || !setting?.shift_enabled) continue;

    await sendPushToUser(userId, {
      title: "공무원 노트",
      body: code === "DANG" ? "내일은 당직 일정이 있어요." : "내일은 야간근무 일정이 있어요.",
      url: "/calendar",
    });

    count += 1;
  }

  return Response.json({ ok: true, count });
}