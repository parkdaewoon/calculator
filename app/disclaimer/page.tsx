import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "면책조항",
  description:
    "공무원 노트에서 제공하는 봉급, 수당, 연금, 퇴직수당 계산 결과와 안내 정보의 이용상 주의사항을 안내합니다.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">면책조항</h1>

      <section className="space-y-3">
        <p>
          공무원 노트는 공무원 봉급, 수당, 연금, 퇴직수당, 일정 관리와 관련된 정보를 쉽게
          이해할 수 있도록 제공하는 비공식 참고 서비스입니다. 이용자가 급여 구조와 계산 흐름을
          파악하는 데 도움을 주는 것을 목적으로 하며, 공식 행정 판단이나 확정 금액 안내를
          대체하지 않습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">1. 정보의 정확성</h2>
        <p>
          서비스에서 제공되는 봉급, 수당, 연금, 퇴직수당 및 기타 계산 결과는 공개 자료와 일반적인
          계산 구조를 바탕으로 한 참고용 정보입니다. 실제 지급 금액은 소속 기관, 개인별 공제 상황,
          재직 이력, 적용 기준, 법령 개정 여부에 따라 달라질 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">2. 법적 효력</h2>
        <p>
          본 서비스의 계산 결과와 설명은 법적 효력을 가지지 않습니다. 인사, 급여, 연금, 퇴직 관련
          공식 확인이 필요한 경우에는 소속 기관의 담당 부서, 인사혁신처, 공무원연금공단, 국가법령정보센터
          등 공식 자료를 확인해야 합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">3. 계산 결과의 한계</h2>
        <p>
          계산기는 사용자가 입력한 값을 기준으로 예상 결과를 보여줍니다. 입력값이 실제와 다르거나,
          특정 수당의 지급 요건이 충족되지 않거나, 공제 기준이 개인별로 다르게 적용되는 경우 결과가
          달라질 수 있습니다. 계산 결과는 비교와 이해를 위한 보조 자료로 활용해 주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">4. 손해에 대한 책임</h2>
        <p>
          이용자가 본 서비스의 정보 또는 계산 결과를 활용해 의사결정을 하면서 발생한 직접적·간접적
          손해에 대해 서비스 운영자는 책임을 지지 않습니다. 중요한 재정 계획이나 공식 제출 자료가
          필요한 경우에는 반드시 공식 기관의 확인을 거쳐야 합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">5. 외부 서비스와 광고</h2>
        <p>
          서비스에는 광고 또는 외부 링크가 포함될 수 있습니다. 외부 서비스의 개인정보 처리, 이용 조건,
          콘텐츠 정확성은 각 제공자의 정책을 따릅니다. 공무원 노트는 외부 사이트의 운영 내용에 대해
          책임을 지지 않습니다.
        </p>
      </section>

      <p className="mt-10 text-xs text-neutral-500">시행일: 2026년 3월 11일</p>
    </main>
  );
}
