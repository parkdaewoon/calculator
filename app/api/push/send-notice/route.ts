export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sender";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, url = "/" } = body ?? {};

    if (!title || !message) {
      return Response.json({ ok: false, error: "Missing title/message" }, { status: 400 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("notification_settings")
      .select("user_id, push_enabled")
      .eq("push_enabled", true);

    if (error) throw error;

    let count = 0;
    for (const user of users ?? []) {
      await sendPushToUser(user.user_id, {
        title,
        body: message,
        url,
      });
      count += 1;
    }

    return Response.json({ ok: true, count });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}