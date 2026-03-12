"use client";

import React from "react";
import type { MoneyMode } from "@/lib/salary/types";
import { clampInt, formatNumberInput, formatWon } from "@/lib/salary/format";
import DraftNumberInput from "./DraftNumberInput";
import ModePill from "./ModePill";

export default function AutoTimeMoneyLine({
  label,
  mode,
  hours,
  onHoursChange,
  autoValue,
  manualValue,
  onModeChange,
  onManualChange,
}: {
  label: string;
  mode: MoneyMode;
  hours: number;
  onHoursChange: (h: number) => void;
  autoValue: number;
  manualValue: number;
  onModeChange: (m: MoneyMode) => void;
  onManualChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-900">{label}</div>
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          <ModePill
            active={mode === "auto"}
            label="자동"
            onClick={() => onModeChange("auto")}
          />
          <ModePill
            active={mode === "manual"}
            label="직접"
            onClick={() => onModeChange("manual")}
          />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <div className="text-xs text-neutral-500">시간</div>
          <DraftNumberInput
            key={`hours:${label}:${hours}`}
            value={hours}
            min={0}
            max={300}
            onCommit={onHoursChange}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        {mode === "auto" ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">자동 금액</div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {formatWon(autoValue)}
            </div>
          </div>
        ) : (
          <label className="block">
            <div className="text-xs text-neutral-500">직접 금액</div>
            <input
              inputMode="numeric"
              value={formatNumberInput(manualValue)}
              onChange={(e) =>
                onManualChange(clampInt(e.target.value, 0, 1_000_000_000))
              }
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>
    </div>
  );
}