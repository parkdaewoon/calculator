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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export async function GET() {
  return Response.json({ ok: true, route: "calendar-events/upsert alive" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";
    const id = isNonEmptyString(body?.id) ? body.id.trim() : "";

    if (!deviceId) {
      return Response.json(
        { ok: false, error: "Missing device id" },
        { status: 401 }
      );
    }

    if (!isValidIsoDate(body?.starts_at)) {
      return Response.json(
        { ok: false, error: "Invalid starts_at" },
        { status: 400 }
      );
    }

    if (body?.remind_at != null && !isValidIsoDate(body.remind_at)) {
      return Response.json(
        { ok: false, error: "Invalid remind_at" },
        { status: 400 }
      );
    }

    if (body?.title != null && typeof body.title !== "string") {
      return Response.json(
        { ok: false, error: "Invalid title" },
        { status: 400 }
      );
    }

    if (body?.type_main != null && typeof body.type_main !== "string") {
      return Response.json(
        { ok: false, error: "Invalid type_main" },
        { status: 400 }
      );
    }
if (body?.url != null && typeof body.url !== "string") {
      return Response.json(
        { ok: false, error: "Invalid url" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const remindAt =
      typeof body.remind_at === "string" ? body.remind_at : null;
    const typeMain =
      typeof body.type_main === "string" ? body.type_main.trim() : null;
const url = typeof body.url === "string" ? body.url.trim() || null : null;
    // 새 일정 생성
    if (!id) {
      const { data, error } = await supabaseAdmin
        .from("calendar_events")
        .insert({
          user_id: deviceId,
          title,
          starts_at: body.starts_at,
          remind_at: remindAt,
          reminder_sent: false,
          type_main: typeMain,
          url,
          updated_at: now,
        })
        .select("id")
        .single();

      if (error) {
        return Response.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      return Response.json({ ok: true, id: data.id, inserted: true });
    }

    // 기존 일정 수정 시도
    const { error, count } = await supabaseAdmin
      .from("calendar_events")
      .update(
        {
          title,
          starts_at: body.starts_at,
          remind_at: remindAt,
          reminder_sent: false,
          type_main: typeMain,
          url,
          updated_at: now,
        },
        { count: "exact" }
      )
      .eq("id", id)
      .eq("user_id", deviceId);

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // 못 찾았으면 새로 저장
    if (!count) {
      const { data, error: insertError } = await supabaseAdmin
        .from("calendar_events")
        .insert({
          user_id: deviceId,
          title,
          starts_at: body.starts_at,
          remind_at: remindAt,
          reminder_sent: false,
          type_main: typeMain,
          url,
          updated_at: now,
        })
        .select("id")
        .single();

      if (insertError) {
        return Response.json(
          { ok: false, error: insertError.message },
          { status: 500 }
        );
      }

      return Response.json({ ok: true, id: data.id, inserted: true, fallback: true });
    }

    return Response.json({ ok: true, id, updated: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}