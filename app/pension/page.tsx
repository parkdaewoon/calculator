import type { Metadata } from "next";
import Link from "next/link";
import PensionHome from "@/components/pension/PensionHome";

export const metadata: Metadata = {
  title: "공무원 연금",
  description:
    "공무원 연금, 기준소득월액, 퇴직수당, 예상 연금 계산을 처음 확인하는 사용자를 위해 핵심 기준을 정리했습니다.",
  alternates: {
    canonical: "/pension",
  },
  openGraph: {
    title: "공무원 연금 | 공무원 노트",
    description:
      "공무원 연금 기본 정보, 퇴직수당, 연금 계산 기능과 연금 구조를 확인하세요.",
    url: "/pension",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PensionHome />

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400">
          PENSION GUIDE
        </p>

        <h2 className="mt-2 text-lg font-bold leading-snug text-neutral-900">
          공무원 연금은 재직기간과 기준소득월액을 함께 봐야 합니다
        </h2>

        <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
          <p>
            공무원 연금은 단순히 현재 월급만으로 계산되지 않습니다. 재직기간,
            기준소득월액, 퇴직 시점, 적용되는 제도 기준 등이 함께 반영됩니다.
            따라서 연금 예상액을 볼 때는 현재 봉급보다 장기적인 재직 흐름을 함께
            확인하는 것이 중요합니다.
          </p>

          <p>
            특히 기준소득월액은 연금 산정에서 자주 등장하는 핵심 개념입니다. 일반적인
            월급 총액이나 실수령액과는 다를 수 있으므로, 연금 계산 전에 기준소득월액의
            의미를 먼저 이해하면 계산 결과를 더 현실적으로 볼 수 있습니다.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold leading-snug text-neutral-900">
          연금 계산 전에 확인할 항목
        </h2>

        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-neutral-700">
          <li>
            <strong className="text-neutral-900">총 재직기간</strong>: 장기 재직 여부는
            연금과 퇴직수당 모두에 영향을 줍니다.
          </li>
          <li>
            <strong className="text-neutral-900">기준소득월액</strong>: 연금 산정의
            기초가 되는 금액으로, 일반 월급과 구분해서 봐야 합니다.
          </li>
          <li>
            <strong className="text-neutral-900">퇴직수당</strong>: 매월 받는 연금과는
            별도로 확인해야 하는 퇴직 급여 성격의 항목입니다.
          </li>
          <li>
            <strong className="text-neutral-900">공식 확인</strong>: 실제 금액은 개인별
            재직 이력과 제도 변경에 따라 달라질 수 있으므로 공식 자료와 함께 확인해야 합니다.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold leading-snug text-neutral-900">
          함께 보면 좋은 페이지
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <Link
            href="/pension/calc"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              공무원 연금 계산기
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              재직기간과 기준소득월액을 바탕으로 예상 연금 흐름을 확인합니다.
            </p>
          </Link>

          <Link
            href="/pension/severance"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              공무원 퇴직수당 계산기
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              퇴직 시점에 함께 확인해야 하는 퇴직수당 예상액을 계산합니다.
            </p>
          </Link>

          <Link
            href="/guide/pension/basic-income"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              기준소득월액 이해하기
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              연금 계산에서 기준소득월액이 왜 중요한지 정리했습니다.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}