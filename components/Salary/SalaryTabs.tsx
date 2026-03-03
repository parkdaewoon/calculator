"use client";

import * as React from "react";
import { Calculator, Table2, Wallet, Plane } from "lucide-react";

export type SalaryTabKey = "payTable" | "allowances" | "travel" | "calculator";

const MENU: Array<{
  key: SalaryTabKey;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "payTable", title: "봉급표", desc: "직렬/직급/호봉 봉급 확인", Icon: Table2 },
  { key: "allowances", title: "수당제도", desc: "수당 기준/항목", Icon: Wallet },
  { key: "travel", title: "여비제도", desc: "정산 기준/규정", Icon: Plane },
  { key: "calculator", title: "봉급 계산", desc: "월급 자동 계산", Icon: Calculator },
];

export default function SalaryMenuGrid({
  onSelect,
}: {
  onSelect: (key: SalaryTabKey) => void;
}) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-2 gap-3">
        {MENU.map(({ key, title, desc, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="group rounded-3xl border border-neutral-200 bg-white p-4 text-left transition hover:bg-neutral-50"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl border border-neutral-200 bg-white p-2">
                <Icon className="h-5 w-5 text-neutral-900" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-base font-semibold tracking-tight text-neutral-900">
                {title}
              </div>
              <div className="mt-1 text-xs text-neutral-500">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}