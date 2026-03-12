"use client";

import React from "react";
import { clampInt, formatNumberInput } from "@/lib/salary/format";

export default function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <input
        inputMode="numeric"
        value={formatNumberInput(value ?? 0)}
        onChange={(e) => onChange(clampInt(e.target.value, 0, 1_000_000_000))}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}