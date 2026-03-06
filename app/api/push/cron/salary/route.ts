export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sender";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const tomorrowDay = tomorrow.getDate();

  const { data, error } = await supabaseAdmin
    .from("notification_settings")
    .select("user_id, salary_day, salary_enabled, push_enabled")
    .eq("push_enabled", true)
    .eq("salary_enabled", true)
    .eq("salary_day", tomorrowDay);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  let count = 0;
  for (const row of data ?? []) {
    await sendPushToUser(row.user_id, {
      title: "공무원 노트",
      body: `내일은 급여일이에요.`,
      url: "/salary",
    });
    count += 1;
  }

  return Response.json({ ok: true, count });
}