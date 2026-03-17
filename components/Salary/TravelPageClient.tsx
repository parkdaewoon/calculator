"use client";

import { useRouter } from "next/navigation";
import TravelSection from "@/components/Salary/sections/TravelSection";
import AdsenseSlot from "@/components/AdsenseSlot";
export default function TravelPageClient() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <section className="pt-1">
        <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            여비제도
          </h1>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-7 items-center rounded-full border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 active:scale-[0.98]"
          >
            전체메뉴
          </button>
        </div>
      </section>

      <TravelSection />
      <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot slot="8421356790" height={50} />
          </div>
        </div>
    </div>
  );
}