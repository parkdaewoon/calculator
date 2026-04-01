import Link from "next/link";
import type { Metadata } from "next";
import {
  Calculator,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Info,
  Landmark,
} from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 연금 가이드 | 공무원 노트",
  description:
    "공무원 연금의 기본 개념, 재직기간에 따른 확인 포인트, 예상 연금 계산기 사용 방법을 쉽게 안내합니다.",
  alternates: {
    canonical: "https://www.nokobridge.com/guide/pension",
  },
  openGraph: {
    title: "공무원 연금 가이드 | 공무원 노트",
    description:
      "공무원 연금의 기본 개념과 예상 연금 확인 방법을 알아보세요.",
    url: "https://www.nokobridge.com/guide/pension",
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

export default function PensionGuidePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
      <article className="space-y-6">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <Landmark className="h-6 w-6 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
                  PENSION GUIDE
                </p>
                <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl xl:text-4xl">
                  공무원 연금 가이드
                </h1>
              </div>
            </div>

            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base xl:text-[17px] xl:leading-8">
              <p>
                공무원 연금은 재직기간과 여러 기준 정보를 바탕으로 이해해야 하는
                영역입니다. 처음에는 복잡하게 느껴질 수 있지만, 어떤 요소가
                계산에 영향을 주는지 차례대로 보면 훨씬 쉽게 접근할 수 있습니다.
              </p>
              <p>
                이 페이지에서는 공무원 연금의 기본 개념, 재직기간을 볼 때
                중요한 이유, 예상 연금 계산기를 어떻게 활용하면 좋은지까지
                순서대로 정리했습니다. 숫자 하나만 보는 것보다 전체 흐름을
                이해하는 데 초점을 맞추면 훨씬 도움이 됩니다.
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
                  연금은 재직기간이 중요
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  공무원 연금은 단순히 현재 금액 하나로만 보기 어렵습니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 2</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  예상값은 흐름 이해용
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  실제 수령액은 개인 이력과 적용 기준에 따라 달라질 수 있습니다.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-500">POINT 3</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  여러 조건을 비교해보는 것이 좋음
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  예상 퇴직 시점과 재직기간을 바꿔보며 확인하면 이해가 쉬워집니다.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniInfoCard
            title="재직기간"
            desc="공무원 연금 흐름을 이해할 때 가장 먼저 봐야 하는 핵심 기준입니다."
          />
          <MiniInfoCard
            title="예상 퇴직 시점"
            desc="언제까지 재직하는지에 따라 전체 해석 방향이 달라질 수 있습니다."
          />
          <MiniInfoCard
            title="비교 기준"
            desc="조건을 바꿔 여러 경우를 비교하면 연금 흐름이 더 잘 보입니다."
          />
          <MiniInfoCard
            title="계산기 활용"
            desc="입력값을 조정하며 예상 연금 변화를 직관적으로 확인할 수 있습니다."
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard title="1. 공무원 연금이란?" icon={Landmark}>
              <p>
                공무원 연금은 공무원 재직 이력과 관련된 중요한 제도 중 하나입니다.
                단순한 저축 개념으로 보기보다는, 재직기간과 여러 기준 정보에 따라
                달라지는 체계로 이해하는 것이 더 적절합니다. 그래서 연금은 금액
                자체보다도 어떤 요소가 계산에 반영되는지를 먼저 이해하는 것이
                중요합니다.
              </p>
              <p>
                많은 분들이 공무원 연금을 확인할 때 결과 숫자부터 보려고 하지만,
                실제로는 재직기간, 예상 퇴직 시점, 비교 기준을 함께 보는 것이 더
                유용합니다. 이런 구조를 이해하고 보면 예상 결과도 훨씬 자연스럽게
                받아들일 수 있습니다.
              </p>
              <p>
                결국 공무원 연금 계산은 하나의 숫자를 맞히는 과정이라기보다,
                내 재직 흐름과 향후 계획을 함께 살펴보는 과정에 가깝습니다.
              </p>
            </SectionCard>

            <SectionCard title="2. 연금 확인 시 무엇을 함께 봐야 하나요?" icon={FileText}>
              <p>
                공무원 연금을 확인할 때는 현재까지의 재직기간, 예상 퇴직 시점,
                비교하고 싶은 기준 정보 등을 함께 보는 것이 좋습니다. 연금은
                단일 숫자만 보는 것보다 관련 항목을 함께 확인할 때 더 의미 있게
                해석할 수 있기 때문입니다.
              </p>
              <p>
                특히 재직기간은 공무원 연금 흐름을 이해하는 데 매우 중요한
                기준입니다. 같은 사람이라도 어떤 시점을 기준으로 보느냐에 따라
                예상 결과의 의미가 달라질 수 있으므로, 단순 결과값보다 맥락을
                같이 살펴보는 습관이 필요합니다.
              </p>
              <p>
                또 퇴직수당과 함께 비교해보는 것이 필요한 경우도 있습니다.
                공무원 노트에서 연금과 관련된 기능을 활용할 때도, 이런 항목들을
                한 번에 떠올릴 수 있으면 결과를 훨씬 더 잘 이해할 수 있습니다.
              </p>
            </SectionCard>

            <SectionCard title="3. 예상 연금은 어떻게 받아들이면 좋을까요?" icon={CircleDollarSign}>
              <p>
                예상 연금은 미래 계획을 단순화해서 이해하는 데 도움이 됩니다.
                다만 실제 적용은 개인별 재직 이력과 기준 시점, 적용 방식에 따라
                달라질 수 있으므로, 결과를 절대적인 값으로 보기보다는 방향을
                이해하는 참고 자료로 활용하는 것이 좋습니다.
              </p>
              <p>
                예를 들어 재직기간이 조금 더 늘어나는 경우, 또는 예상 퇴직 시점을
                다르게 가정하는 경우를 비교해보면 연금 흐름이 어떻게 바뀌는지
                감을 잡기 쉬워집니다. 이런 방식은 장기적인 계획을 세울 때도
                생각보다 유용합니다.
              </p>
            </SectionCard>

            <SectionCard title="4. 공무원 노트 연금 기능 사용 방법" icon={Calculator}>
              <ol className="list-decimal space-y-3 pl-5">
                <li>연금 페이지로 이동합니다.</li>
                <li>재직기간과 필요한 기준 정보를 입력합니다.</li>
                <li>예상 연금 또는 관련 결과를 확인합니다.</li>
                <li>필요하면 값을 바꿔 여러 경우를 비교합니다.</li>
                <li>전체 흐름을 이해하는 참고 자료로 활용합니다.</li>
              </ol>
              <p>
                이 과정은 단순히 숫자를 보는 것뿐 아니라, 앞으로 어떤 요소를
                고려해야 하는지 감을 잡는 데에도 도움이 됩니다. 한 번 입력하고
                끝내기보다, 여러 조건을 비교해보는 방식이 훨씬 실용적입니다.
              </p>
            </SectionCard>

            <SectionCard title="5. 이런 분들에게 추천합니다" icon={Info}>
              <ul className="list-disc space-y-3 pl-5">
                <li>공무원 연금 구조를 처음 이해하려는 분</li>
                <li>재직기간에 따라 연금 흐름이 어떻게 달라지는지 궁금한 분</li>
                <li>예상 퇴직 시점에 따라 비교해보고 싶은 분</li>
                <li>연금 결과를 숫자보다 구조 중심으로 이해하고 싶은 분</li>
              </ul>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
              <h2 className="text-xl font-bold text-neutral-900">
                연금 계산기 바로가기
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-neutral-700">
                재직기간과 기준 정보를 넣고 예상 연금 흐름을 직접 확인해 보세요.
                여러 조건을 비교하면 공무원 연금 구조를 훨씬 쉽게 이해할 수
                있습니다.
              </p>

              <Link
                href="/pension"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                연금 계산하러 가기
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
                    href="/guide/allowance"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-white hover:text-neutral-900"
                  >
                    <span>수당 가이드</span>
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
              title="예상 연금은 실제 수령액과 완전히 같나요?"
              desc="예상 연금은 참고용 결과입니다. 실제 적용은 개인별 재직 이력과 기준에 따라 달라질 수 있습니다."
            />
            <MiniInfoCard
              title="연금은 무엇부터 확인해야 하나요?"
              desc="보통 재직기간과 예상 퇴직 시점을 먼저 보고, 이후 여러 조건을 비교해보는 방식이 이해하기 쉽습니다."
            />
            <MiniInfoCard
              title="왜 여러 경우를 비교해보는 게 좋나요?"
              desc="공무원 연금은 하나의 숫자보다 전체 흐름이 중요하기 때문에, 조건을 바꿔보면 구조가 더 잘 보입니다."
            />
          </div>
        </section>
      </article>
    </main>
  );
}