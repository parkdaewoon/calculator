"use client";

import React, { useEffect, useState } from "react";
import type { SummaryBarProps } from "./types";
import { formatHours } from "@/lib/calendar";
import {
  loadLeaveDaysUsedInput,
  loadLeaveDaysTotalInput,
} from "@/lib/calendar/leaveInput";
import LeaveDaysSheet from "./LeaveDaysSheet"; // ✅ 경로 맞춰줘

function formatLeavePair(used: number, total: number) {
  return `${used}일/${total}일`;
}

function formatHoursRatio(actual: number, normal?: number) {
  if (!normal || normal <= 0) return formatHours(actual);
  return `${formatHours(actual)}/${formatHours(normal)}`;
}

export default function SummaryBar({ stats, onOpenWorkSummary }: SummaryBarProps) {
  const [openLeaveSheet, setOpenLeaveSheet] = useState(false);

  const [leaveUsed, setLeaveUsed] = useState(0);
  const [leaveTotal, setLeaveTotal] = useState(0);

  useEffect(() => {
    setLeaveUsed(loadLeaveDaysUsedInput());
    setLeaveTotal(loadLeaveDaysTotalInput());
  }, []);

  // Sheet 닫힐 때 저장된 값 다시 읽어서 반영(저장 버튼 누른 결과 반영)
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
            {/* ✅ 연가일수: 직접 입력 Sheet */}
            <button
  onClick={() => setOpenLeaveSheet(true)}
  className="relative rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left"
  type="button"
>
  {/* 🔹 오른쪽 맨 위 아이콘 */}
  <div className="absolute top-[0.2rem] right-[0.5rem] text-xm text-neutral-400 mt-1">
    +
  </div>

  {/* 라벨 */}
  <div className="text-[11px] font-semibold text-neutral-500 pl-[0.2rem]">
    연가일수
  </div>

  {/* 값: 오른쪽 정렬 */}
  <div className="mt-1 text-lg font-semibold text-neutral-900 text-right pr-[0.2rem]">
    {formatLeavePair(leaveUsed, leaveTotal)}
  </div>
</button>
            {/* 총근무시간 */}
            <button
  onClick={onOpenWorkSummary}
  className="relative rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left"
  type="button"
>
  {/* 🔹 오른쪽 맨 위 아이콘 */}
  <div className="absolute top-[0.2rem] right-[0.5rem] text-xm text-neutral-400 mt-1">
    +
  </div>

  {/* 라벨 */}
  <div className="text-[11px] font-semibold text-neutral-500 pl-[0.2rem]">
    총 근무시간
  </div>

  {/* 값: 오른쪽 정렬 */}
  <div className="mt-1 text-lg font-semibold text-neutral-900 text-right pr-[0.2rem]">
    {formatHoursRatio(stats.totalHours, (stats as any).normalHours)}
  </div>
</button>
          </div>
        </div>
      </section>

      {/* ✅ WorkSummarySheet처럼 따로 분리한 연가 Sheet */}
      <LeaveDaysSheet open={openLeaveSheet} onClose={onCloseLeaveSheet} />
    </>
  );
}