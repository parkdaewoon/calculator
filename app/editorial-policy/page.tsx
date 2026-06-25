import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "콘텐츠 작성 기준",
  description: "공무원 노트의 콘텐츠 작성 기준을 안내합니다.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">콘텐츠 작성 기준</h1>
      <p>
        공무원 노트는 봉급, 수당, 연금, 퇴직수당, 일정 관리 정보를 이해하기 쉬운 순서로 정리합니다.
      </p>
    </main>
  );
}
