"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sheet from "./Sheet";
import {
  loadLeaveDaysTotalInput,
  loadLeaveDaysUsedInput,
  saveLeaveDaysTotalInput,
  saveLeaveDaysUsedInput,
} from "@/lib/calendar/leaveInput";
import { X } from "lucide-react";

export type LeaveDaysSheetProps = {
  open: boolean;
  onClose: () => void;
};

function clampLeave(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  const v = Math.trunc(n);
  return Math.min(max, Math.max(min, v));
}

// ✅ 소수 일수(저장값)를 "일/시간/분"으로 표시 (1일=8시간=480분)
function toDHM(days: number) {
  const totalMinutes = Math.max(0, Math.round(days * 480));
  const d = Math.floor(totalMinutes / 480);
  const rem = totalMinutes % 480;
  const h = Math.floor(rem / 60);
  const m = rem % 60;
  return { d, h, m };
}

// ✅ 숫자만 남기기 (빈 문자열 허용)
function onlyDigits(raw: string) {
  return raw.replace(/[^0-9]/g, "");
}

export default function LeaveDaysSheet({ open, onClose }: LeaveDaysSheetProps) {
  // ✅ 사용한 연가: 일/시간/분 (환산표시 X, 그대로 입력)
  const [usedDayInput, setUsedDayInput] = useState<string>("0");
  const [usedHourInput, setUsedHourInput] = useState<string>("0");
  const [usedMinuteInput, setUsedMinuteInput] = useState<string>("0");

  // ✅ 전체 연가(일)
  const [totalInput, setTotalInput] = useState<string>("0");

  useEffect(() => {
    if (!open) return;

    const used = loadLeaveDaysUsedInput(); // 저장은 "일(소수)"로 되어 있음
    const total = loadLeaveDaysTotalInput();

    // ✅ 오픈 시: 저장된 used(소수일)를 일/시간/분으로 풀어서 채워줌
    const dhm = toDHM(Number(used ?? 0));
    setUsedDayInput(String(dhm.d));
    setUsedHourInput(String(dhm.h));
    setUsedMinuteInput(String(dhm.m));

    setTotalInput(String(total ?? 0));
  }, [open]);

  const parsedUsedDay = useMemo(() => {
    const n = Number(usedDayInput);
    if (!Number.isFinite(n)) return null;
    return clampInt(n, 0, 3650); // 넉넉히 가
  }, [usedDayInput]);

  const parsedUsedHour = useMemo(() => {
    const n = Number(usedHourInput);
    if (!Number.isFinite(n)) return null;
    return clampInt(n, 0, 23);
  }, [usedHourInput]);

  const parsedUsedMinute = useMemo(() => {
    const n = Number(usedMinuteInput);
    if (!Number.isFinite(n)) return null;
    return clampInt(n, 0, 59);
  }, [usedMinuteInput]);

  const parsedTotal = useMemo(() => {
    const n = Number(totalInput);
    if (!Number.isFinite(n)) return null;
    return clampLeave(n);
  }, [totalInput]);

  // ✅ 저장용 환산(내부 계산만): (일/시간/분) -> 소수 일
  const usedTotalMinutes = useMemo(() => {
    if (parsedUsedDay == null || parsedUsedHour == null || parsedUsedMinute == null)
      return null;
    return parsedUsedDay * 480 + parsedUsedHour * 60 + parsedUsedMinute;
  }, [parsedUsedDay, parsedUsedHour, parsedUsedMinute]);

  const usedDaysForSave = useMemo(() => {
    if (usedTotalMinutes == null) return null;
    return usedTotalMinutes / 480;
  }, [usedTotalMinutes]);

  const hasInvalid =
    parsedUsedDay == null ||
    parsedUsedHour == null ||
    parsedUsedMinute == null ||
    parsedTotal == null ||
    usedDaysForSave == null;

  const hasLogicError =
    usedDaysForSave != null &&
    parsedTotal != null &&
    parsedTotal > 0 &&
    usedDaysForSave > parsedTotal;

  const onSave = () => {
    if (hasInvalid) return;
    if (hasLogicError) return;

    // ✅ 저장은 소수 일로만 (UI는 환산표시 안 함)
    saveLeaveDaysUsedInput(clampLeave(usedDaysForSave!));
    saveLeaveDaysTotalInput(parsedTotal!);
    onClose();
  };

  const onReset = () => {
    saveLeaveDaysUsedInput(0);
    saveLeaveDaysTotalInput(0);

    setUsedDayInput("0");
    setUsedHourInput("0");
    setUsedMinuteInput("0");
    setTotalInput("0");

    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="ml-2 text-sm font-semibold text-neutral-900">
            연가일수 입력
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <div className="text-[11px] font-semibold text-neutral-500">연가 정보</div>

          {/* 사용한 연가 */}
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-neutral-500">사용한 연가</div>

            {/* ✅ 한 줄 3칸 + 크기 조금 줄임 + 가운데 정렬 */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              {/* 일 */}
              <div className="flex items-center gap-1">
                <input
                  value={usedDayInput}
                  onChange={(e) => setUsedDayInput(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-center outline-none focus:border-neutral-400"
                />
                <span className="shrink-0 text-[11px] font-semibold text-neutral-600">
                  일
                </span>
              </div>

              {/* 시간 */}
              <div className="flex items-center gap-1">
                <input
                  value={usedHourInput}
                  onChange={(e) => setUsedHourInput(onlyDigits(e.target.value))}
                  onFocus={(e) => e.currentTarget.select()}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-center outline-none focus:border-neutral-400"
                />
                <span className="shrink-0 text-[11px] font-semibold text-neutral-600">
                  시간
                </span>
              </div>

              {/* 분 */}
              <div className="flex items-center gap-1">
                <input
                  value={usedMinuteInput}
                  onChange={(e) => setUsedMinuteInput(onlyDigits(e.target.value))}
                  onFocus={(e) => e.currentTarget.select()}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-center outline-none focus:border-neutral-400"
                />
                <span className="shrink-0 text-[11px] font-semibold text-neutral-600">
                  분
                </span>
              </div>
            </div>

            {/* ✅ 환산 표시 제거(요청사항) */}
          </div>

          {/* 전체 연가 */}
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-neutral-500">전체 연가일수</div>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                inputMode="decimal"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-center outline-none focus:border-neutral-400"
              />
              <span className="text-sm font-semibold text-neutral-700">일</span>
            </div>

            {parsedTotal == null && (
              <div className="mt-2 text-[11px] text-red-500">전체 일수는 숫자로 입력해줘.</div>
            )}
          </div>

          {hasLogicError && (
            <div className="mt-3 text-[11px] text-red-500">
              사용한 연가일수는 전체 연가일수보다 클 수 없어.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700"
            type="button"
          >
            초기화
          </button>

          <button
            onClick={onSave}
            disabled={hasInvalid || hasLogicError}
            className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </Sheet>
  );
}