export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...rest } = body ?? {};

    if (!userId) {
      return Response.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("notification_settings")
      .upsert({
        user_id: userId,
        ...rest,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}