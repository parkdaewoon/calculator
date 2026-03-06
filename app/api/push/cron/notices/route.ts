export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sender";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: notices, error } = await supabaseAdmin
    .from("notices")
    .select("*")
    .eq("published", true)
    .is("pushed_at", null)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!notices?.length) {
    return Response.json({ ok: true, count: 0 });
  }

  const { data: users, error: userError } = await supabaseAdmin
    .from("notification_settings")
    .select("user_id, push_enabled, notice_enabled")
    .eq("push_enabled", true)
    .eq("notice_enabled", true);

  if (userError) {
    return Response.json({ ok: false, error: userError.message }, { status: 500 });
  }

  let count = 0;

  for (const notice of notices) {
    for (const user of users ?? []) {
      await sendPushToUser(user.user_id, {
        title: notice.title,
        body: notice.body,
        url: notice.url || "/",
      });
      count += 1;
    }

    await supabaseAdmin
      .from("notices")
      .update({ pushed_at: new Date().toISOString() })
      .eq("id", notice.id);
  }

  return Response.json({ ok: true, count });
}