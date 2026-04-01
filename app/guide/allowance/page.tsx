import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  Coins,
  FileText,
  Info,
  ListChecks,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 수당 가이드 | 공무원 노트",
  description:
    "공무원 수당의 의미와 종류, 급여 확인 시 함께 봐야 할 포인트를 쉽게 정리한 가이드입니다.",
  alternates: {
    canonical: "https://www.nokobridge.com/guide/allowance",
  },
  openGraph: {
    title: "공무원 수당 가이드 | 공무원 노트",
    description:
      "공무원 수당 종류와 급여 확인 시 함께 봐야 할 내용을 알아보세요.",
    url: "https://www.nokobridge.com/guide/allowance",
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

export default function AllowanceGuidePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
      <article className="space-y-6">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <Coins className="h-6 w-6 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
                  ALLOWANCE GUIDE
                </p>
                <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl xl:text-4xl">
                  공무원 수당 가이드
                </h1>
              </div>
            </div>

            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base xl:text-[17px] xl:leading-8">
              <p>
                공무원 급여를 이해할 때 가장 헷갈리기 쉬운 부분 중 하나가 바로
                수당입니다. 봉급표에 나오는 기본급은 비교적 단순하지만, 실제
                급여를 볼 때는 여러 수당이 함께 반영될 수 있어 체감 금액이
                달라질 수 있습니다.
              </p>
              <p>
                따라서 공무원 월급을 보다 정확하게 이해하려면 수당 구조를 함께
                보는 것이 중요합니다. 이 페이지에서는 공무원 수당이 왜 중요한지,
                어떤 항목을 함께 살펴보면 좋은지, 공무원 노트에서 어떻게
                활용하면 좋은지를 정리했습니다.
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
                  수당은 월급 체감에 큰 영향
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  같은 기본급이라도 수당 적용에 따라 실제 급여 느낌이 달라질 수 있습니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 2</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  기본급만 보면 구조를 놓치기 쉬움
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  공무원 월급은 기본급과 수당을 함께 볼 때 더 현실적으로 이해됩니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 3</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  계산기와 같이 볼수록 이해가 쉬움
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  봉급 페이지에서 전체 급여 흐름과 함께 보면 훨씬 직관적입니다.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniInfoCard
            title="기본급과의 관계"
            desc="수당은 기본급에 더해져 실제 월급 체감에 영향을 줄 수 있습니다."
          />
          <MiniInfoCard
            title="적용 조건"
            desc="직무, 근속, 가족, 근무 환경 등 여러 조건에 따라 달라질 수 있습니다."
          />
          <MiniInfoCard
            title="급여 해석"
            desc="봉급표 숫자만 볼 때보다 수당을 함께 보면 구조가 더 명확해집니다."
          />
          <MiniInfoCard
            title="계산기 연계"
            desc="봉급 계산기와 함께 보면 공무원 급여 흐름을 더 쉽게 파악할 수 있습니다."
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="1. 수당은 왜 중요한가요?" icon={Wallet}>
              <p>
                같은 직급과 호봉이라도 어떤 수당이 적용되는지에 따라 실제
                급여의 느낌은 달라질 수 있습니다. 그래서 공무원 급여를 확인할
                때는 기본급만 보지 말고, 어떤 수당이 함께 고려되는지를 살펴보는
                것이 좋습니다.
              </p>
              <p>
                수당은 공무원 급여 구조를 보다 현실적으로 이해하게 해주는
                항목이기 때문에, 봉급 계산 결과를 해석할 때도 큰 도움이 됩니다.
                봉급표 숫자만 보면 단순해 보일 수 있지만, 실제 월급 구조는 이
                수당 항목들까지 함께 고려해야 더 잘 보입니다.
              </p>
              <p>
                결국 공무원 수당은 부가적인 항목이 아니라, 공무원 월급을 이해할
                때 함께 봐야 하는 중요한 요소라고 보는 편이 맞습니다.
              </p>
            </SectionCard>

            <SectionCard title="2. 어떤 수당 항목을 함께 살펴보면 좋을까요?" icon={ListChecks}>
              <p>
                공무원 수당은 성격에 따라 다양하게 나뉠 수 있습니다. 예를 들면
                직무나 역할에 따라 반영될 수 있는 항목, 근속이나 경력 흐름과
                연관된 항목, 개인 상황에 따라 달라질 수 있는 항목, 근무 환경에
                따라 체감 차이를 만드는 항목 등이 있습니다.
              </p>
              <p>
                실제 적용 기준은 개인 상황과 시점에 따라 달라질 수 있으므로,
                수당은 이름을 외우는 것보다 어떤 성격의 항목인지 이해하는 것이
                더 중요합니다. 이렇게 접근하면 공무원 월급을 볼 때도 수당이 왜
                붙는지, 무엇이 결과에 영향을 주는지 파악하기 쉬워집니다.
              </p>
            </SectionCard>

            <SectionCard title="3. 봉급 확인 시 수당을 함께 봐야 하는 이유" icon={Coins}>
              <p>
                공무원 월급을 비교할 때 기본급만 보면 차이가 작아 보일 수
                있지만, 수당까지 함께 보면 실제 체감 폭이 달라질 수 있습니다.
                따라서 급여를 보다 현실적으로 확인하려면 봉급과 수당을 함께 보는
                습관이 필요합니다.
              </p>
              <p>
                특히 공무원 봉급표를 처음 보는 경우에는 숫자가 단순해 보여도,
                실제 월급 구조는 생각보다 복합적일 수 있습니다. 이런 차이를
                이해하려면 수당 항목을 함께 살펴보는 것이 가장 효과적입니다.
              </p>
            </SectionCard>

            <SectionCard title="4. 공무원 노트에서 어떻게 활용하면 좋을까요?" icon={FileText}>
              <p>
                먼저 봉급 페이지에서 기본 정보를 입력해 전체 급여 흐름을 확인한
                뒤, 수당 항목이 결과 해석에 어떤 영향을 줄 수 있는지 함께
                살펴보는 방법이 좋습니다. 이렇게 보면 단순 숫자보다 구조를
                이해하는 데 훨씬 도움이 됩니다.
              </p>
              <p>
                봉급 계산 결과를 볼 때도 기본급만 따로 떼어 생각하기보다는,
                수당과 함께 보면서 전체 흐름을 이해하는 방식이 더 현실적입니다.
                공무원 노트는 이런 흐름을 보다 쉽게 확인할 수 있도록 활용하는 데
                의미가 있습니다.
              </p>
            </SectionCard>

            <SectionCard title="5. 이런 분들에게 추천합니다" icon={Info}>
              <ul className="list-disc space-y-3 pl-5">
                <li>공무원 수당 구조를 처음 이해하려는 분</li>
                <li>기본급과 실제 체감 월급 차이가 궁금한 분</li>
                <li>급여 확인 시 어떤 항목을 함께 봐야 할지 알고 싶은 분</li>
                <li>봉급 계산기 결과를 더 정확히 해석하고 싶은 분</li>
              </ul>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
              <h2 className="text-xl font-bold text-neutral-900">
                봉급 페이지에서 함께 확인하기
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-neutral-700">
                기본급과 수당 흐름을 함께 보면서 공무원 급여 구조를 확인해
                보세요. 수당은 봉급표 숫자만으로는 보이지 않는 차이를 이해하는
                데 큰 도움이 됩니다.
              </p>

              <Link
                href="/salary"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                봉급 페이지로 이동
              </Link>

              <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  함께 보면 좋은 페이지
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    href="/guide/salary"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-white hover:text-neutral-900"
                  >
                    <span>봉급 가이드</span>
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

        <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
          <h2 className="text-2xl font-bold text-neutral-900">자주 묻는 질문</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <MiniInfoCard
              title="수당은 왜 같이 봐야 하나요?"
              desc="공무원 월급은 기본급만으로 완전히 설명되지 않기 때문에, 수당을 함께 봐야 실제 급여 구조를 더 잘 이해할 수 있습니다."
            />
            <MiniInfoCard
              title="수당 이름을 모두 외워야 하나요?"
              desc="이름을 외우기보다 어떤 성격의 항목인지 이해하는 것이 더 중요합니다. 그래야 급여를 볼 때 해석이 쉬워집니다."
            />
            <MiniInfoCard
              title="수당은 계산기 결과 해석에도 중요하나요?"
              desc="중요합니다. 기본급만 볼 때보다 수당을 함께 고려해야 결과를 더 현실적으로 이해할 수 있습니다."
            />
          </div>
        </section>
      </article>
    </main>
  );
}