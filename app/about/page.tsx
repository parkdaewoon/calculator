import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원 노트 소개",
  description: "공무원 노트의 서비스 목적과 제공 기능을 안내합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">공무원 노트 소개</h1>
      <section className="space-y-3">
        <p>
          공무원 노트는 봉급, 수당, 연금, 퇴직수당, 일정 관리 정보를 한곳에서 확인할 수 있도록 만든 참고 서비스입니다.
          단순 계산 결과만 보여주기보다 각 항목의 의미와 확인 순서를 함께 정리해 처음 이용하는 사람도 흐름을 이해할 수 있게 구성했습니다.
        </p>
        <p>
          봉급 메뉴에서는 기본급과 수당을 함께 살펴보고, 연금 메뉴에서는 재직기간과 기준소득월액을 중심으로 예상 흐름을 비교할 수 있습니다.
          달력 메뉴는 개인 일정과 근무 일정을 정리하는 보조 기능으로 사용할 수 있습니다.
        </p>
      </section>
      <section className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="font-semibold text-neutral-900">운영 방향</h2>
        <p className="mt-2">
          공무원 노트는 사용자가 급여와 연금 구조를 이해하는 데 필요한 배경 설명, 주의사항, 관련 페이지 연결을 계속 보완합니다.
          계산 결과는 참고용으로 활용하고 중요한 확인은 관련 기관 자료와 함께 보는 것을 권장합니다.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900">관련 페이지</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><Link href="/sources" className="underline underline-offset-4">출처 및 참고 기준</Link></li>
          <li><Link href="/editorial-policy" className="underline underline-offset-4">콘텐츠 작성 기준</Link></li>
          <li><Link href="/contact" className="underline underline-offset-4">문의</Link></li>
        </ul>
      </section>
    </main>
  );
}
