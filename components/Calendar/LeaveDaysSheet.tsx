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
  return Math.round(n * 10) / 10;
}

export default function LeaveDaysSheet({ open, onClose }: LeaveDaysSheetProps) {
  const [usedInput, setUsedInput] = useState<string>("0");
  const [totalInput, setTotalInput] = useState<string>("0");

  useEffect(() => {
    if (!open) return;
    const used = loadLeaveDaysUsedInput();
    const total = loadLeaveDaysTotalInput();
    setUsedInput(String(used ?? 0));
    setTotalInput(String(total ?? 0));
  }, [open]);

  const parsedUsed = useMemo(() => {
    const n = Number(usedInput);
    if (!Number.isFinite(n)) return null;
    return clampLeave(n);
  }, [usedInput]);

  const parsedTotal = useMemo(() => {
    const n = Number(totalInput);
    if (!Number.isFinite(n)) return null;
    return clampLeave(n);
  }, [totalInput]);

  const hasInvalid = parsedUsed == null || parsedTotal == null;

  const hasLogicError =
    parsedUsed != null &&
    parsedTotal != null &&
    parsedTotal > 0 &&
    parsedUsed > parsedTotal;

  const onSave = () => {
    if (hasInvalid) return;
    if (hasLogicError) return;

    saveLeaveDaysUsedInput(parsedUsed!);
    saveLeaveDaysTotalInput(parsedTotal!);
    onClose();
  };

  const onReset = () => {
    saveLeaveDaysUsedInput(0);
    saveLeaveDaysTotalInput(0);
    setUsedInput("0");
    setTotalInput("0");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="space-y-3">

        {/* ✅ 헤더 (연가일수 입력 + X 버튼) */}
  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
    <div className="text-sm font-semibold text-neutral-900 ml-2">
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
          <div className="text-[11px] font-semibold text-neutral-500">
            연가 정보
          </div>

          {/* 사용한 연가 */}
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-neutral-500">
              사용한 연가일수
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={usedInput}
                onChange={(e) => setUsedInput(e.target.value)}
                inputMode="decimal"
                placeholder="예: 12 또는 12.5"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 outline-none focus:border-neutral-400"
              />
              <div className="shrink-0 text-sm font-semibold text-neutral-700">
                일
              </div>
            </div>

            {parsedUsed == null && (
              <div className="mt-2 text-[11px] text-red-500">
                사용 일수는 숫자로 입력해줘.
              </div>
            )}
          </div>

          {/* 전체 연가 */}
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-neutral-500">
              전체 연가일수
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
                inputMode="decimal"
                placeholder="예: 15 또는 20"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 outline-none focus:border-neutral-400"
              />
              <div className="shrink-0 text-sm font-semibold text-neutral-700">
                일
              </div>
            </div>

            {parsedTotal == null && (
              <div className="mt-2 text-[11px] text-red-500">
                전체 일수는 숫자로 입력해줘.
              </div>
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