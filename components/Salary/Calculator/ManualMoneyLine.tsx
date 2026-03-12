"use client";

import React from "react";
import { clampInt, formatNumberInput } from "@/lib/salary/format";

export default function ManualMoneyLine({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 p-3">
      <div className="text-sm text-neutral-900">{label}</div>
      <input
        inputMode="numeric"
        value={formatNumberInput(value)}
        onChange={(e) => onChange(clampInt(e.target.value, 0, 1_000_000_000))}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}