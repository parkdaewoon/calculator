export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser, hasActivePushSubscription } from "@/lib/push/sender";
import { workModeToPattern } from "@/lib/calendar/patterns";

type YYYYMMDD = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";
type ReminderWhenMode = "today" | "previousDay";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getKstParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));

  const ymd = `${parts.year}-${parts.month}-${parts.day}` as YYYYMMDD;
  const hhmm = `${parts.hour}:${parts.minute}`;

  return { ymd, hhmm };
}

function addDays(ymd: YYYYMMDD, days: number): YYYYMMDD {
  const dt = new Date(`${ymd}T00:00:00+09:00`);
  dt.setDate(dt.getDate() + days);

  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}` as YYYYMMDD;
}

function hhmmToMinutes(hhmm: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function isWithinMinuteWindow(nowHhmm: string, targetHhmm: string, toleranceMinutes = 2) {
  const now = hhmmToMinutes(nowHhmm);
  const target = hhmmToMinutes(targetHhmm);
  if (now == null || target == null) return false;
  return Math.abs(now - target) <= toleranceMinutes;
}

function getWorkCodeForDate(
  pattern: { cycle: string[]; anchorDate: YYYYMMDD },
  date: YYYYMMDD
): string {
  const cycle = pattern.cycle;
  if (!cycle.length) return "REST";

  const a = new Date(`${pattern.anchorDate}T00:00:00+09:00`).getTime();
  const b = new Date(`${date}T00:00:00+09:00`).getTime();
  const diff = Math.floor((b - a) / (24 * 60 * 60 * 1000));
  const idx = ((diff % cycle.length) + cycle.length) % cycle.length;

  return cycle[idx];
}

function buildScheduledKey(params: {
  baseDate: YYYYMMDD;
  targetCode: ReminderTargetCode;
  whenMode: ReminderWhenMode;
  reminderTime: string;
  targetDate: YYYYMMDD;
}) {
  return [
    params.baseDate,
    params.targetCode,
    params.whenMode,
    params.reminderTime,
    params.targetDate,
  ].join("_");
}

function codeLabel(code: string) {
  switch (code) {
    case "DAY":
      return "주간";
    case "EVE":
      return "저녁";
    case "NIGHT":
      return "야간";
    case "DANG":
      return "당직";
    default:
      return code;
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const expected = process.env.CRON_SECRET;

    if (expected && authHeader !== `Bearer ${expected}`) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { ymd: today, hhmm: nowHhmm } = getKstParts();

    const { data: reminderRows, error: reminderError } = await supabaseAdmin
      .from("shift_reminder_rules")
      .select("user_id, target_code, enabled, when_mode, reminder_time")
      .eq("enabled", true);

    if (reminderError) {
      return Response.json({ ok: false, error: reminderError.message }, { status: 500 });
    }

    let checkedRules = 0;
    let sentRules = 0;
    let skippedRules = 0;
    let failedRules = 0;

    const debug: Array<Record<string, unknown>> = [];

    for (const row of reminderRows ?? []) {
      checkedRules += 1;

      const userId = String(row.user_id);
      const targetCode = row.target_code as ReminderTargetCode;
      const whenMode: ReminderWhenMode =
        row.when_mode === "today" ? "today" : "previousDay";
      const reminderTime = String(row.reminder_time ?? "");

      if (!isWithinMinuteWindow(nowHhmm, reminderTime, 2)) {
        skippedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "time-mismatch",
          reminderTime,
          nowHhmm,
        });
        continue;
      }

      const { data: workModeRow, error: workModeError } = await supabaseAdmin
        .from("user_work_modes")
        .select("work_mode")
        .eq("user_id", userId)
        .maybeSingle();

      if (workModeError) {
        failedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "work-mode-query-failed",
          error: workModeError.message,
        });
        continue;
      }

      const workMode = workModeRow?.work_mode;

      if (!workMode || typeof workMode !== "object") {
        skippedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "missing-work-mode",
        });
        continue;
      }

      const hasSubscription = await hasActivePushSubscription(userId);
      if (!hasSubscription) {
        skippedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "no-active-subscription",
        });
        continue;
      }

      const targetDate = whenMode === "previousDay" ? addDays(today, 1) : today;

      const anchorDate =
        typeof (workMode as any)?.anchorDate === "string"
          ? ((workMode as any).anchorDate as YYYYMMDD)
          : today;

      const pattern = workModeToPattern(workMode as any, anchorDate);

      const actualCode = getWorkCodeForDate(
        {
          cycle: Array.isArray(pattern.cycle) ? pattern.cycle : [],
          anchorDate: pattern.anchorDate as YYYYMMDD,
        },
        targetDate
      );

      if (actualCode !== targetCode) {
        skippedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "code-mismatch",
          actualCode,
          targetDate,
          whenMode,
        });
        continue;
      }

      const scheduledKey = buildScheduledKey({
        baseDate: today,
        targetCode,
        whenMode,
        reminderTime,
        targetDate,
      });

      const { data: existingLog, error: logCheckError } = await supabaseAdmin
        .from("shift_reminder_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("scheduled_key", scheduledKey)
        .maybeSingle();

      if (logCheckError) {
        failedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "log-check-failed",
          scheduledKey,
          error: logCheckError.message,
        });
        continue;
      }

      if (existingLog) {
        skippedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "already-sent",
          scheduledKey,
        });
        continue;
      }

      try {
        const result = await sendPushToUser(userId, {
          title: `${codeLabel(targetCode)} 근무 알림`,
          body:
            whenMode === "previousDay"
              ? `내일 ${codeLabel(targetCode)} 근무 예정입니다.`
              : `오늘 ${codeLabel(targetCode)} 근무 예정입니다.`,
          url: "/calendar",
          tag: `shift-${scheduledKey}`,
        });

        if (result.sent <= 0) {
          skippedRules += 1;
          debug.push({
            userId,
            targetCode,
            step: "push-not-sent",
            result,
          });
          continue;
        }

        const { error: insertLogError } = await supabaseAdmin
          .from("shift_reminder_logs")
          .insert({
            user_id: userId,
            scheduled_key: scheduledKey,
            target_date: targetDate,
            target_code: targetCode,
          });

        if (insertLogError) {
          failedRules += 1;
          debug.push({
            userId,
            targetCode,
            step: "log-insert-failed",
            scheduledKey,
            error: insertLogError.message,
          });
          continue;
        }

        sentRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "sent",
          scheduledKey,
          result,
        });
      } catch (e) {
        failedRules += 1;
        debug.push({
          userId,
          targetCode,
          step: "send-failed",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return Response.json({
      ok: true,
      today,
      nowHhmm,
      matchedRules: reminderRows?.length ?? 0,
      checkedRules,
      sentRules,
      skippedRules,
      failedRules,
      debug,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}