"use client";

import React from "react";
import type { MoneyMode } from "@/lib/salary/types";
import { clampInt, formatNumberInput, formatWon } from "@/lib/salary/format";
import ModePill from "./ModePill";

export default function AutoMoneyLine({
  label,
  mode,
  autoValue,
  manualValue,
  onModeChange,
  onManualChange,
}: {
  label: string;
  mode: MoneyMode;
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

      <div className="mt-2">
        {mode === "auto" ? (
          <div className="text-sm font-semibold text-neutral-900">
            {formatWon(autoValue)}
          </div>
        ) : (
          <input
            inputMode="numeric"
            value={formatNumberInput(manualValue)}
            onChange={(e) =>
              onManualChange(clampInt(e.target.value, 0, 1_000_000_000))
            }
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        )}
      </div>
    </div>
  );
}