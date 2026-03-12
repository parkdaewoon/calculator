"use client";

import Link from "next/link";

export type PensionTabKey = "basic" | "severance" | "pension" | "compare";

const TABS: { key: PensionTabKey; label: string; href: string }[] = [
  { key: "basic", label: "기본 정보", href: "/pension/basic" },
  { key: "severance", label: "퇴직수당", href: "/pension/severance" },
  { key: "pension", label: "연금 계산", href: "/pension/calc" },
  { key: "compare", label: "비교", href: "/pension/compare" },
];

export default function PensionTabs({
  current,
}: {
  current: PensionTabKey;
}) {
  return (
    <div className="flex gap-2 rounded-3xl border border-neutral-200 bg-white p-2">
      {TABS.map((t) => {
        const active = t.key === current;

        return (
          <Link
            key={t.key}
            href={t.href}
            className={[
              "flex-1 rounded-2xl px-3 py-2 text-center text-xs font-semibold transition",
              active
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}