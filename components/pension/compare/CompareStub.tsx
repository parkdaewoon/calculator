"use client";

import React from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";

export default function CompareStub({ profile }: { profile: BaseProfile }) {
  return (
    <SectionCard title="납부액·수령액 비교(준비중)">
      <div className="text-sm text-neutral-700">
        저장된 기본정보를 받아왔어요:
      </div>
      <pre className="mt-3 overflow-auto rounded-2xl bg-neutral-50 p-3 text-[12px] text-neutral-700">
        {JSON.stringify(profile, null, 2)}
      </pre>
      <div className="mt-3 text-[12px] text-neutral-500">
        다음 단계: <b>lib/domain/compare/calc.ts</b>에서 연금/퇴직 결과를 합쳐 소득대체율까지 계산해요.
      </div>
    </SectionCard>
  );
}
