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
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <nav className="pointer-events-auto w-full max-w-[430px] border-t border-neutral-100 bg-white">
        <div className="grid h-[68px] grid-cols-4 items-center pb-[env(safe-area-inset-bottom)]">
          {tabs.map((t) => {
            const active = pathname === t.href;

            return (
              <div key={t.href} className="flex justify-center">
                <Link
                  href={t.href}
                  className={[
                    "text-[13px] font-medium transition",
                    active
                      ? "rounded-full bg-neutral-900 px-5 py-[7px] text-white"
                      : "rounded-lg px-3 py-[6px] text-neutral-600 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}