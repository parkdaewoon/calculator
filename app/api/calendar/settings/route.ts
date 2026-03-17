export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

type ReminderWhenMode = "today" | "previousDay";

type ShiftReminderPayload = {
  enabled: boolean;
  whenMode: ReminderWhenMode;
  reminderTime: string;
  targetCodes: string[];
};

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

function normalizeShiftReminder(input: unknown): ShiftReminderPayload {
  if (!isObject(input)) {
    return {
      enabled: false,
      whenMode: "previousDay",
      reminderTime: "21:00",
      targetCodes: ["NIGHT"],
    };
  }

  const enabled = input.enabled === true;
  const whenMode: ReminderWhenMode =
    input.whenMode === "today" ? "today" : "previousDay";

  const reminderTime =
    typeof input.reminderTime === "string" &&
    /^\d{2}:\d{2}$/.test(input.reminderTime)
      ? input.reminderTime
      : "21:00";

  const targetCodes = Array.isArray(input.targetCodes)
    ? input.targetCodes.filter((v): v is string => typeof v === "string" && !!v)
    : ["NIGHT"];

  return {
    enabled,
    whenMode,
    reminderTime,
    targetCodes: targetCodes.length ? targetCodes : ["NIGHT"],
  };
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

    const [
      { data: workModeRow, error: workModeError },
      { data: reminderRow, error: reminderError },
    ] = await Promise.all([
      supabaseAdmin
        .from("user_work_modes")
        .select("user_id, work_mode, updated_at")
        .eq("user_id", deviceId)
        .maybeSingle(),

      supabaseAdmin
        .from("shift_reminder_settings")
        .select(
          "user_id, enabled, when_mode, reminder_time, target_codes, updated_at"
        )
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
        shiftReminder: reminderRow
          ? {
              enabled: !!reminderRow.enabled,
              whenMode:
                reminderRow.when_mode === "today" ? "today" : "previousDay",
              reminderTime: reminderRow.reminder_time ?? "21:00",
              targetCodes: Array.isArray(reminderRow.target_codes)
                ? reminderRow.target_codes
                : ["NIGHT"],
            }
          : null,
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
    const hasWorkMode = isObject(workMode);

    const hasShiftReminder = body?.shiftReminder !== undefined;
    const shiftReminder = hasShiftReminder
      ? normalizeShiftReminder(body?.shiftReminder)
      : null;

    if (!hasWorkMode && !hasShiftReminder) {
      return Response.json(
        { ok: false, error: "Nothing to update" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const jobs: PromiseLike<{ error: { message: string } | null }>[] = [];

    if (hasWorkMode) {
      jobs.push(
        supabaseAdmin.from("user_work_modes").upsert(
          {
            user_id: deviceId,
            work_mode: workMode,
            updated_at: now,
          },
          { onConflict: "user_id" }
        )
      );
    }

    if (shiftReminder) {
      jobs.push(
        supabaseAdmin.from("shift_reminder_settings").upsert(
          {
            user_id: deviceId,
            enabled: shiftReminder.enabled,
            when_mode: shiftReminder.whenMode,
            reminder_time: shiftReminder.reminderTime,
            target_codes: shiftReminder.targetCodes,
            updated_at: now,
          },
          { onConflict: "user_id" }
        )
      );
    }

    const results = await Promise.all(jobs);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
      return Response.json(
        { ok: false, error: failed.error.message },
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