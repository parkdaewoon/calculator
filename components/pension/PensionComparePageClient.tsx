"use client";

import PensionPageHeader from "@/components/pension/PensionPageHeader";
import CompareStub from "@/components/pension/compare/CompareStub";
import { useProfileDraft } from "@/lib/hooks/useProfileDraft";
import AdsenseSlot from "@/components/AdsenseSlot";
export default function PensionComparePageClient() {
  const { profile, hydrated } = useProfileDraft();

  if (!hydrated) {
    return <div className="p-4 text-sm text-neutral-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-5">
      <PensionPageHeader
        title="납부액·수령액 비교"
        description="저장된 기본 정보를 기준으로 납부액과 예상 수령액을 비교합니다."
      />

      <CompareStub profile={profile} />
            <div className="mt-4 flex justify-center">
                <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
                  <AdsenseSlot slot="8421356790" height={50} />
                </div>
              </div>
    </div>
  );
}