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

// ✅ 표시용: "2일 3시간 30분 / 15일"
function formatLeaveDisplay(usedDaysDecimal: number, totalDays: number) {
  const { d, h, m } = leaveDaysToDHM(usedDaysDecimal);

  // "0시간 0분"처럼 지저분하면 깔끔하게 제거(원하면 항상 표시로 바꿔도 됨)
  const parts: string[] = [];
  parts.push(`${d}일`);
  if (h > 0 || m > 0) {
    parts.push(`${h}시간`);
    parts.push(`${m}분`);
  }

  const usedText = parts.join(" ");
  const totalText = `${Number(totalDays || 0)}일`;

  return `${usedText} / ${totalText}`;
}

function formatHoursRatio(actual: number, normal?: number) {
  if (!normal || normal <= 0) return formatHours(actual);
  return `${formatHours(actual)}/${formatHours(normal)}`;
}

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
              className="relative rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left"
              type="button"
            >
              <div className="absolute right-[0.5rem] top-[0.2rem] mt-1 text-xs text-neutral-400">
                +
              </div>

              <div className="pl-[0.2rem] text-[11px] font-semibold text-neutral-500">
                연가일수
              </div>

              <div className="mt-1 pr-[0.2rem] text-right text-[15px] font-semibold leading-snug text-neutral-900">
                {formatLeaveDisplay(leaveUsed, leaveTotal)}
              </div>
            </button>

            {/* 총근무시간 */}
            <button
              onClick={onOpenWorkSummary}
              className="relative rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left"
              type="button"
            >
              <div className="absolute right-[0.5rem] top-[0.2rem] mt-1 text-xs text-neutral-400">
                +
              </div>

              <div className="pl-[0.2rem] text-[11px] font-semibold text-neutral-500">
                총 근무시간
              </div>

              <div className="mt-1 pr-[0.2rem] text-right text-lg font-semibold text-neutral-900">
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