export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint } = body ?? {};

    if (!endpoint) {
      return Response.json({ ok: false, error: "Missing endpoint" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .update({
        enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", endpoint);

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}