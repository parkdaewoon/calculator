"use client";

import React from "react";

export type PensionTabKey = "basic" | "severance" | "pension" | "compare";

const TABS: { key: PensionTabKey; label: string }[] = [
  { key: "basic", label: "기본 정보" },
  { key: "severance", label: "퇴직수당" },
  { key: "pension", label: "연금 계산" },
  { key: "compare", label: "비교" },
];

export default function PensionTabs({
  value,
  onChange,
}: {
  value: PensionTabKey;
  onChange: (v: PensionTabKey) => void;
}) {
  return (
    <div className="flex gap-2 rounded-3xl border border-neutral-200 bg-white p-2">
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={[
              "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
              active
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
