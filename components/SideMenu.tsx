"use client";

import Link from "next/link";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";
import { X } from "lucide-react";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";

export default function SideMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useLockBodyScroll(open);

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
          "fixed right-0 top-0 z-[60] flex h-dvh w-[320px] max-w-[86vw] flex-col bg-white shadow-2xl transition-transform",
          "overscroll-contain",
          open
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="사이드 메뉴"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
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

        <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="text-xs text-neutral-500">바로가기</div>
          <div className="mt-3 space-y-2">
            <MenuLink href="/salary" label="공무원 봉급 알아보기" onClick={onClose} />
            <MenuLink href="/pension" label="공무원 연금 알아보기" onClick={onClose} />
            <MenuLink href="/guide" label="공무원 가이드" onClick={onClose} />
            <MenuLink href="/calendar" label="일정 관리하기" onClick={onClose} />
          </div>

          <div className="mt-8 text-xs text-neutral-500">사이트 안내</div>
          <div className="mt-3 space-y-2">
            <MenuLink href="/about" label="공무원 노트 소개" onClick={onClose} />
            <MenuLink href="/editorial-policy" label="콘텐츠 작성 기준" onClick={onClose} />
            <MenuLink href="/checklist" label="이용 체크리스트" onClick={onClose} />
          </div>

          <div className="mt-8 text-xs text-neutral-500">정보</div>
          <div className="mt-3 space-y-2">
            <MenuLink href="/sources" label="출처" onClick={onClose} />
            <MenuLink href="/privacy" label="개인정보 처리방침" onClick={onClose} />
            <MenuLink href="/terms" label="이용약관" onClick={onClose} />
            <MenuLink href="/disclaimer" label="면책조항" onClick={onClose} />
            <MenuLink href="/pwa-install" label="앱(APP) 사용 방법" onClick={onClose} />
            <MenuLink href="/contact" label="문의" onClick={onClose} />
          </div>

          <div className="pb-2 pt-6">
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
