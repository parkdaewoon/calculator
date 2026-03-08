"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { WorkSummarySheetProps } from "./types";
import Sheet from "./Sheet";
import { formatHours } from "@/lib/calendar";
import {
  loadOvertimeHoursInput,
  saveOvertimeHoursInput,
} from "@/lib/calendar/overtimeInput";
import { X } from "lucide-react";

function clamp1(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 10) / 10; // 소수 1자리
}

export default function WorkSummarySheet({
  open,
  onClose,
  stats,
  month,
}: WorkSummarySheetProps) {
  const [otInput, setOtInput] = useState<string>("0");

  // ✅ 시트가 열릴 때 + month가 바뀔 때 -> 해당 월 값을 로드
  useEffect(() => {
    if (!open) return;
    const v = loadOvertimeHoursInput(month);
    setOtInput(String(v ?? 0));
  }, [open, month]);

  const parsedOT = useMemo(() => {
    const n = Number(otInput);
    if (!Number.isFinite(n)) return null;
    return clamp1(n);
  }, [otInput]);

  // ✅ 입력값이 유효하면 "해당 월"로 저장
  useEffect(() => {
    if (!open) return;
    if (parsedOT == null) return;
    saveOvertimeHoursInput(month, parsedOT);
  }, [parsedOT, open, month]);

  // ✅ (중요) 휴일공제시간(시간): stats에서 내려준 값을 우선 사용
  // - 없으면 fallback: 휴일근무일수 × 8
  const holidayDeductHours =
    Number((stats as any).holidayDeductHours) || (stats.holidayDays ?? 0) * 8;

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="space-y-3">
        {/* ✅ 헤더: 근무시간 상세 + X */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
    <div className="text-sm font-semibold text-neutral-900 ml-2">
      근무시간 상세
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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-neutral-500">
                총 근무시간(휴일근무시간 제외)
              </div>
              <div className="mt-1 text-xl font-semibold text-neutral-900">
                {formatHours(stats.totalHours)}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[11px] font-semibold text-neutral-500">
                초과근무(시간)
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <input
                  value={otInput}
                  onChange={(e) => setOtInput(e.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className="w-[92px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-right text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-400"
                />
                <div className="text-sm font-semibold text-neutral-600">h</div>
              </div>

              {parsedOT == null && (
                <div className="mt-1 text-[11px] text-red-500">
                  숫자로 입력해줘.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="text-[11px] font-semibold text-neutral-500">
              야간근무(시간)
            </div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {formatHours(stats.nightHours)}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="text-[11px] font-semibold text-neutral-500">
              휴일근무
            </div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {stats.holidayDays}일
            </div>
          </div>
        </div>

        {/* ✅ 기존 하단 닫기 버튼 제거 */}
      </div>
    </Sheet>
  );
}