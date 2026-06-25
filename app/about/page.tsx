import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공무원 노트 소개",
  description: "공무원 노트의 서비스 목적과 운영 기준을 안내합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">공무원 노트 소개</h1>
      <p>
        공무원 노트는 봉급, 수당, 연금, 퇴직수당, 일정 관리 정보를 쉽게 확인할 수 있도록 정리한 비공식 참고 서비스입니다.
      </p>
    </main>
  );
}
