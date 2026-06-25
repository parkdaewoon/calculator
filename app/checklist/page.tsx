import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용 체크리스트",
  description: "공무원 노트 이용 순서를 안내합니다.",
  alternates: { canonical: "/checklist" },
};

export default function ChecklistPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">이용 체크리스트</h1>
      <p>처음 이용할 때는 봉급, 수당, 연금, 달력 메뉴를 차례대로 확인하면 각 기능의 역할을 이해하기 쉽습니다.</p>
      <ol className="mt-6 list-decimal space-y-2 pl-5">
        <li>봉급표에서 기준 금액을 확인합니다.</li>
        <li>수당과 공제 항목을 따로 정리합니다.</li>
        <li>계산기 결과는 참고용으로 비교합니다.</li>
        <li>연금과 퇴직수당 메뉴를 함께 확인합니다.</li>
      </ol>
    </main>
  );
}
