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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!deviceId) {
      return Response.json(
        { ok: false, error: "Missing device id" },
        { status: 401 }
      );
    }

    const [{ data: workModeRow, error: workModeError }, { data: reminderRow, error: reminderError }] =
      await Promise.all([
        supabaseAdmin
          .from("user_work_modes")
          .select("user_id, work_mode, updated_at")
          .eq("user_id", deviceId)
          .maybeSingle(),
        supabaseAdmin
          .from("shift_reminder_settings")
          .select("user_id, settings, updated_at")
          .eq("user_id", deviceId)
          .maybeSingle(),
      ]);

    if (workModeError) {
      return Response.json(
        { ok: false, error: workModeError.message },
        { status: 500 }
      );
    }

    if (reminderError) {
      return Response.json(
        { ok: false, error: reminderError.message },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      data: {
        workMode: workModeRow?.work_mode ?? null,
        shiftReminder: reminderRow?.settings ?? null,
      },
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!deviceId) {
      return Response.json(
        { ok: false, error: "Missing device id" },
        { status: 401 }
      );
    }

    const workMode = body?.workMode;
    const shiftReminder = body?.shiftReminder;

    if (!isObject(workMode)) {
      return Response.json(
        { ok: false, error: "Invalid workMode" },
        { status: 400 }
      );
    }

    if (!isObject(shiftReminder)) {
      return Response.json(
        { ok: false, error: "Invalid shiftReminder" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const [{ error: workModeError }, { error: reminderError }] = await Promise.all([
      supabaseAdmin
        .from("user_work_modes")
        .upsert(
          {
            user_id: deviceId,
            work_mode: workMode,
            updated_at: now,
          },
          { onConflict: "user_id" }
        ),
      supabaseAdmin
        .from("shift_reminder_settings")
        .upsert(
          {
            user_id: deviceId,
            settings: shiftReminder,
            updated_at: now,
          },
          { onConflict: "user_id" }
        ),
    ]);

    if (workModeError) {
      return Response.json(
        { ok: false, error: workModeError.message },
        { status: 500 }
      );
    }

    if (reminderError) {
      return Response.json(
        { ok: false, error: reminderError.message },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}