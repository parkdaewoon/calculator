import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "출처 및 참고 기준",
  description:
    "공무원 노트의 봉급, 수당, 연금, 퇴직수당 계산과 안내 콘텐츠가 참고하는 공개 자료와 이용 기준을 안내합니다.",
  alternates: { canonical: "/sources" },
};

const sourceGroups = [
  {
    title: "1. 봉급 및 기본급 관련 자료",
    description:
      "봉급표와 기본급 정보는 공무원 보수 체계를 이해하기 위한 기준 자료를 참고합니다. 직렬, 직급, 호봉에 따라 기본급이 달라질 수 있으므로 사용자는 자신의 적용 구분을 먼저 확인하는 것이 좋습니다.",
    links: [
      {
        label: "공무원보수규정",
        href: "https://www.law.go.kr/법령/공무원보수규정",
      },
      {
        label: "국가법령정보센터",
        href: "https://www.law.go.kr",
      },
    ],
  },
  {
    title: "2. 수당 및 공제 관련 자료",
    description:
      "수당은 직무, 가족 구성, 근무 형태, 초과근무 여부 등 개인별 조건에 따라 달라질 수 있습니다. 공제 항목 역시 건강보험, 장기요양보험, 소득세 등 적용 기준에 따라 실제 금액이 달라질 수 있습니다.",
    links: [
      {
        label: "공무원수당 등에 관한 규정",
        href: "https://www.law.go.kr/법령/공무원수당등에관한규정",
      },
      {
        label: "국가법령정보센터",
        href: "https://www.law.go.kr",
      },
    ],
  },
  {
    title: "3. 여비 관련 자료",
    description:
      "여비는 공무여행 중 필요한 경비를 충당하기 위한 항목으로, 운임, 숙박비, 식비, 일비 등으로 구분됩니다. 실제 지급 기준은 출장 형태와 적용 규정에 따라 달라질 수 있습니다.",
    links: [
      {
        label: "공무원 여비 규정",
        href: "https://www.law.go.kr/법령/공무원여비규정",
      },
    ],
  },
  {
    title: "4. 연금 및 퇴직수당 관련 자료",
    description:
      "연금과 퇴직수당은 재직기간, 기준소득월액, 퇴직 시점, 개인별 이력에 따라 결과가 달라질 수 있습니다. 공무원 노트는 사용자가 개념을 이해하고 예상 흐름을 비교할 수 있도록 계산 구조를 단순화해 제공합니다.",
    links: [
      {
        label: "공무원연금법",
        href: "https://www.law.go.kr/법령/공무원연금법",
      },
      {
        label: "공무원연금공단",
        href: "https://www.geps.or.kr",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        출처 및 참고 기준
      </h1>

      <section className="space-y-3">
        <p>
          공무원 노트는 공무원 봉급, 수당, 연금, 퇴직수당, 일정 관리에 관한 정보를
          이용자가 쉽게 이해할 수 있도록 정리한 비공식 참고 서비스입니다. 계산 기능과
          설명 콘텐츠는 공개된 법령, 제도 안내, 기관 자료를 바탕으로 구성하되, 사용자가
          급여 구조를 이해하고 비교할 수 있도록 쉬운 표현으로 다시 정리했습니다.
        </p>

        <p>
          법령 개정, 연도별 보수표 변경, 개인별 재직 이력, 소속 기관의 세부 처리 기준에
          따라 실제 금액은 달라질 수 있습니다. 따라서 본 사이트의 계산 결과와 설명은
          참고용으로 활용하고, 확정 금액이나 공식 판단이 필요한 경우에는 반드시 관련
          기관의 최신 자료를 확인해야 합니다.
        </p>
      </section>

      <div className="mt-8 space-y-8">
        {sourceGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 font-semibold text-neutral-900">
              {group.title}
            </h2>

            <p>{group.description}</p>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-2 font-semibold text-neutral-900">
          자료 반영과 업데이트
        </h2>

        <p>
          사이트 운영 과정에서 법령과 공개 자료를 확인해 내용을 개선하고 있지만, 모든
          변경사항이 즉시 반영된다고 보장할 수는 없습니다. 계산 결과가 실제 급여명세서
          또는 공식 산정 결과와 다를 경우, 공식 자료를 우선 기준으로 삼아야 합니다.
        </p>
      </section>

      <p className="mt-10 text-xs leading-6 text-neutral-500">
        공무원 노트는 정부기관 또는 공공기관이 운영하는 공식 서비스가 아닙니다. 본
        페이지는 사이트에서 제공하는 정보의 참고 기준을 투명하게 안내하기 위해 작성되었습니다.
      </p>
    </main>
  );
}