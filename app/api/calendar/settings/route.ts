export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

type ReminderWhenMode = "today" | "previousDay";
type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

type ShiftReminderRuleInput = {
  targetCode: ReminderTargetCode;
  enabled: boolean;
  whenMode: ReminderWhenMode;
  reminderTime: string;
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

function isTargetCode(value: unknown): value is ReminderTargetCode {
  return value === "DAY" || value === "EVE" || value === "NIGHT" || value === "DANG";
}

function isWhenMode(value: unknown): value is ReminderWhenMode {
  return value === "today" || value === "previousDay";
}

function isValidHhmm(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function normalizeReminderRule(input: unknown): ShiftReminderRuleInput {
  if (!isObject(input)) {
    throw new Error("Invalid shift reminder rule");
  }

  if (!isTargetCode(input.targetCode)) {
    throw new Error("Invalid shift reminder targetCode");
  }

  if (typeof input.enabled !== "boolean") {
    throw new Error("Invalid shift reminder enabled");
  }

  if (!isWhenMode(input.whenMode)) {
    throw new Error("Invalid shift reminder whenMode");
  }

  if (typeof input.reminderTime !== "string" || !isValidHhmm(input.reminderTime)) {
    throw new Error("Invalid shift reminder reminderTime");
  }

  return {
    targetCode: input.targetCode,
    enabled: input.enabled,
    whenMode: input.whenMode,
    reminderTime: input.reminderTime,
  };
}

function normalizeReminderRules(input: unknown): ShiftReminderRuleInput[] {
  if (!Array.isArray(input)) {
    throw new Error("shiftReminders must be an array");
  }

  const rules = input.map(normalizeReminderRule);

  const dedup = new Map<ReminderTargetCode, ShiftReminderRuleInput>();
  for (const rule of rules) {
    dedup.set(rule.targetCode, rule);
  }

  return Array.from(dedup.values());
}

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const deviceId = req.headers.get("x-device-id")?.trim() ?? "";

    if (!deviceId) {
      return Response.json({ ok: false, error: "Missing device id" }, { status: 401 });
    }

    const { data: workModeRow, error: workModeError } = await supabaseAdmin
      .from("user_work_modes")
      .select("work_mode, updated_at")
      .eq("user_id", deviceId)
      .maybeSingle();

    if (workModeError) {
      return Response.json({ ok: false, error: workModeError.message }, { status: 500 });
    }

    const { data: reminderRows, error: reminderError } = await supabaseAdmin
      .from("shift_reminder_rules")
      .select("target_code, enabled, when_mode, reminder_time, updated_at")
      .eq("user_id", deviceId)
      .order("target_code", { ascending: true });

    if (reminderError) {
      return Response.json({ ok: false, error: reminderError.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      data: {
        workMode: workModeRow?.work_mode ?? null,
        shiftReminders: (reminderRows ?? []).map((row) => ({
          targetCode: row.target_code,
          enabled: !!row.enabled,
          whenMode: row.when_mode,
          reminderTime: row.reminder_time,
        })),
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
      return Response.json({ ok: false, error: "Missing device id" }, { status: 401 });
    }

    const workMode = body?.workMode;
    const hasWorkMode = isObject(workMode);

    const hasShiftReminders = body?.shiftReminders !== undefined;
    const shiftReminders = hasShiftReminders
      ? normalizeReminderRules(body?.shiftReminders)
      : null;

    if (!hasWorkMode && !hasShiftReminders) {
      return Response.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (hasWorkMode) {
      const { error: workModeError } = await supabaseAdmin
        .from("user_work_modes")
        .upsert(
          {
            user_id: deviceId,
            work_mode: workMode,
            updated_at: now,
          },
          { onConflict: "user_id" }
        );

      if (workModeError) {
        return Response.json({ ok: false, error: workModeError.message }, { status: 500 });
      }
    }

    if (shiftReminders) {
      for (const rule of shiftReminders) {
        const { error: reminderError } = await supabaseAdmin
          .from("shift_reminder_rules")
          .upsert(
            {
              user_id: deviceId,
              target_code: rule.targetCode,
              enabled: rule.enabled,
              when_mode: rule.whenMode,
              reminder_time: rule.reminderTime,
              updated_at: now,
            },
            { onConflict: "user_id,target_code" }
          );

        if (reminderError) {
          return Response.json({ ok: false, error: reminderError.message }, { status: 500 });
        }
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}