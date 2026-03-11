"use client";

import Link from "next/link";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";
import { X } from "lucide-react";
export default function SideMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-50 bg-black/35 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-[60] h-dvh w-[320px] bg-white shadow-2xl transition-transform",
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="사이드 메뉴"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="text-sm font-semibold">메뉴</div>
          <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                    type="button"
                    aria-label="닫기"
                  >
                    <X size={18} />
                  </button>

        </div>

        <nav className="flex h-[calc(100dvh-58px)] flex-col px-5 py-4">
          <div className="text-xs text-neutral-500">바로가기</div>
          <div className="mt-3 space-y-2">
            <MenuLink href="/" label="홈" onClick={onClose} />
            <MenuLink href="/salary" label="공무원 봉급 알아보기" onClick={onClose} />
            <MenuLink href="/pension" label="공무원 연금 알아보기" onClick={onClose} />
            <MenuLink href="/calendar" label="일정 관리하기" onClick={onClose} />
          </div>

          <div className="mt-8 text-xs text-neutral-500">정보</div>
          <div className="mt-3 space-y-2">
            <button className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left text-sm hover:bg-neutral-50">
              출처 (준비중)
            </button>
                        <button className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left text-sm hover:bg-neutral-50">
              개인정보 처리 방침 (준비중)
            </button>
            <button className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-left text-sm hover:bg-neutral-50">
              문의 (준비중)
            </button>
          </div>
          <div className="mt-auto pb-2 pt-6">
            <NotificationSettingsCard compact />
          </div>
        </nav>
      </aside>
    </>
  );
}

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl border border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-50"
    >
      {label}
    </Link>
  );
}