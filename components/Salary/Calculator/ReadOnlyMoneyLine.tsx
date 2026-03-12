"use client";

import React from "react";
import { formatWon } from "@/lib/salary/format";

export default function ReadOnlyMoneyLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="text-sm text-neutral-900">{label}</div>
      <div className="mt-2 text-sm font-semibold text-neutral-900">
        {formatWon(value)}
      </div>
    </div>
  );
}