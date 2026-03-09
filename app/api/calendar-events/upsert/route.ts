export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    console.log("[upsert] incoming body", {
      id: body.id,
      title: body.title,
      starts_at: body.starts_at,
      remind_at: body.remind_at,
      reminderMinutes: body.reminderMinutes,
      type_main: body.type_main,
    });

    const startsAtMs = body.starts_at ? new Date(body.starts_at).getTime() : NaN;
const remindAtMs = body.remind_at ? new Date(body.remind_at).getTime() : NaN;

const safeRemindAt =
  Number.isFinite(startsAtMs) &&
  Number.isFinite(remindAtMs) &&
  remindAtMs <= startsAtMs
    ? new Date(remindAtMs).toISOString()
    : null;

console.log("[upsert] incoming body", {
  id: body.id,
  title: body.title,
  starts_at: body.starts_at,
  remind_at: body.remind_at,
  safeRemindAt,
  reminderMinutes: body.reminderMinutes,
  type_main: body.type_main,
});

const { error } = await supabaseAdmin.from("calendar_events").upsert({
  id: body.id,
  user_id: body.user_id,
  title: body.title,
  starts_at: body.starts_at,
  remind_at: safeRemindAt,
  reminder_sent: false,
  type_main: body.type_main,
  updated_at: new Date().toISOString(),
});

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}