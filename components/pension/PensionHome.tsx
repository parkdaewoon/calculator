"use client";

import PensionMenuGrid from "@/components/Pension/nav/PensionMenuGrid";
import AdsenseSlot from "@/components/AdsenseSlot";

export default function PensionHome() {
  return (
    <div className="space-y-5">
      <div className="space-y-5">
        <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight">
            공무원 연금 알아보기
          </h1>
        </div>

        <p className="mt-3 text-sm tracking-tighter text-neutral-500">
          기본정보, 퇴직수당, 연금 계산, 납부·수령 비교 메뉴를 선택하세요.
        </p>
      </div>

      <PensionMenuGrid />

      <section className="pt-2">
        <div className="mt-2 h-px bg-neutral-100" />

        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot slot="1234567890" height={50} />
          </div>
        </div>
      </section>

      <div className="h-2" />
    </div>
  );
}