import type { Metadata } from "next";
import Link from "next/link";
import SalaryHome from "@/components/Salary/SalaryHome";

export const metadata: Metadata = {
  title: "공무원 봉급",
  description:
    "공무원 봉급표, 수당, 여비, 실수령액 계산을 처음 확인하는 사용자를 위해 보수 구조와 이용 순서를 정리했습니다.",
  alternates: {
    canonical: "/salary",
  },
  openGraph: {
    title: "공무원 봉급 | 공무원 노트",
    description:
      "공무원 봉급표, 수당제도, 여비제도, 봉급 계산 메뉴와 보수 구조를 확인하세요.",
    url: "/salary",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function SalaryPage() {
  return (
    <div className="space-y-6">
      <SalaryHome />

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400">
          SALARY GUIDE
        </p>

        <h2 className="mt-2 text-lg font-bold leading-snug text-neutral-900">
          공무원 봉급은 기본급만으로 결정되지 않습니다
        </h2>

        <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
          <p>
            공무원 봉급을 볼 때는 먼저 직렬, 직급, 호봉에 따른 기본급을 확인해야 합니다.
            하지만 실제 월급은 기본급만으로 정해지지 않습니다. 정액급식비, 직급보조비,
            가족수당, 초과근무수당, 명절휴가비, 성과상여금 등 여러 항목이 함께 반영됩니다.
          </p>

          <p>
            반대로 건강보험료, 장기요양보험료, 공무원연금 기여금, 소득세, 지방소득세 같은
            공제 항목도 적용됩니다. 그래서 봉급표에 적힌 금액과 실제 통장에 들어오는
            실수령액은 다르게 나타날 수 있습니다.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold leading-snug text-neutral-900">
          처음 확인할 때 추천하는 순서
        </h2>

        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-neutral-700">
          <li>
            <strong className="text-neutral-900">봉급표</strong>에서 자신의 직렬, 직급,
            호봉에 해당하는 기본급을 먼저 확인합니다.
          </li>
          <li>
            <strong className="text-neutral-900">수당제도</strong>에서 자신에게 적용될 수
            있는 수당 항목을 살펴봅니다.
          </li>
          <li>
            <strong className="text-neutral-900">봉급 계산기</strong>에서 기본급, 수당,
            공제 항목을 함께 입력해 예상 실수령액을 확인합니다.
          </li>
          <li>
            <strong className="text-neutral-900">가이드</strong>에서 실수령액이 달라지는
            이유와 계산 시 주의할 점을 함께 확인합니다.
          </li>
        </ol>
      </section>

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold leading-snug text-neutral-900">
          함께 보면 좋은 페이지
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <Link
            href="/salary/pay-table"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              공무원 봉급표
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              직렬, 직급, 호봉별 기본급을 먼저 확인합니다.
            </p>
          </Link>

          <Link
            href="/salary/calculator"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              공무원 봉급 계산기
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              기본급, 수당, 공제 항목을 반영해 예상 실수령액을 계산합니다.
            </p>
          </Link>

          <Link
            href="/guide/salary/actual-pay"
            className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              실수령액이 봉급표와 다른 이유
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              봉급표 금액과 실제 월급이 달라지는 구조를 설명합니다.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}