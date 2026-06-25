"use client";

import React, { useEffect, useState } from "react";
import type { SummaryBarProps } from "./types";
import { formatHours } from "@/lib/calendar";
import {
  loadLeaveDaysUsedInput,
  loadLeaveDaysTotalInput,
} from "@/lib/calendar/leaveInput";
import LeaveDaysSheet from "./LeaveDaysSheet";

// ✅ 저장된 소수(일) -> "일 시간 분" (1일=8시간=480분)
function leaveDaysToDHM(days: number) {
  const totalMinutes = Math.max(0, Math.round((Number(days) || 0) * 480));
  const d = Math.floor(totalMinutes / 480);
  const rem = totalMinutes % 480;
  const h = Math.floor(rem / 60);
  const m = rem % 60;
  return { d, h, m };
}

// ✅ 표시용: "2일 3시간 30분 / 15일"을 항상 한 줄로 보여준다.
function formatLeaveDisplay(usedDaysDecimal: number, totalDays: number) {
  const { d, h, m } = leaveDaysToDHM(usedDaysDecimal);
  const usedText = `${d}일 ${h}시간 ${m}분`;
  const totalText = `${Number(totalDays || 0)}일`;

  return `${usedText} / ${totalText}`;
}

function formatHoursRatio(actual: number, normal?: number) {
  if (!normal || normal <= 0) return formatHours(actual);
  return `${formatHours(actual)}/${formatHours(normal)}`;
}

const summaryButtonClass =
  "relative min-w-0 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left";
const summaryLabelClass =
  "pl-[0.2rem] text-[11px] font-semibold leading-none text-neutral-500";
const summaryValueClass =
  "mt-2 min-h-[18px] overflow-hidden whitespace-nowrap pr-[0.2rem] text-right text-[12px] font-semibold leading-[18px] tracking-[-0.03em] text-neutral-900";

export default function SummaryBar({ stats, onOpenWorkSummary }: SummaryBarProps) {
  const [openLeaveSheet, setOpenLeaveSheet] = useState(false);

  const [leaveUsed, setLeaveUsed] = useState(0);   // 저장값(소수 일)
  const [leaveTotal, setLeaveTotal] = useState(0); // 총 연가(일)

  useEffect(() => {
    setLeaveUsed(loadLeaveDaysUsedInput());
    setLeaveTotal(loadLeaveDaysTotalInput());
  }, []);

  const onCloseLeaveSheet = () => {
    setOpenLeaveSheet(false);
    setLeaveUsed(loadLeaveDaysUsedInput());
    setLeaveTotal(loadLeaveDaysTotalInput());
  };

  return (
    <>
      <section className="mx-auto w-full max-w-md px-4">
        <div className="mt-4 rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-3">
            {/* ✅ 연가일수 */}
            <button
              onClick={() => setOpenLeaveSheet(true)}
              className={summaryButtonClass}
              type="button"
            >
              <div className="absolute right-[0.5rem] top-[0.2rem] mt-1 text-xs text-neutral-400">
                +
              </div>

              <div className={summaryLabelClass}>
                연가일수
              </div>

              <div className={summaryValueClass}>
                {formatLeaveDisplay(leaveUsed, leaveTotal)}
              </div>
            </button>

            {/* 총근무시간 */}
            <button
              onClick={onOpenWorkSummary}
              className={summaryButtonClass}
              type="button"
            >
              <div className="absolute right-[0.5rem] top-[0.2rem] mt-1 text-xs text-neutral-400">
                +
              </div>

              <div className={summaryLabelClass}>
                총 근무시간
              </div>

              <div className={summaryValueClass}>
                {formatHoursRatio(stats.totalHours, (stats as any).normalHours)}
              </div>
            </button>
          </div>
        </div>
      </section>

      <LeaveDaysSheet open={openLeaveSheet} onClose={onCloseLeaveSheet} />
    </>
  );
}
