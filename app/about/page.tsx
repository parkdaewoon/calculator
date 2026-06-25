import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원 노트 소개",
  description: "공무원 노트의 서비스 목적과 제공 기능을 안내합니다.",
  alternates: { canonical: "/about" },
};

const features = [
  ["봉급 확인", "직급과 호봉에 따른 기본급을 확인하고 수당과 공제 항목을 함께 비교합니다."],
  ["연금 참고", "재직기간과 기준소득월액을 기준으로 연금과 퇴직수당의 예상 흐름을 살펴봅니다."],
  ["일정 관리", "개인 일정과 반복 일정을 브라우저 안에서 간단히 정리할 수 있도록 돕습니다."],
];

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
          공무원 급여는 기본급만으로 결정되지 않습니다. 정액급식비, 직급보조비, 가족수당, 초과근무수당 같은 지급 항목과
          건강보험료, 소득세, 기여금 같은 공제 항목이 함께 반영됩니다. 그래서 공무원 노트는 봉급표, 계산기, 가이드 글을 연결해
          사용자가 결과를 더 쉽게 해석할 수 있도록 돕습니다.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3">
        {features.map(([title, desc]) => (
          <article key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <h2 className="font-semibold text-neutral-900">{title}</h2>
            <p className="mt-2">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900">운영 방향</h2>
        <div className="mt-3 space-y-3">
          <p>
            공무원 노트는 사용자가 급여와 연금 구조를 이해하는 데 필요한 배경 설명, 주의사항, 관련 페이지 연결을 계속 보완합니다.
            계산 도구와 설명 글은 서로 분리하지 않고, 계산 결과를 읽을 때 필요한 안내를 같은 흐름 안에서 확인할 수 있게 구성합니다.
          </p>
          <p>
            결과는 입력값과 공개 기준을 바탕으로 한 참고 자료입니다. 개인별 상황, 소속 기관의 처리 방식, 제도 변경에 따라 실제 금액은 달라질 수 있으므로
            중요한 확인은 관련 기관 자료와 함께 보는 것을 권장합니다.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="font-semibold text-neutral-900">관련 페이지</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><Link href="/sources" className="underline underline-offset-4">출처 및 참고 기준</Link></li>
          <li><Link href="/editorial-policy" className="underline underline-offset-4">콘텐츠 작성 기준</Link></li>
          <li><Link href="/checklist" className="underline underline-offset-4">이용 체크리스트</Link></li>
          <li><Link href="/contact" className="underline underline-offset-4">문의</Link></li>
        </ul>
      </section>
    </main>
  );
}
