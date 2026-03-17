"use client";

import SalaryMenuGrid from "@/components/Salary/SalaryMenuGrid";
import AdsenseSlot from "@/components/AdsenseSlot";
export default function SalaryHome() {
  return (
    <div className="space-y-5">
      <section className="pt-1">
        <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
            공무원 봉급 알아보기
          </h1>
        </div>

        <p className="mt-3 text-sm text-neutral-500">
          봉급표, 수당제도, 여비제도, 봉급 계산 메뉴를 선택하세요.
        </p>
      </section>

      <SalaryMenuGrid />
<div className="mt-4 flex justify-center">
    <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
      <AdsenseSlot slot="8421356790" height={50} />
    </div>
  </div>
      
    </div>
  );
}