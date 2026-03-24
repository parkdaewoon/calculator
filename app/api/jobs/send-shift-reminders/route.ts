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
  const [year, month, day] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + days));;

  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");

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
function isReminderTimeDue(params: {
  reminderTime: string;
  nowHhmm: string;
  toleranceMinutes?: number;
}) {
  const toleranceMinutes = Math.max(0, params.toleranceMinutes ?? 1);

  const parse = (hhmm: string) => {
    const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
    if (!m) return null;

    const hh = Number(m[1]);
    const mm = Number(m[2]);

    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

    return hh * 60 + mm;
  };

  const a = parse(params.reminderTime);
  const b = parse(params.nowHhmm);

  if (a === null || b === null) return false;

  // 00:00 경계(예: 23:59 vs 00:00)도 고려
  const direct = Math.abs(a - b);
  const wrapped = 24 * 60 - direct;
  const diff = Math.min(direct, wrapped);

  return diff <= toleranceMinutes;
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
function formatReminderWhen(startsAt: string | null | undefined) {
  if (!startsAt) return "";

  const dt = new Date(startsAt);
  if (Number.isNaN(dt.getTime())) return "";

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(dt);

  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";

  if (!month || !day || !hour || !minute) return "";

  return `${month}.${day}. ${hour}:${minute}`;
}

function buildCalendarEventPushBody(ev: {
  title?: string | null;
  starts_at?: string | null;
}) {
  const when = formatReminderWhen(ev?.starts_at);
  const title = String(ev?.title ?? "").trim() || "일정";

  return when ? `(${when}) ${title}` : title;
}
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const cronSecretHeader = req.headers.get("x-cron-secret") ?? "";
    const expected = process.env.CRON_SECRET;

    const body = await req.json().catch(() => ({}));
    if (expected) {
      const bodySecret =
        typeof body?.cronSecret === "string" ? body.cronSecret.trim() : "";
      const authorized =
        authHeader === `Bearer ${expected}` ||
        cronSecretHeader === expected ||
        bodySecret === expected;

      if (!authorized) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const debugUserId =
      typeof body?.userId === "string" && body.userId.trim()
        ? body.userId.trim()
        : null;

    const ignoreTime = body?.ignoreTime === true;

    const supabaseAdmin = getSupabaseAdmin();
    // NOTE: KST 변환은 아래 formatter에서 처리하므로, 여기서 시간을 더하면
    // 날짜/시간이 9시간 더 밀려 실제 알림 시각과 매칭이 깨집니다.
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
    const eventDebug: any[] = [];

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

      if (
        !ignoreTime &&
        !isReminderTimeDue({ reminderTime, nowHhmm, toleranceMinutes: 2 })
      ) {
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

      let result;

      const targetDayLabel = targetDate === today ? "오늘" : "내일";

      try {
        result = await sendPushToUser(userId, {
          title: `${codeLabel(targetCode)} 근무 알림!!`,
          body: `${targetDayLabel} ${codeLabel(targetCode)}근무입니다.`,
          url: "/calendar",
          tag: `shift-${scheduledKey}`,
        });
      } catch (e: any) {
        debug.push({
          userId,
          targetCode,
          whenMode,
          reminderTime,
          targetDate,
          actualCode,
          step: "sendError",
          error: e?.message || String(e),
        });
        continue;
      }

      await supabaseAdmin.from("shift_reminder_logs").insert({
        user_id: userId,
        target_code: targetCode,
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
let dueEventsQuery = supabaseAdmin
      .from("calendar_events")
      .select("id, user_id, title, starts_at, remind_at, reminder_sent, type_main")
      .not("remind_at", "is", null)
      .eq("reminder_sent", false)
      .lte("remind_at", now.toISOString());

    if (debugUserId) {
      dueEventsQuery = dueEventsQuery.eq("user_id", debugUserId);
    }

    const { data: dueEvents, error: dueEventsError } = await dueEventsQuery;

    if (dueEventsError) {
      return Response.json(
        { ok: false, error: dueEventsError.message },
        { status: 500 }
      );
    }

    for (const ev of dueEvents ?? []) {
      try {
        const result = await sendPushToUser(ev.user_id as string, {
          title: "일정 놓치지 않기!!",
          body: buildCalendarEventPushBody(ev),
          url: "/calendar",
          tag: `calendar-event-${ev.id}`,
        });

        if (result.sent > 0) {
          await supabaseAdmin
            .from("calendar_events")
            .update({ reminder_sent: true })
            .eq("id", ev.id);

          eventDebug.push({
            id: ev.id,
            userId: ev.user_id,
            remindAt: ev.remind_at,
            step: "sent",
            result,
          });
        } else {
          eventDebug.push({
            id: ev.id,
            userId: ev.user_id,
            remindAt: ev.remind_at,
            step: "pushNotSent",
            result,
          });
        }
      } catch (e: any) {
        eventDebug.push({
          id: ev.id,
          userId: ev.user_id,
          remindAt: ev.remind_at,
          step: "sendError",
          error: e?.message || String(e),
        });
      }
    }
    return Response.json({
      ok: true,
      today,
      nowHhmm,
      debugUserId,
      count: reminderRows?.length ?? 0,
      reminderRows,
      debug,
      dueEventCount: dueEvents?.length ?? 0,
      eventDebug,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
