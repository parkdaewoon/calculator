"use client";

import React, { useMemo, useState } from "react";
import Sheet from "./Sheet";
import type {
  WorkModeSheetProps,
  WorkMode,
  ShiftRotation,
  ShiftPatternId,
  ShiftCode,
  HHMM,
  TimeRange,
} from "./types";

const HH = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MM = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function splitHHMM(v: HHMM) {
  const [h, m] = v.split(":");
  return { h, m };
}
function makeHHMM(h: string, m: string) {
  return `${h}:${m}` as HHMM;
}

function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}

const SHIFT_PATTERNS: Record<
  ShiftPatternId,
  { rotation: ShiftRotation; title: string; seq: ShiftCode[] }
> = {
  "2_A": { rotation: 2, title: "주주야야휴휴", seq: ["DAY", "DAY", "NIGHT", "NIGHT", "REST", "REST"] },
  "2_B": { rotation: 2, title: "주야비", seq: ["DAY", "NIGHT", "OFF"] },

  "3_A": { rotation: 3, title: "주주저저야야휴", seq: ["DAY", "DAY", "EVE", "EVE", "NIGHT", "NIGHT", "REST"] },
  "3_B": { rotation: 3, title: "주저야휴", seq: ["DAY", "EVE", "NIGHT", "REST"] },

  "4_A": { rotation: 4, title: "주야비휴", seq: ["DAY", "NIGHT", "OFF", "REST"] },
  "4_B": { rotation: 4, title: "당비휴휴", seq: ["DANG", "OFF", "REST", "REST"] },

  // ✅ 직접입력 (기본값은 주야비휴로 두고, 실제론 draft.customCycle을 씀)
  "CUSTOM": { rotation: 4, title: "직접입력", seq: ["DAY", "NIGHT", "OFF", "REST"] },
};

function parseCustomCycle(input: string): ShiftCode[] {
  const t = (input ?? "").trim();
  if (!t) return [];

  // 1) 공백/콤마 구분 입력 지원: "주 야 비 휴" / "DAY NIGHT OFF REST"
  const tokens = t.includes(" ") || t.includes(",")
    ? t.split(/[\s,]+/g).filter(Boolean)
    : t.split(""); // 2) "주야비휴" 같은 한글 연속 입력

  const mapToken = (x: string): ShiftCode | null => {
    const u = x.trim().toUpperCase();
    // 한글 1글자
    if (x === "주") return "DAY";
    if (x === "저") return "EVE";
    if (x === "야") return "NIGHT";
    if (x === "당") return "DANG";
    if (x === "비") return "OFF";
    if (x === "휴") return "REST";

    // 영문 코드
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
  // 주저야당비휴로 보여주기
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
    NIGHT: { start: "22:00", end: "06:00", breakMinutes: 60 },
    DANG: { start: "09:00", end: "09:00", breakMinutes: 0 },
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

const BREAK_OPTIONS = [
  { label: "없음", min: 0 },
  { label: "30분", min: 30 },
  { label: "1시간", min: 60 },
  { label: "1시간 30분", min: 90 },
  { label: "2시간", min: 120 },
  { label: "3시간", min: 180 },
  { label: "4시간", min: 240 },
  { label: "5시간", min: 300 },
  { label: "6시간", min: 360 },
];

function TimeRangePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const s = splitHHMM(value.start);
  const e = splitHHMM(value.end);
  const breakMin = value.breakMinutes ?? 0;

  return (
    <div className="rounded-2xl border border-neutral-100 p-3">
      <div className="text-xs font-semibold text-neutral-700">{label}</div>

      <div className="mt-2 flex items-center gap-2">
        <select
          className="h-9 flex-1 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
          value={s.h}
          onChange={(ev) => onChange({ ...value, start: makeHHMM(ev.target.value, s.m) })}
        >
          {HH.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-sm text-neutral-400">:</span>
        <select
          className="h-9 flex-1 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
          value={s.m}
          onChange={(ev) => onChange({ ...value, start: makeHHMM(s.h, ev.target.value) })}
        >
          {MM.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <span className="px-1 text-xs text-neutral-400">~</span>

        <select
          className="h-9 flex-1 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
          value={e.h}
          onChange={(ev) => onChange({ ...value, end: makeHHMM(ev.target.value, e.m) })}
        >
          {HH.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-sm text-neutral-400">:</span>
        <select
          className="h-9 flex-1 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
          value={e.m}
          onChange={(ev) => onChange({ ...value, end: makeHHMM(e.h, ev.target.value) })}
        >
          {MM.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ 공제시간(휴게시간) */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-neutral-700">공제시간</div>
        <select
          className="h-9 w-40 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
          value={String(breakMin)}
          onChange={(ev) => onChange({ ...value, breakMinutes: Number(ev.target.value) })}
        >
          {BREAK_OPTIONS.map((o) => (
            <option key={o.min} value={String(o.min)}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function isShift(m: WorkMode): m is Extract<WorkMode, { type: "SHIFT" }> {
  return (m as any)?.type === "SHIFT";
}

export default function WorkModeSheet({ open, onClose, value, onChange }: WorkModeSheetProps) {
  const [draft, setDraft] = useState<WorkMode>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const shiftRotation: ShiftRotation | null = isShift(draft) ? draft.rotation : null;

  const availablePatternIds = useMemo(() => {
  const all = (Object.keys(SHIFT_PATTERNS) as ShiftPatternId[]).filter((id) => id !== "CUSTOM");
  if (!shiftRotation) return all;
  return all.filter((id) => SHIFT_PATTERNS[id].rotation === shiftRotation);
}, [shiftRotation]);

 const neededCodes = useMemo(() => {
  if (!isShift(draft)) return [];

  const seq =
    draft.patternId === "CUSTOM"
      ? ((draft as any).customCycle ?? SHIFT_PATTERNS.CUSTOM.seq)
      : (SHIFT_PATTERNS[draft.patternId]?.seq ?? []);

  return uniqCodes(seq).filter((c) => c !== "OFF" && c !== "REST");
}, [draft]);

  const applyAndClose = () => {
    onChange(draft);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="근무형태 설정">
      {/* ✅ 길면 스크롤 */}
      <div className="pr-1">
        <div className="space-y-4">
          {/* 1) 유형 */}
          <div className="space-y-3">
            {/* ✅ "일반(근무표 표시 안 함)" 제거 */}

            <CardButton
              active={draft.type === "DAY"}
              title="일반근무"
              desc="일반근무 시간(시작/종료) + 공제시간"
              onClick={() =>
                setDraft({
                  type: "DAY",
                  day:
                    draft.type === "DAY"
                      ? draft.day
                      : { start: "09:00", end: "18:00", breakMinutes: 60 },
                } as any)
              }
            />

            <CardButton
              active={draft.type === "SHIFT"}
              title="교대근무"
              desc="2/3/4교대 및 패턴, 시간, 공제시간"
              onClick={() => {
                const fallbackId: ShiftPatternId = "4_A";
                setDraft({
                  type: "SHIFT",
                  rotation: 4,
                  patternId: fallbackId,
                  times: isShift(draft) ? draft.times : { ...getDefaultTimes() },
                  anchorDate: isShift(draft) ? (draft as any).anchorDate ?? todayYMD() : todayYMD(),
                } as any);
              }}
            />
          </div>

          {/* 2) 일반근무 시간 */}
          {draft.type === "DAY" ? (
            <TimeRangePicker
              label="일반근무 시간"
              value={draft.day}
              onChange={(v) => setDraft({ ...draft, day: v } as any)}
            />
          ) : null}

          {/* 3) 교대 설정 */}
          {draft.type === "SHIFT" ? (
            <div className="space-y-3">
              {/* 교대 시작일 */}
              <div className="rounded-2xl border border-neutral-100 p-3">
                <div className="text-xs font-semibold text-neutral-700">교대 시작일</div>
                <div className="mt-2">
                  <input
                    type="date"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
                    value={(draft as any).anchorDate ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({ ...(p as any), anchorDate: e.target.value } as any))
                    }
                  />
                </div>
                <div className="mt-2 text-[11px] text-neutral-400">
                  이 날짜를 1일차로 해서 패턴이 반복됩니다.
                </div>
              </div>

              {/* 3-1) 2/3/4교대 + 직접입력 */}
<div className="grid grid-cols-4 gap-2">
  {[2, 3, 4].map((r) => {
    const active = isShift(draft) && draft.rotation === r && draft.patternId !== "CUSTOM";
    return (
      <button
        key={r}
        type="button"
        onClick={() => {
          const first = (Object.keys(SHIFT_PATTERNS) as ShiftPatternId[]).find(
            (id) => id !== "CUSTOM" && SHIFT_PATTERNS[id].rotation === r
          ) as ShiftPatternId;

          setDraft((p) => {
            const prevTimes = isShift(p) ? p.times : {};
            const prevPatternId = isShift(p) ? p.patternId : "4_A";
            const prevAnchor = isShift(p) ? (p as any).anchorDate ?? todayYMD() : todayYMD();

            return {
              type: "SHIFT",
              rotation: r as ShiftRotation,
              patternId: first ?? prevPatternId,
              times: { ...getDefaultTimes(), ...prevTimes },
              anchorDate: prevAnchor,
              // customCycle은 유지해도 되고 지워도 됨(난 유지 추천)
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

  {/* ✅ 직접입력 버튼 */}
  <button
    type="button"
    onClick={() => {
      setDraft((p) => {
        const prevTimes = isShift(p) ? p.times : {};
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
      isShift(draft) && draft.patternId === "CUSTOM"
        ? "border-neutral-900 ring-2 ring-neutral-900/10"
        : "border-neutral-100 text-neutral-600",
    ].join(" ")}
  >
    직접입력
  </button>
</div>
{/* ✅ CUSTOM 패턴 입력 */}
{draft.type === "SHIFT" && draft.patternId === "CUSTOM" ? (
  <div className="rounded-2xl border border-neutral-100 p-3">
    <div className="text-xs font-semibold text-neutral-700">패턴 직접입력</div>
    <div className="mt-2 text-[11px] text-neutral-500">
      예) <span className="font-semibold">주야비휴</span> / <span className="font-semibold">주 주 야 야 휴 휴</span> /
      <span className="font-semibold"> DAY NIGHT OFF REST</span>
      <br />
      사용가능: 주/저/야/당/비/휴 (또는 DAY/EVE/NIGHT/DANG/OFF/REST)
    </div>

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
              {/* 3-2) 패턴 (직접입력일 때 숨김) */}
{!(draft.type === "SHIFT" && draft.patternId === "CUSTOM") ? (
  <div className="space-y-2">
    <div className="text-xs font-semibold text-neutral-700">패턴</div>
    <div className="grid grid-cols-2 gap-2">
      {availablePatternIds.map((id) => {
        const active = isShift(draft) && draft.patternId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() =>
              setDraft((p) => {
                const prevTimes = isShift(p) ? p.times : {};
                const prevAnchor = isShift(p)
                  ? (p as any).anchorDate ?? todayYMD()
                  : todayYMD();
                return {
                  type: "SHIFT",
                  rotation: SHIFT_PATTERNS[id].rotation,
                  patternId: id,
                  times: { ...getDefaultTimes(), ...prevTimes },
                  anchorDate: prevAnchor,
                  // ✅ 내장 패턴 눌렀을 때는 customCycle 유지 or 삭제 선택
                  // customCycle: (p as any).customCycle, // 유지하고 싶으면 살려두기
                } as any;
              })
            }
            className={[
              "rounded-2xl border p-3 text-left",
              active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-100",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-neutral-900">
              {SHIFT_PATTERNS[id].title}
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              {SHIFT_PATTERNS[id].rotation}교대
            </div>
          </button>
        );
      })}
    </div>
  </div>
) : null}

              {/* 3-3) 근무 시간(+공제시간) */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-700">근무 시간</div>

                {neededCodes.length === 0 ? (
                  <div className="text-xs text-neutral-500">설정할 근무 시간이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {neededCodes.map((code) => {
                      const current =
                        (isShift(draft) ? draft.times?.[code] : undefined) ??
                        getDefaultTimes()[code] ??
                        ({ start: "09:00", end: "18:00", breakMinutes: 0 } as TimeRange);

                      return (
                        <TimeRangePicker
                          key={code}
                          label={codeLabel(code)}
                          value={current}
                          onChange={(v) =>
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

                              return {
                                ...prev,
                                times: { ...prev.times, [code]: v },
                              } as any;
                            })
                          }
                        />
                      );
                    })}
                  </div>
                )}

                <div className="text-[11px] text-neutral-400">
                  비번/휴무는 시간 설정을 생략합니다.
                </div>
              </div>
            </div>
          ) : null}

          {/* 하단 버튼 */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={applyAndClose}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
            >
              적용
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800"
              type="button"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}