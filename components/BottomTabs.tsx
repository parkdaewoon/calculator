"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "홈" },
  { href: "/salary", label: "봉급" },
  { href: "/pension", label: "연금" },
  { href: "/calendar", label: "달력" },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full bg-white backdrop-blur pb-[env(safe-area-inset-bottom)]">
  <div className="h-px w-full bg-neutral-100" />
  <div className="grid grid-cols-4 px-3 py-4">
    {tabs.map((t) => {
      const active = pathname === t.href;
      return (
        <Link
          key={t.href}
          href={t.href}
          className={[
            "mx-1 rounded-xl px-2 py-2 text-center text-[12px] transition",
            active
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-50",
          ].join(" ")}
        >
          {t.label}
        </Link>
      );
    })}
  </div>
</nav>
  );
}