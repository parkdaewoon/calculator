import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용 체크리스트",
  description: "공무원 노트 이용 순서를 안내합니다.",
  alternates: { canonical: "/checklist" },
};

const sections = [
  {
    title: "봉급을 볼 때",
    items: ["직급과 호봉을 먼저 확인합니다.", "기본급과 실제 수령액을 구분합니다.", "수당과 공제 항목을 따로 적습니다."],
  },
  {
    title: "연금을 볼 때",
    items: ["재직기간을 먼저 확인합니다.", "기준소득월액을 월급과 구분합니다.", "퇴직수당은 연금과 별도로 봅니다."],
  },
  {
    title: "결과를 해석할 때",
    items: ["계산 결과는 참고용으로 비교합니다.", "개인별 조건에 따라 실제 금액이 달라질 수 있습니다.", "중요한 확인은 관련 기관 자료와 함께 봅니다."],
  },
];

export default function ChecklistPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">이용 체크리스트</h1>
      <section className="space-y-3">
        <p>
          처음 이용할 때는 봉급, 수당, 연금, 달력 메뉴를 차례대로 확인하면 각 기능의 역할을 이해하기 쉽습니다.
          아래 항목을 순서대로 점검하면 계산기 결과를 볼 때 혼동을 줄일 수 있습니다.
        </p>
        <p>
          공무원 급여와 연금은 개인별 조건, 근무 형태, 재직 이력, 적용 기준에 따라 달라질 수 있으므로 한 번에 확정값으로 보기보다 비교 자료로 활용하는 것이 좋습니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <h2 className="font-semibold text-neutral-900">{section.title}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900">추천 이용 순서</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>봉급표에서 기준 금액을 확인합니다.</li>
          <li>수당과 공제 항목을 따로 정리합니다.</li>
          <li>계산기 결과는 참고용으로 비교합니다.</li>
          <li>연금과 퇴직수당 메뉴를 함께 확인합니다.</li>
          <li>출처와 면책 안내를 마지막으로 확인합니다.</li>
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold text-neutral-900">바로가기</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><Link href="/salary" className="underline underline-offset-4">공무원 봉급</Link></li>
          <li><Link href="/pension" className="underline underline-offset-4">공무원 연금</Link></li>
          <li><Link href="/sources" className="underline underline-offset-4">출처 및 참고 기준</Link></li>
        </ul>
      </section>
    </main>
  );
}
