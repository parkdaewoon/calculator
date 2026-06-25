import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "콘텐츠 작성 기준",
  description: "공무원 노트의 콘텐츠 작성 기준과 업데이트 방식을 안내합니다.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">콘텐츠 작성 기준</h1>
      <section className="space-y-3">
        <p>
          공무원 노트는 봉급, 수당, 연금, 퇴직수당, 일정 관리 정보를 이해하기 쉬운 순서로 정리합니다.
          계산기 페이지에는 입력값의 의미, 결과를 볼 때 주의할 점, 함께 확인하면 좋은 글을 함께 배치합니다.
        </p>
        <p>
          콘텐츠는 사용자가 실제 페이지에서 계산 기능을 활용할 때 필요한 배경 설명을 보완하는 방향으로 작성합니다.
          단순 키워드 나열보다 항목별 차이와 확인 순서를 설명하는 것을 우선합니다.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900">작성 원칙</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>용어 설명, 계산 순서, 주의사항을 분리해서 정리합니다.</li>
          <li>봉급표, 수당, 공제, 연금처럼 성격이 다른 항목은 따로 설명합니다.</li>
          <li>부족한 설명은 가이드 글과 자주 묻는 질문으로 보완합니다.</li>
        </ul>
      </section>
    </main>
  );
}
