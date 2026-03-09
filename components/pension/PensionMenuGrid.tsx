"use client";

import * as React from "react";
import { User, Wallet, Landmark, BarChart3 } from "lucide-react";

export type PensionTabKey =
  | "basic"
  | "severance"
  | "pension"
  | "compare";

const MENU: Array<{
  key: PensionTabKey;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "basic",
    title: "기본 정보",
    desc: "재직/퇴직 기준 입력",
    Icon: User,
  },
  {
    key: "severance",
    title: "퇴직수당",
    desc: "예상 실수령액/시뮬",
    Icon: Wallet,
  },
  {
    key: "pension",
    title: "연금 계산",
    desc: "예상 수령액/시뮬",
    Icon: Landmark,
  },
  {
    key: "compare",
    title: "납부·수령 비교",
    desc: "소득대체율 포함",
    Icon: BarChart3,
  },
];

export default function PensionMenuGrid({
  onSelect,
}: {
  onSelect: (key: PensionTabKey) => void;
}) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-2 gap-3">
        {MENU.map(({ key, title, desc, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="group w-full select-none touch-manipulation rounded-3xl border border-neutral-200 bg-white p-4 text-left transition hover:bg-neutral-50"
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