"use client";

import React from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";

export default function SeveranceStub({ profile }: { profile: BaseProfile }) {
  return (
    <SectionCard title="퇴직수당 계산(준비중)">
      <div className="text-sm text-neutral-700">
        저장된 기본정보를 받아왔어요:
      </div>
      <pre className="mt-3 overflow-auto rounded-2xl bg-neutral-50 p-3 text-[12px] text-neutral-700">
        {JSON.stringify(profile, null, 2)}
      </pre>
      <div className="mt-3 text-[12px] text-neutral-500">
        다음 단계: <b>lib/domain/severance/calc.ts</b>에 계산 로직을 넣고 결과 카드 컴포넌트로 교체하면 됩니다.
      </div>
    </SectionCard>
  );
}
