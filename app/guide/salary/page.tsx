import Link from "next/link";
import type { Metadata } from "next";
import {
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Coins,
  FileText,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 봉급 가이드 | 공무원 노트",
  description:
    "공무원 월급 구조, 봉급표 보는 법, 기본급과 수당의 차이, 봉급 계산기 사용 방법을 쉽게 정리한 가이드입니다.",
  alternates: {
    canonical: "/guide/salary",
  },
  openGraph: {
    title: "공무원 봉급 가이드 | 공무원 노트",
    description:
      "공무원 월급 구조와 봉급표 보는 법, 봉급 계산기 사용 방법을 확인해 보세요.",
    url: "https://www.nokobridge.com/guide/salary",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-700" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="mt-5 space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function MiniInfoCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-5">
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-700 sm:text-[15px]">
        {desc}
      </p>
    </div>
  );
}

export default function SalaryGuidePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
      <article className="space-y-6">
        {/* Hero */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <Calculator className="h-6 w-6 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
                  SALARY GUIDE
                </p>
                <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl xl:text-4xl">
                  공무원 봉급 가이드
                </h1>
              </div>
            </div>

            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base xl:text-[17px] xl:leading-8">
              <p>
                공무원 월급은 단순히 봉급표의 숫자 하나만으로 이해하기
                어렵습니다. 보통 기본급을 중심으로 여러 수당이 더해지기 때문에,
                실제로 체감하는 월급은 개인 상황과 적용 항목에 따라 달라질 수
                있습니다.
              </p>
              <p>
                그래서 공무원 급여를 확인할 때는 기본급만 보지 말고, 수당과
                계산 방식까지 함께 살펴보는 것이 중요합니다. 이 페이지에서는
                공무원 월급 구조, 봉급표 보는 법, 수당의 의미, 봉급 계산기 사용
                방법까지 순서대로 정리했습니다.
              </p>
            </div>
          </div>

          <aside className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold text-neutral-500">빠르게 보기</p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900">
              핵심 요약
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 1</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  월급은 기본급 + 수당 구조
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  봉급표만 보면 전체 급여를 정확히 이해하기 어렵습니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 2</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  직급과 호봉이 기본급의 중심
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  공무원 봉급표는 기본급 흐름을 이해하는 출발점입니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 3</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  계산기로 비교하면 더 이해가 쉬움
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  호봉과 수당 변화를 바꿔가며 확인하면 구조가 잘 보입니다.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* Quick cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniInfoCard
            title="봉급표"
            desc="직급과 호봉에 따라 기본급의 기준이 되는 표입니다."
          />
          <MiniInfoCard
            title="기본급"
            desc="공무원 월급 구조의 중심이 되는 핵심 금액입니다."
          />
          <MiniInfoCard
            title="수당"
            desc="직무, 근속, 가족, 근무 환경 등에 따라 달라질 수 있습니다."
          />
          <MiniInfoCard
            title="계산기 활용"
            desc="입력값을 비교하면서 예상 급여 흐름을 더 쉽게 파악할 수 있습니다."
          />
        </section>

        {/* Main content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="1. 공무원 월급은 어떻게 구성되나요?" icon={CircleDollarSign}>
              <p>
                공무원 월급은 크게 기본급과 각종 수당으로 구성됩니다. 기본급은
                보통 직급과 호봉을 기준으로 정해지며, 여기에 여러 조건에 따라
                수당이 추가될 수 있습니다. 그래서 실제 월급을 확인할 때는
                봉급표의 숫자만 보는 것보다 전체 구조를 함께 보는 것이 훨씬
                중요합니다.
              </p>
              <p>
                많은 분들이 공무원 봉급표를 먼저 찾아보지만, 봉급표는 어디까지나
                기본급의 흐름을 보여주는 기준표에 가깝습니다. 실제로는 어떤
                수당이 적용되는지에 따라 체감 월급이 달라질 수 있기 때문에,
                공무원 월급 계산을 이해하려면 기본급과 수당을 같이 살펴보는
                습관이 필요합니다.
              </p>
              <p>
                특히 공무원 월급 구조를 처음 접하는 경우, 봉급표 숫자와 실제
                월급 느낌 사이에 차이가 있다고 느끼기 쉽습니다. 이는 급여가
                하나의 숫자로 끝나는 것이 아니라, 여러 항목이 조합되어
                구성되기 때문입니다.
              </p>
            </SectionCard>

            <SectionCard title="2. 공무원 봉급표는 어떻게 보면 되나요?" icon={FileText}>
              <p>
                공무원 봉급표를 볼 때 가장 먼저 확인하는 값은 보통 직급과
                호봉입니다. 직급은 현재 위치를, 호봉은 경력과 흐름을 반영하는
                기준처럼 이해하면 쉽습니다. 공무원 봉급표는 이 두 기준을
                중심으로 기본급이 어떻게 달라지는지 보여줍니다.
              </p>
              <p>
                따라서 공무원 봉급표를 볼 때는 단순히 현재 숫자만 확인하는 것
                보다, 다음 호봉이나 다른 직급에서 얼마나 차이가 나는지 함께
                비교해보는 것이 유용합니다. 이렇게 보면 단기적인 월급 확인뿐
                아니라 장기적인 흐름까지도 파악하기 쉬워집니다.
              </p>
              <p>
                공무원 노트의 봉급 기능은 이런 흐름을 보다 쉽게 이해할 수 있도록
                입력값을 바꿔가며 확인할 수 있게 구성하는 데 의미가 있습니다.
              </p>
            </SectionCard>

            <SectionCard title="3. 기본급과 수당은 무엇이 다른가요?" icon={Coins}>
              <p>
                기본급은 직급과 호봉을 기준으로 정해지는 급여의 중심 항목입니다.
                반면 수당은 직무 조건, 근속 정도, 가족 구성, 근무 환경 등 여러
                요소에 따라 추가될 수 있는 항목입니다. 그래서 같은 직급과
                호봉이라도 어떤 수당이 적용되는지에 따라 실제 월급의 느낌은
                달라질 수 있습니다.
              </p>
              <p>
                예를 들어 공무원 수당 종류를 함께 살펴보면, 단순히 봉급표 숫자만
                볼 때보다 급여 구조가 훨씬 현실적으로 이해됩니다. 공무원 월급을
                비교하거나 예상할 때는 이 수당의 존재를 빼놓고 보기 어렵습니다.
              </p>
              <p>
                그래서 공무원 월급 계산을 할 때는 기본급만 보는 방식보다,
                기본급과 수당을 함께 고려하는 방식이 더 실제에 가깝습니다.
              </p>
            </SectionCard>

            <SectionCard title="4. 봉급 계산기는 언제 유용한가요?" icon={Calculator}>
              <p>
                공무원 봉급 계산기는 승진이나 호봉 변화에 따라 급여가 어떻게
                달라지는지 확인하고 싶을 때 특히 유용합니다. 또 수당이 반영된
                대략적인 월급 흐름을 보고 싶을 때도 입력값을 직접 바꿔보면서
                이해할 수 있다는 장점이 있습니다.
              </p>
              <p>
                숫자를 하나씩 직접 맞춰보는 대신 필요한 정보를 입력해 결과를
                빠르게 확인할 수 있기 때문에, 공무원 월급 계산이 처음인 분들에게
                부담을 줄여줍니다. 계산 결과 자체도 중요하지만, 어떤 항목을 넣고
                어떤 값을 바꾸는지 살펴보는 과정 자체가 구조 이해에 도움이 됩니다.
              </p>
            </SectionCard>

            <SectionCard title="5. 공무원 노트 봉급 기능 사용 방법" icon={Info}>
              <ol className="list-decimal space-y-3 pl-5">
                <li>봉급 페이지로 이동합니다.</li>
                <li>직급, 호봉 등 기본 기준 정보를 입력합니다.</li>
                <li>적용 가능한 수당 항목을 확인합니다.</li>
                <li>예상 급여 결과를 확인하고 필요하면 값을 조정합니다.</li>
                <li>여러 조건을 비교하면서 월급 흐름을 살펴봅니다.</li>
              </ol>
              <p>
                이렇게 입력값을 바꿔가며 비교하면 공무원 봉급표만 볼 때보다
                변화 흐름을 훨씬 쉽게 이해할 수 있습니다. 실제 금액은 공식 기준,
                개인별 조건, 시점에 따라 달라질 수 있으므로 참고용으로 보되,
                구조를 파악하는 데 유용하게 활용할 수 있습니다.
              </p>
            </SectionCard>

            <SectionCard title="6. 이런 분들에게 추천합니다" icon={ChevronRight}>
              <ul className="list-disc space-y-3 pl-5">
                <li>공무원 월급 구조를 처음 이해하려는 분</li>
                <li>공무원 봉급표를 보는 법이 헷갈리는 분</li>
                <li>호봉 변화에 따른 월급 흐름이 궁금한 분</li>
                <li>기본급과 수당을 함께 보고 싶은 분</li>
                <li>봉급 계산기를 활용해 비교해보고 싶은 분</li>
              </ul>
            </SectionCard>
          </div>

          {/* Sticky side CTA */}
          <div className="space-y-6">
            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
              <h2 className="text-xl font-bold text-neutral-900">
                봉급 계산기 바로가기
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-neutral-700">
                실제 입력값을 넣고 예상 급여 흐름을 직접 확인해 보세요.
                공무원 봉급표를 보는 것보다 훨씬 직관적으로 비교할 수 있습니다.
              </p>

              <Link
                href="/salary"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                봉급 계산하러 가기
              </Link>

              <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  함께 보면 좋은 페이지
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    href="/guide/allowance"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-white hover:text-neutral-900"
                  >
                    <span>수당 가이드</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/guide/pension"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-white hover:text-neutral-900"
                  >
                    <span>연금 가이드</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/guide"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-white hover:text-neutral-900"
                  >
                    <span>가이드 메인</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
          <h2 className="text-2xl font-bold text-neutral-900">자주 묻는 질문</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <MiniInfoCard
              title="공무원 월급은 봉급표만 보면 되나요?"
              desc="봉급표는 기본급 확인에 유용하지만, 실제 월급은 수당까지 함께 봐야 더 정확하게 이해할 수 있습니다."
            />
            <MiniInfoCard
              title="봉급 계산기 결과는 실제 월급과 완전히 같나요?"
              desc="계산 결과는 이해를 돕기 위한 참고용입니다. 개인별 적용 기준과 시점에 따라 차이가 있을 수 있습니다."
            />
            <MiniInfoCard
              title="처음이면 무엇부터 보면 좋나요?"
              desc="먼저 공무원 봉급표와 월급 구조를 이해한 뒤, 수당 항목과 계산기를 함께 보는 흐름이 가장 쉽습니다."
            />
          </div>
        </section>
      </article>
    </main>
  );
}