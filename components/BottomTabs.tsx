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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <nav className="w-full max-w-[430px] border-t border-neutral-100 bg-white">
        <div className="grid grid-cols-4 h-[64px] items-center pb-[env(safe-area-inset-bottom)]">
          {tabs.map((t) => {
            const active = pathname === t.href;

            return (
              <div key={t.href} className="flex justify-center">
                <Link
                  href={t.href}
                  className={[
                    "text-[13px] font-medium transition",
                    active
                      ? "bg-neutral-900 text-white px-5 py-[7px] rounded-full"
                      : "text-neutral-600 px-3 py-[6px] rounded-lg hover:bg-neutral-50",
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