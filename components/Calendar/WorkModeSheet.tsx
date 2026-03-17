"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sheet from "./Sheet";
import type {
  WorkModeSheetProps,
  WorkMode,
  ShiftRotation,
  ShiftPatternId,
  ShiftCode,
  HHMM,
  TimeRange,
  ShiftReminderSettings,
} from "./types";

import DateWheelModal from "@/components/ui/wheel/presets/DateWheelModal";
import TimeWheelModal from "@/components/ui/wheel/presets/TimeWheelModal";
import BreakWheelModal from "@/components/ui/wheel/presets/BreakWheelModal";
import { X } from "lucide-react";

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}

function formatYmdKorean(ymd: string) {
  const s = String(ymd ?? "").trim();
  if (!s) return "";

  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;

  const mm = String(Number(m)).padStart(2, "0");
  const dd = String(Number(d)).padStart(2, "0");
  return `${y}년 ${mm}월 ${dd}일`;
}

const SHIFT_PATTERNS: Record<
  ShiftPatternId,
  { rotation: ShiftRotation; title: string; seq: ShiftCode[] }
> = {
  "2_A": {
    rotation: 2,
    title: "주주야야휴휴",
    seq: ["DAY", "DAY", "NIGHT", "NIGHT", "REST", "REST"],
  },
  "2_B": { rotation: 2, title: "주야비", seq: ["DAY", "NIGHT", "OFF"] },

  "3_A": {
    rotation: 3,
    title: "주주저저야야휴",
    seq: ["DAY", "DAY", "EVE", "EVE", "NIGHT", "NIGHT", "REST"],
  },
  "3_B": { rotation: 3, title: "주저야휴", seq: ["DAY", "EVE", "NIGHT", "REST"] },

  "4_A": { rotation: 4, title: "주야비휴", seq: ["DAY", "NIGHT", "OFF", "REST"] },
  "4_B": { rotation: 4, title: "당비휴휴", seq: ["DANG", "OFF", "REST", "REST"] },

  CUSTOM: { rotation: 4, title: "직접입력", seq: ["DAY", "NIGHT", "OFF", "REST"] },
};

function parseCustomCycle(input: string): ShiftCode[] {
  const t = (input ?? "").trim();
  if (!t) return [];

  const tokens =
    t.includes(" ") || t.includes(",")
      ? t.split(/[\s,]+/g).filter(Boolean)
      : t.split("");

  const mapToken = (x: string): ShiftCode | null => {
    const u = x.trim().toUpperCase();

    if (x === "주") return "DAY";
    if (x === "저") return "EVE";
    if (x === "야") return "NIGHT";
    if (x === "당") return "DANG";
    if (x === "비") return "OFF";
    if (x === "휴") return "REST";

    if (u === "DAY") return "DAY";
    if (u === "EVE") return "EVE";
    if (u === "NIGHT") return "NIGHT";
    if (u === "DANG") return "DANG";
    if (u === "OFF") return "OFF";
    if (u === "REST") return "REST";

    return null;
  };

  const out: ShiftCode[] = [];
  for (const tok of tokens) {
    const c = mapToken(tok);
    if (c) out.push(c);
  }
  return out;
}

function cycleToPrettyText(cycle: ShiftCode[]) {
  const m: Record<ShiftCode, string> = {
    DAY: "주",
    EVE: "저",
    NIGHT: "야",
    DANG: "당",
    OFF: "비",
    REST: "휴",
  };
  return cycle.map((c) => m[c] ?? "").join("");
}

function codeLabel(code: ShiftCode) {
  switch (code) {
    case "DAY":
      return "주간";
    case "EVE":
      return "저녁";
    case "NIGHT":
      return "야간";
    case "DANG":
      return "당직";
    case "OFF":
      return "비번";
    case "REST":
      return "휴무";
    default:
      return code;
  }
}

function uniqCodes(seq: ShiftCode[]) {
  const seen = new Set<ShiftCode>();
  const out: ShiftCode[] = [];
  for (const c of seq) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

function getDefaultTimes(): Partial<Record<ShiftCode, TimeRange>> {
  return {
    DAY: { start: "09:00", end: "18:00", breakMinutes: 60 },
    EVE: { start: "14:00", end: "22:00", breakMinutes: 60 },
    NIGHT: { start: "18:00", end: "09:00", breakMinutes: 60 },
    DANG: { start: "09:00", end: "09:00", breakMinutes: 0 },
  };
}

function getDefaultReminder(): ShiftReminderSettings {
  return {
    DAY: { enabled: false, whenMode: "today", reminderTime: "07:00" },
    EVE: { enabled: false, whenMode: "today", reminderTime: "13:00" },
    NIGHT: { enabled: false, whenMode: "previousDay", reminderTime: "21:00" },
    DANG: { enabled: false, whenMode: "today", reminderTime: "08:00" },
  };
}

function CardButton({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left",
        active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-100",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-1 text-xs text-neutral-500">{desc}</div>
    </button>
  );
}

function TimeRangePicker({
  label,
  value,
  wheel,
}: {
  label: string;
  value: TimeRange;
  wheel: {
    openTime: (side: "start" | "end") => void;
    openBreak: () => void;
  };
}) {
  const breakMin = value.breakMinutes ?? 0;
  const breakLabel =
    breakMin === 0
      ? "없음"
      : breakMin === 30
      ? "30분"
      : breakMin === 60
      ? "1시간"
      : breakMin === 90
      ? "1시간 30분"
      : breakMin === 120
      ? "2시간"
      : breakMin === 180
      ? "3시간"
      : breakMin === 240
      ? "4시간"
      : breakMin === 300
      ? "5시간"
      : breakMin === 360
      ? "6시간"
      : breakMin === 420
      ? "7시간"
      : breakMin === 480
      ? "8시간"
      : `${breakMin}분`;

  return (
    <div className="rounded-2xl border border-neutral-100 p-3">
      <div className="text-xs font-semibold text-neutral-700">{label}</div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => wheel.openTime("start")}
          className="h-10 rounded-xl border border-neutral-200 bg-white px-3 hover:bg-neutral-50"
        >
          <div className="grid grid-cols-[auto_1fr] items-center text-sm font-semibold text-neutral-900">
            <span>(시작)</span>
            <span className="text-right tabular-nums">{value.start}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => wheel.openTime("end")}
          className="h-10 rounded-xl border border-neutral-200 bg-white px-3 hover:bg-neutral-50"
        >
          <div className="grid grid-cols-[auto_1fr] items-center text-sm font-semibold text-neutral-900">
            <span>(종료)</span>
            <span className="text-right tabular-nums">{value.end}</span>
          </div>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-neutral-700">공제시간</div>

        <button
          type="button"
          onClick={wheel.openBreak}
          className="h-9 w-40 rounded-xl border border-neutral-200 bg-white px-3 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          {breakLabel}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative h-7 w-12 rounded-full transition",
        checked ? "bg-neutral-900" : "bg-neutral-300",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "absolute top-1 h-5 w-5 rounded-full bg-white transition",
          checked ? "left-6" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}

function isShift(m: WorkMode): m is Extract<WorkMode, { type: "SHIFT" }> {
  return (m as any)?.type === "SHIFT";
}

type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

type TimePick =
  | { kind: "DAYMODE"; side: "start" | "end" }
  | { kind: "SHIFT"; code: ShiftCode; side: "start" | "end" }
  | { kind: "REMINDER"; code: ReminderTargetCode };

type BreakPick = { kind: "DAYMODE" } | { kind: "SHIFT"; code: ShiftCode };

export default function WorkModeSheet({
  open,
  onClose,
  value,
  onChange,
  reminderValue,
  onChangeReminder,
}: WorkModeSheetProps) {
  const [draft, setDraft] = useState<WorkMode>(value);
  const [draftReminder, setDraftReminder] = useState<ShiftReminderSettings>(
    reminderValue ?? getDefaultReminder()
  );

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDraftReminder(reminderValue ?? getDefaultReminder());
    }
  }, [open, value, reminderValue]);

  const [openAnchorWheel, setOpenAnchorWheel] = useState(false);
  const [timePick, setTimePick] = useState<TimePick | null>(null);
  const [breakPick, setBreakPick] = useState<BreakPick | null>(null);

  const shiftRotation: ShiftRotation | null = isShift(draft) ? draft.rotation : null;

  const availablePatternIds = useMemo(() => {
    const all = (Object.keys(SHIFT_PATTERNS) as ShiftPatternId[]).filter((id) => id !== "CUSTOM");
    if (!shiftRotation) return all;
    return all.filter((id) => SHIFT_PATTERNS[id].rotation === shiftRotation);
  }, [shiftRotation]);

  const neededCodes = useMemo<ReminderTargetCode[]>(() => {
    if (!isShift(draft)) return [];

    const patternId = draft.patternId;

    const seq =
      patternId === "CUSTOM"
        ? (((draft as { customCycle?: ShiftCode[] }).customCycle ??
            SHIFT_PATTERNS.CUSTOM.seq) as ShiftCode[])
        : (SHIFT_PATTERNS[patternId]?.seq ?? []);

    return uniqCodes(seq).filter(
      (c): c is ReminderTargetCode => c !== "OFF" && c !== "REST"
    );
  }, [draft]);

  const applyAndClose = () => {
    onChange(draft);
    onChangeReminder(draftReminder);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold">근무형태 설정</span>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
            type="button"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
      }
    >
      <div className="pr-1">
        <div className="space-y-4">
          <div className="space-y-3">
            <CardButton
              active={(draft as any).type === "DAY"}
              title="일반근무"
              desc="일반근무 시간(시작/종료) + 공제시간"
              onClick={() =>
                setDraft({
                  type: "DAY",
                  day:
                    (draft as any).type === "DAY"
                      ? (draft as any).day
                      : { start: "09:00", end: "18:00", breakMinutes: 60 },
                } as any)
              }
            />

            <CardButton
              active={(draft as any).type === "SHIFT"}
              title="교대근무"
              desc="2/3/4교대 및 패턴, 시간, 공제시간"
              onClick={() => {
                const fallbackId: ShiftPatternId = "4_A";
                setDraft({
                  type: "SHIFT",
                  rotation: 4,
                  patternId: fallbackId,
                  times: isShift(draft) ? (draft as any).times : { ...getDefaultTimes() },
                  anchorDate: isShift(draft) ? (draft as any).anchorDate ?? todayYMD() : todayYMD(),
                } as any);
              }}
            />
          </div>

          {(draft as any).type === "DAY" ? (
            <TimeRangePicker
              label="일반근무 시간"
              value={(draft as any).day}
              wheel={{
                openTime: (side) => setTimePick({ kind: "DAYMODE", side }),
                openBreak: () => setBreakPick({ kind: "DAYMODE" }),
              }}
            />
          ) : null}

          {(draft as any).type === "SHIFT" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-100 p-3">
                <div className="text-xs font-semibold text-neutral-700">교대 시작일</div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setOpenAnchorWheel(true)}
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                  >
                    {formatYmdKorean((draft as any).anchorDate ?? todayYMD())}
                  </button>
                </div>

                <div className="mt-2 ml-2 text-[11px] text-neutral-400">* 해당 일부터 1일차</div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4].map((r) => {
                  const active =
                    isShift(draft) && (draft as any).rotation === r && (draft as any).patternId !== "CUSTOM";

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        const first = (Object.keys(SHIFT_PATTERNS) as ShiftPatternId[]).find(
                          (id) => id !== "CUSTOM" && SHIFT_PATTERNS[id].rotation === r
                        ) as ShiftPatternId;

                        setDraft((p) => {
                          const prevTimes = isShift(p) ? (p as any).times : {};
                          const prevPatternId = isShift(p) ? (p as any).patternId : "4_A";
                          const prevAnchor = isShift(p) ? (p as any).anchorDate ?? todayYMD() : todayYMD();

                          return {
                            type: "SHIFT",
                            rotation: r as ShiftRotation,
                            patternId: first ?? prevPatternId,
                            times: { ...getDefaultTimes(), ...prevTimes },
                            anchorDate: prevAnchor,
                            customCycle: isShift(p) ? (p as any).customCycle : undefined,
                          } as any;
                        });
                      }}
                      className={[
                        "h-10 rounded-2xl border text-sm font-semibold",
                        active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-100 text-neutral-600",
                      ].join(" ")}
                    >
                      {r}교대
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setDraft((p) => {
                      const prevTimes = isShift(p) ? (p as any).times : {};
                      const prevAnchor = isShift(p) ? (p as any).anchorDate ?? todayYMD() : todayYMD();
                      const prevCustom = isShift(p) ? (p as any).customCycle : undefined;

                      const fallback = prevCustom?.length ? prevCustom : SHIFT_PATTERNS.CUSTOM.seq;

                      return {
                        type: "SHIFT",
                        rotation: 4,
                        patternId: "CUSTOM",
                        times: { ...getDefaultTimes(), ...prevTimes },
                        anchorDate: prevAnchor,
                        customCycle: fallback,
                      } as any;
                    });
                  }}
                  className={[
                    "h-10 rounded-2xl border text-sm font-semibold",
                    isShift(draft) && (draft as any).patternId === "CUSTOM"
                      ? "border-neutral-900 ring-2 ring-neutral-900/10"
                      : "border-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  직접입력
                </button>
              </div>

              {(draft as any).type === "SHIFT" && (draft as any).patternId === "CUSTOM" ? (
                <div className="rounded-2xl border border-neutral-100 p-3">
                  <div className="text-xs font-semibold text-neutral-700">패턴 직접입력</div>
                  <div className="mt-2 text-[11px] text-neutral-500">사용가능: 주/저/야/당/비/휴</div>

                  <input
                    className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
                    defaultValue={cycleToPrettyText((draft as any).customCycle ?? SHIFT_PATTERNS.CUSTOM.seq)}
                    onChange={(e) => {
                      const next = parseCustomCycle(e.target.value);
                      setDraft((p) => ({
                        ...(p as any),
                        customCycle: next.length ? next : [],
                      }));
                    }}
                    placeholder="예: 주야비휴"
                  />

                  <div className="mt-2 text-[11px] text-neutral-400">
                    현재: {cycleToPrettyText((draft as any).customCycle ?? SHIFT_PATTERNS.CUSTOM.seq)}
                  </div>
                </div>
              ) : null}

              {!((draft as any).type === "SHIFT" && (draft as any).patternId === "CUSTOM") ? (
                <div className="space-y-2">
                  <div className="text-xs ml-2 font-semibold text-neutral-700">패턴</div>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePatternIds.map((id) => {
                      const active = isShift(draft) && (draft as any).patternId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            setDraft((p) => {
                              const prevTimes = isShift(p) ? (p as any).times : {};
                              const prevAnchor = isShift(p) ? (p as any).anchorDate ?? todayYMD() : todayYMD();
                              return {
                                type: "SHIFT",
                                rotation: SHIFT_PATTERNS[id].rotation,
                                patternId: id,
                                times: { ...getDefaultTimes(), ...prevTimes },
                                anchorDate: prevAnchor,
                              } as any;
                            })
                          }
                          className={[
                            "rounded-2xl border p-3 text-center",
                            active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-100",
                          ].join(" ")}
                        >
                          <div className="text-sm font-semibold text-neutral-900">{SHIFT_PATTERNS[id].title}</div>
                          <div className="mt-1 text-[11px] text-neutral-500">{SHIFT_PATTERNS[id].rotation}교대</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* 3-3) 근무 시간(+공제시간) + 근무 알림 */}
              <div className="space-y-2">
                <div className="ml-2 text-xs font-semibold text-neutral-700">근무 시간</div>

                {neededCodes.length === 0 ? (
                  <div className="text-xs text-neutral-500">설정할 근무 시간이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {neededCodes.map((code) => {
                      const current =
                        (isShift(draft) ? (draft as any).times?.[code] : undefined) ??
                        getDefaultTimes()[code] ??
                        ({ start: "09:00", end: "18:00", breakMinutes: 0 } as TimeRange);

                      const reminder = draftReminder[code] ?? {
                        enabled: false,
                        whenMode: code === "NIGHT" ? "previousDay" : "today",
                        reminderTime:
                          code === "DAY"
                            ? "07:00"
                            : code === "EVE"
                            ? "13:00"
                            : code === "NIGHT"
                            ? "21:00"
                            : "08:00",
                      };

                      return (
                        <div key={code} className="space-y-2">
                          <TimeRangePicker
                            label={codeLabel(code)}
                            value={current}
                            wheel={{
                              openTime: (side) => setTimePick({ kind: "SHIFT", code, side }),
                              openBreak: () => setBreakPick({ kind: "SHIFT", code }),
                            }}
                          />

                          <div className="rounded-2xl border border-neutral-100 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold text-neutral-700">
                                  {codeLabel(code)} 알림
                                </div>
                                <div className="mt-1 text-[11px] text-neutral-500">
                                  {codeLabel(code)} 근무 알림을 설정합니다.
                                </div>
                              </div>

                              <Toggle
                                checked={reminder.enabled}
                                onChange={(next) =>
                                  setDraftReminder((prev: ShiftReminderSettings) => ({
                                    ...prev,
                                    [code]: {
                                      ...(prev[code] ?? reminder),
                                      enabled: next,
                                    },
                                  }))
                                }
                              />
                            </div>

                            {reminder.enabled && (
                              <div className="mt-3 rounded-2xl border border-neutral-100 p-3">
                                <div className="grid grid-cols-[110px_1fr] items-end gap-2">
                                  <div>
                                    <div className="mb-2 text-xs font-semibold text-neutral-700">
                                      알림 기준
                                    </div>
                                    <select
                                      value={reminder.whenMode}
                                      onChange={(e) =>
                                        setDraftReminder((prev: ShiftReminderSettings) => ({
                                          ...prev,
                                          [code]: {
                                            ...(prev[code] ?? reminder),
                                            whenMode: e.target.value as "today" | "previousDay",
                                          },
                                        }))
                                      }
                                      className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none"
                                    >
                                      <option value="previousDay">전날</option>
                                      <option value="today">당일</option>
                                    </select>
                                  </div>

                                  <div>
                                    <div className="mb-2 text-xs font-semibold text-neutral-700">
                                      알림 시간
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setTimePick({ kind: "REMINDER", code })}
                                      className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                                    >
                                      {reminder.reminderTime}
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-2 text-[11px] text-neutral-400">
                                  {reminder.whenMode === "today"
                                    ? "해당 근무일 당일에 알림"
                                    : "다음날 근무를 전날 미리 알림"}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ml-2 text-[11px] text-neutral-400">
                  * 비번/휴무는 시간 설정을 생략합니다.
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={applyAndClose}
                  className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  적용
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <DateWheelModal
        open={openAnchorWheel}
        title="교대 시작일 선택"
        value={(draft as any).anchorDate ?? todayYMD()}
        onClose={() => setOpenAnchorWheel(false)}
        onConfirm={(next) => {
          setDraft((p) => ({ ...(p as any), anchorDate: next } as any));
          setOpenAnchorWheel(false);
        }}
      />

      {timePick ? (
        <TimeWheelModal
          open={true}
          title={
            timePick.kind === "DAYMODE"
              ? timePick.side === "start"
                ? "일반근무 시작시간"
                : "일반근무 종료시간"
              : timePick.kind === "REMINDER"
              ? `${codeLabel(timePick.code)} 알림 시간`
              : timePick.side === "start"
              ? `${codeLabel(timePick.code)} 시작시간`
              : `${codeLabel(timePick.code)} 종료시간`
          }
          value={
            (timePick.kind === "DAYMODE"
              ? ((timePick.side === "start"
                  ? (draft as any).day?.start
                  : (draft as any).day?.end) ?? "09:00")
              : timePick.kind === "REMINDER"
              ? (draftReminder[timePick.code]?.reminderTime ??
                  (timePick.code === "DAY"
                    ? "07:00"
                    : timePick.code === "EVE"
                    ? "13:00"
                    : timePick.code === "NIGHT"
                    ? "21:00"
                    : "08:00"))
              : (isShift(draft)
                  ? (draft as any).times?.[timePick.code]?.[timePick.side] ??
                    (timePick.side === "start" ? "09:00" : "18:00")
                  : "09:00")) as HHMM
          }
          stepMin={5}
          onClose={() => setTimePick(null)}
          onConfirm={(next) => {
            const pick = timePick;
            if (!pick) return;

            if (pick.kind === "REMINDER") {
              const code = pick.code;

              setDraftReminder((prev: ShiftReminderSettings) => {
                const fallback = {
                  enabled: false,
                  whenMode: code === "NIGHT" ? "previousDay" : ("today" as "today" | "previousDay"),
                  reminderTime:
                    code === "DAY"
                      ? "07:00"
                      : code === "EVE"
                      ? "13:00"
                      : code === "NIGHT"
                      ? "21:00"
                      : ("08:00" as HHMM),
                };

                return {
                  ...prev,
                  [code]: {
                    ...(prev[code] ?? fallback),
                    reminderTime: next,
                  },
                };
              });

              setTimePick(null);
              return;
            }

            if (pick.kind === "DAYMODE") {
              const side = pick.side;
              setDraft((p) => ({
                ...(p as any),
                type: "DAY",
                day: { ...(p as any).day, [side]: next },
              }));
              setTimePick(null);
              return;
            }

            const code = pick.code;
            const side = pick.side;

            setDraft((p) => {
              const prev = isShift(p)
                ? (p as any)
                : ({
                    type: "SHIFT",
                    rotation: 4,
                    patternId: "4_A",
                    times: {},
                    anchorDate: todayYMD(),
                  } as any);

              const cur =
                prev.times?.[code] ??
                (getDefaultTimes()[code] as any) ??
                ({ start: "09:00", end: "18:00", breakMinutes: 0 } as TimeRange);

              return {
                ...prev,
                times: {
                  ...prev.times,
                  [code]: { ...cur, [side]: next },
                },
              } as any;
            });

            setTimePick(null);
          }}
        />
      ) : null}

      {breakPick ? (
        <BreakWheelModal
          open={true}
          value={
            breakPick.kind === "DAYMODE"
              ? Number((draft as any).day?.breakMinutes ?? 0)
              : Number(
                  isShift(draft)
                    ? (draft as any).times?.[breakPick.code]?.breakMinutes ??
                        getDefaultTimes()[breakPick.code]?.breakMinutes ??
                        0
                    : 0
                )
          }
          onClose={() => setBreakPick(null)}
          onConfirm={(nextMin) => {
            const pick = breakPick;
            if (!pick) return;

            if (pick.kind === "DAYMODE") {
              setDraft((p) => ({
                ...(p as any),
                type: "DAY",
                day: { ...(p as any).day, breakMinutes: nextMin },
              }));
              setBreakPick(null);
              return;
            }

            const code = pick.code;

            setDraft((p) => {
              const prev = isShift(p)
                ? (p as any)
                : ({
                    type: "SHIFT",
                    rotation: 4,
                    patternId: "4_A",
                    times: {},
                    anchorDate: todayYMD(),
                  } as any);

              const cur =
                prev.times?.[code] ??
                (getDefaultTimes()[code] as any) ??
                ({ start: "09:00", end: "18:00", breakMinutes: 0 } as TimeRange);

              return {
                ...prev,
                times: {
                  ...prev.times,
                  [code]: { ...cur, breakMinutes: nextMin },
                },
              } as any;
            });

            setBreakPick(null);
          }}
        />
      ) : null}
    </Sheet>
  );
}