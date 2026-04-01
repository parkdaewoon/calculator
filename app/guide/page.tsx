import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Calculator,
  Landmark,
  Coins,
  ChevronRight,
  CircleHelp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 가이드 | 공무원 노트",
  description:
    "공무원 봉급, 수당, 연금 계산 방법과 공무원 노트 사용법을 쉽게 확인할 수 있는 안내 페이지입니다.",
  alternates: {
    canonical: "https://www.nokobridge.com/guide",
  },
  openGraph: {
    title: "공무원 가이드 | 공무원 노트",
    description:
      "공무원 봉급, 수당, 연금 계산 방법과 공무원 노트 사용법을 쉽게 확인해 보세요.",
    url: "https://www.nokobridge.com/guide",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

const guideCards = [
  {
    href: "/guide/salary",
    icon: Calculator,
    title: "봉급 가이드",
    desc: "공무원 월급 구조와 봉급 계산기 활용 방법을 확인하세요.",
  },
  {
    href: "/guide/pension",
    icon: Landmark,
    title: "연금 가이드",
    desc: "공무원 연금의 기본 개념과 예상 연금 확인 방법을 안내합니다.",
  },
  {
    href: "/guide/allowance",
    icon: Coins,
    title: "수당 가이드",
    desc: "주요 수당 종류와 급여 확인 시 함께 봐야 할 항목을 정리했습니다.",
  },
];

function GuideCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        <Icon className="h-7 w-7 text-neutral-700" />
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5" />
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-[15px]">
        {desc}
      </p>

      <div className="mt-6 text-sm font-semibold text-neutral-900">
        자세히 보기
      </div>
    </Link>
  );
}

function InfoCard({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-700" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      </div>

      <div className="mt-5 space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <BookOpen className="h-6 w-6 text-neutral-700" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
                GUIDE
              </p>
              <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl xl:text-4xl">
                공무원 가이드
              </h1>
            </div>
          </div>

          <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-7 text-neutral-700 sm:text-base xl:text-[17px] xl:leading-8">
            <p>
              공무원 급여와 연금은 항목이 다양하고 기준도 복잡해서 처음 확인할 때
              어렵게 느껴질 수 있습니다. 공무원 노트는 봉급, 수당, 연금 정보를
              보다 쉽게 이해하고 직접 계산해볼 수 있도록 구성한 서비스입니다.
            </p>
            <p>
              이 페이지에서는 각 기능의 사용 방법만 설명하는 것이 아니라, 실제로
              어떤 항목을 함께 보면 좋은지까지 정리했습니다. 원하는 주제를
              선택해서 차근차근 확인해 보세요.
            </p>
          </div>
        </div>

        <aside className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-neutral-500">빠른 안내</p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900">
            처음이라면 이렇게 보세요
          </h2>

          <ol className="mt-5 space-y-4">
            <li className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-500">STEP 1</p>
              <p className="mt-1 text-base font-semibold text-neutral-900">
                봉급 가이드 확인
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                월급 구조와 기본급 흐름부터 이해합니다.
              </p>
            </li>

            <li className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-500">STEP 2</p>
              <p className="mt-1 text-base font-semibold text-neutral-900">
                수당 가이드 확인
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                실제 급여에 영향을 주는 항목을 함께 봅니다.
              </p>
            </li>

            <li className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-500">STEP 3</p>
              <p className="mt-1 text-base font-semibold text-neutral-900">
                연금 가이드 확인
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                재직기간 기준으로 연금 흐름을 이해합니다.
              </p>
            </li>
          </ol>
        </aside>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guideCards.map((card) => (
          <GuideCard key={card.href} {...card} />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InfoCard title="공무원 노트에서 확인할 수 있는 내용" icon={BookOpen}>
          <p>
            공무원 노트에서는 봉급표를 기준으로 기본급 흐름을 확인하고, 수당과
            함께 월급 구조를 보다 쉽게 이해할 수 있습니다. 또 재직기간과 기준
            정보를 바탕으로 연금 흐름도 함께 살펴볼 수 있습니다.
          </p>
          <p>
            단순히 숫자만 보여주는 도구가 아니라, 급여와 연금 구조를 이해하는 데
            도움을 주는 안내형 서비스로 활용할 수 있도록 구성했습니다.
          </p>
        </InfoCard>

        <InfoCard title="이런 분들에게 추천합니다" icon={CircleHelp}>
          <p>
            공무원 월급 구조를 처음 정리해보고 싶은 분, 수당이 실제 급여에 어떤
            영향을 주는지 궁금한 분, 재직기간에 따라 연금 흐름을 미리 가늠해보고
            싶은 분에게 유용합니다.
          </p>
          <p>
            복잡한 표와 항목을 한 번에 이해하기 어려웠다면, 가이드와 계산기를
            함께 보면서 차근차근 확인하는 방식이 훨씬 편합니다.
          </p>
        </InfoCard>
      </section>

      <section className="mt-6 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
        <h2 className="text-2xl font-bold text-neutral-900">자주 묻는 질문</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl bg-neutral-50 p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              공무원 월급은 봉급표만 보면 바로 알 수 있나요?
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              봉급표는 기본급을 확인하는 데 유용하지만, 실제 급여를 이해하려면
              수당과 기타 항목까지 함께 보는 것이 좋습니다.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              연금 계산 결과는 실제 수령액과 완전히 같은가요?
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              예상 결과는 참고용이며, 실제 적용은 개인별 재직 이력과 기준 시점에
              따라 달라질 수 있습니다.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              어떤 페이지부터 보는 게 좋나요?
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              처음이라면 봉급 가이드부터 보고, 이후 수당 가이드와 연금 가이드를
              순서대로 확인하는 흐름이 가장 이해하기 쉽습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}