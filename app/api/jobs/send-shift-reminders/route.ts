export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";
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

function getTodayYmdInKst(date = new Date()): YYYYMMDD {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}` as YYYYMMDD;
}

function getNowHhmmInKst(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return fmt.format(date);
}

function addDays(ymd: YYYYMMDD, days: number): YYYYMMDD {
  const dt = new Date(`${ymd}T00:00:00+09:00`);
  dt.setDate(dt.getDate() + days);

  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}` as YYYYMMDD;
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

    const body = await req.json().catch(() => ({}));
    const debugUserId =
      typeof body?.userId === "string" && body.userId.trim()
        ? body.userId.trim()
        : null;

    const ignoreTime = body?.ignoreTime === true;

    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const today = getTodayYmdInKst(now);
    const nowHhmm = getNowHhmmInKst(now);

    let query = supabaseAdmin
      .from("shift_reminder_rules")
      .select("user_id, target_code, enabled, when_mode, reminder_time")
      .eq("enabled", true);

    if (debugUserId) {
      query = query.eq("user_id", debugUserId);
    }

    const { data: reminderRows, error: reminderError } = await query;

    if (reminderError) {
      return Response.json(
        { ok: false, error: reminderError.message },
        { status: 500 }
      );
    }

        const debug: any[] = [];

    for (const row of reminderRows ?? []) {
      const userId = row.user_id as string;
      const targetCode = row.target_code as ReminderTargetCode;
      const whenMode = row.when_mode === "today" ? "today" : "previousDay";
      const reminderTime = row.reminder_time as string;

      const { data: workModeRow, error: workModeError } = await supabaseAdmin
        .from("user_work_modes")
        .select("work_mode")
        .eq("user_id", userId)
        .maybeSingle();

      if (workModeError) {
        debug.push({
          userId,
          targetCode,
          step: "workModeError",
          error: workModeError.message,
        });
        continue;
      }

      const workMode = workModeRow?.work_mode;

      if (!workMode || typeof workMode !== "object") {
        debug.push({
          userId,
          targetCode,
          step: "missingWorkMode",
        });
        continue;
      }

      const targetDate =
        whenMode === "previousDay" ? addDays(today, 1) : today;

      const anchorDate =
        typeof (workMode as any)?.anchorDate === "string"
          ? ((workMode as any).anchorDate as YYYYMMDD)
          : today;

      const pattern = workModeToPattern(workMode as any, anchorDate);

      const actualCode = getWorkCodeForDate(
        {
          cycle: pattern.cycle,
          anchorDate: pattern.anchorDate as YYYYMMDD,
        },
        targetDate
      );

      if (actualCode !== targetCode) {
        debug.push({
          userId,
          targetCode,
          whenMode,
          reminderTime,
          targetDate,
          actualCode,
          step: "codeNotMatched",
        });
        continue;
      }

      if (!ignoreTime && reminderTime !== nowHhmm) {
        debug.push({
          userId,
          targetCode,
          whenMode,
          reminderTime,
          nowHhmm,
          targetDate,
          actualCode,
          step: "timeNotMatched",
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

      const { data: alreadySent } = await supabaseAdmin
        .from("shift_reminder_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("scheduled_key", scheduledKey)
        .maybeSingle();

      if (alreadySent) {
        debug.push({
          userId,
          targetCode,
          scheduledKey,
          step: "alreadySent",
        });
        continue;
      }

      const result = await sendPushToUser(userId, {
        title: `${codeLabel(targetCode)} 근무 알림`,
        body:
          whenMode === "previousDay"
            ? `내일 ${codeLabel(targetCode)} 근무 예정입니다.`
            : `오늘 ${codeLabel(targetCode)} 근무 예정입니다.`,
        url: "/calendar",
        tag: `shift-${scheduledKey}`,
      });

      await supabaseAdmin.from("shift_reminder_logs").insert({
        user_id: userId,
        target_code: targetCode,
        when_mode: whenMode,
        reminder_time: reminderTime,
        target_date: targetDate,
        scheduled_key: scheduledKey,
        sent_at: new Date().toISOString(),
      });

      debug.push({
        userId,
        targetCode,
        whenMode,
        reminderTime,
        nowHhmm,
        targetDate,
        actualCode,
        step: "sent",
        result,
      });
    }

    return Response.json({
      ok: true,
      today,
      nowHhmm,
      debugUserId,
      count: reminderRows?.length ?? 0,
      reminderRows,
      debug,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}