import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
};

type GuideLink = {
  href: string;
  title: string;
  desc: string;
};

function ContentShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5 pb-6">{children}</div>;
}

function ContentCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-neutral-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-lg font-bold leading-snug text-neutral-900">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
        {children}
      </div>
    </section>
  );
}

function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400">
        FAQ
      </p>
      <h2 className="mt-2 text-lg font-bold text-neutral-900">자주 묻는 질문</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
          >
            <summary className="cursor-pointer text-sm font-semibold leading-6 text-neutral-900">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-7 text-neutral-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function RelatedGuides({ links }: { links: GuideLink[] }) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400">
        RELATED
      </p>
      <h2 className="mt-2 text-lg font-bold text-neutral-900">함께 보면 좋은 글</h2>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm"
          >
            <h3 className="text-sm font-semibold text-neutral-900">{link.title}</h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">{link.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeTrustContent() {
  return (
    <ContentShell>
      <ContentCard eyebrow="ABOUT" title="공무원 노트에서 확인할 수 있는 것">
        <p>
          공무원 노트는 공무원 봉급표, 수당, 연금, 퇴직수당, 일정 관리를 한 곳에서
          확인할 수 있도록 만든 개인용 참고 서비스입니다. 단순히 숫자를 입력하는
          계산기만 제공하는 것이 아니라, 어떤 항목이 급여에 영향을 주는지 이해할 수
          있도록 가이드와 계산 기능을 함께 배치했습니다.
        </p>
        <p>
          봉급 계산에서는 직렬, 직급, 호봉을 기준으로 기본급을 확인하고, 주요 수당과
          공제 항목을 더해 예상 실수령액을 살펴볼 수 있습니다. 연금 메뉴에서는 재직기간과
          기준소득월액을 중심으로 연금과 퇴직수당을 비교할 수 있으며, 달력에서는 업무 일정과
          교대근무 흐름을 관리할 수 있습니다.
        </p>
      </ContentCard>

      <ContentCard title="처음 이용할 때 추천하는 순서">
        <InfoList
          items={[
            "봉급표에서 자신의 직렬·직급·호봉에 해당하는 기본급을 먼저 확인합니다.",
            "봉급 계산기에서 수당과 공제 항목을 입력해 예상 월급과 연봉 흐름을 비교합니다.",
            "연금 기본 정보와 퇴직수당 메뉴에서 장기 재직 시 달라지는 항목을 확인합니다.",
            "가이드 페이지에서 봉급, 수당, 연금 계산 방식과 주의사항을 함께 읽어봅니다.",
          ]}
        />
      </ContentCard>

      <RelatedGuides
        links={[
          {
            href: "/salary/calculator",
            title: "공무원 봉급 계산기",
            desc: "직렬·직급·호봉과 수당을 입력해 예상 급여를 확인합니다.",
          },
          {
            href: "/guide/salary/actual-pay",
            title: "공무원 실수령액이 봉급표와 다른 이유",
            desc: "기본급, 수당, 공제 항목이 실제 월급에 어떻게 반영되는지 정리했습니다.",
          },
          {
            href: "/guide/pension/basic-income",
            title: "공무원 기준소득월액 이해하기",
            desc: "연금 계산에서 자주 등장하는 기준소득월액의 의미를 설명합니다.",
          },
        ]}
      />
    </ContentShell>
  );
}

export function SalaryCalculatorContent() {
  return (
    <ContentShell>
      <ContentCard eyebrow="SALARY GUIDE" title="공무원 봉급 계산기는 무엇을 확인하나요?">
        <p>
          공무원 봉급 계산기는 봉급표의 기본급만 확인하는 기능이 아니라, 수당과 공제까지
          함께 보면서 예상 월급과 연봉 흐름을 이해하기 위한 도구입니다. 공무원 보수는
          직급과 호봉에 따른 기본급을 중심으로 여러 수당이 더해지고, 건강보험, 장기요양보험,
          소득세 등 공제 항목이 차감되면서 실제 수령액이 정해집니다.
        </p>
        <p>
          같은 호봉이라도 가족수당, 위험근무수당, 특수업무수당, 초과근무수당, 정액급식비,
          직급보조비 등의 적용 여부에 따라 월급 체감액은 달라질 수 있습니다. 그래서 봉급표의
          숫자만 보는 것보다 계산기를 통해 수당과 공제를 함께 입력해보는 편이 실제 급여 구조를
          이해하는 데 도움이 됩니다.
        </p>
      </ContentCard>

      <ContentCard title="월급, 연봉, 실수령액을 볼 때 구분해야 할 항목">
        <p>
          월급은 매월 지급되는 금액을 기준으로 보는 개념이고, 연봉은 월 지급액과 명절휴가비,
          성과상여금 등 연 단위로 발생하는 항목까지 고려해 추정할 수 있습니다. 실수령액은
          지급 총액에서 공제 항목을 제외한 금액이므로, 봉급표의 기본급이나 세전 급여와는
          다를 수 있습니다.
        </p>
        <InfoList
          items={[
            "기본급: 직렬, 직급, 호봉에 따라 정해지는 보수의 중심 금액입니다.",
            "수당: 근무 형태, 가족 구성, 직무 성격, 초과근무 등 조건에 따라 더해지는 금액입니다.",
            "공제: 건강보험, 장기요양보험, 소득세, 지방소득세 등 실제 수령액을 줄이는 항목입니다.",
            "연 단위 항목: 명절휴가비, 성과상여금처럼 매월 똑같이 지급되지 않는 항목은 별도로 확인해야 합니다.",
          ]}
        />
      </ContentCard>

      <ContentCard title="계산 결과를 사용할 때 주의할 점">
        <p>
          이 계산기는 공개 자료와 일반적인 계산 구조를 바탕으로 예상 금액을 확인하기 위한
          참고용 도구입니다. 실제 지급액은 소속 기관의 처리 방식, 개인별 공제 상황, 세법 변경,
          특정 수당의 지급 요건, 휴직이나 승진 같은 인사 변동에 따라 달라질 수 있습니다.
        </p>
        <p>
          따라서 계산 결과는 급여 구조를 이해하고 대략적인 흐름을 비교하는 용도로 활용하는 것이
          좋습니다. 공식적인 금액 확인이 필요한 경우에는 급여 담당 부서, 관련 법령, 인사혁신처와
          공무원연금공단 등 공식 자료를 함께 확인해야 합니다.
        </p>
      </ContentCard>

      <FaqSection
        items={[
          {
            question: "공무원 봉급표 금액과 실수령액이 왜 다른가요?",
            answer:
              "봉급표는 기본급 중심의 기준표입니다. 실제 월급에는 여러 수당이 더해지고 보험료와 세금 등이 차감되기 때문에 봉급표 금액과 실수령액은 다르게 나타날 수 있습니다.",
          },
          {
            question: "연봉 계산은 월급에 12를 곱하면 되나요?",
            answer:
              "단순 비교는 가능하지만 정확한 연봉 추정에는 명절휴가비, 정근수당, 성과상여금처럼 매월 동일하게 지급되지 않는 항목도 고려해야 합니다.",
          },
          {
            question: "초과근무수당을 입력하면 실제 지급액과 같나요?",
            answer:
              "초과근무수당은 인정 시간, 단가, 상한, 소속 기관의 처리 방식에 따라 달라질 수 있습니다. 계산 결과는 예상 비교용으로 활용하는 것이 좋습니다.",
          },
          {
            question: "계산 기록은 어디에 저장되나요?",
            answer:
              "기본적으로 사용자의 브라우저 저장소를 활용합니다. 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 저장된 기록이 보이지 않을 수 있습니다.",
          },
        ]}
      />

      <RelatedGuides
        links={[
          {
            href: "/salary/pay-table",
            title: "공무원 봉급표 확인하기",
            desc: "직렬과 호봉별 기본급 흐름을 먼저 확인해보세요.",
          },
          {
            href: "/guide/salary/actual-pay",
            title: "실수령액이 달라지는 이유",
            desc: "수당과 공제가 월급에 반영되는 방식을 설명합니다.",
          },
          {
            href: "/guide/salary/overtime",
            title: "초과근무수당 계산 방식",
            desc: "시간외·야간·휴일근무수당을 볼 때 주의할 점을 정리했습니다.",
          },
        ]}
      />
    </ContentShell>
  );
}

export function PayTableContent() {
  return (
    <ContentShell>
      <ContentCard eyebrow="PAY TABLE GUIDE" title="공무원 봉급표는 기본급을 이해하는 기준표입니다">
        <p>
          공무원 봉급표는 직렬, 직급, 호봉에 따른 기본급 기준을 확인하는 표입니다. 봉급표의
          금액은 보수 구조의 출발점이지만, 실제 월급 전체를 의미하지는 않습니다. 매월 받는
          금액에는 수당과 공제가 함께 반영되므로 봉급표는 기본급 흐름을 파악하는 기준으로
          보는 것이 좋습니다.
        </p>
        <p>
          호봉이 올라가면 기본급이 증가하고, 승진으로 직급이 달라지면 같은 호봉이라도 기준액이
          바뀔 수 있습니다. 따라서 현재 호봉뿐 아니라 다음 호봉, 승진 이후 구간을 함께 비교하면
          장기적인 급여 변화를 더 쉽게 이해할 수 있습니다.
        </p>
      </ContentCard>

      <ContentCard title="봉급표를 볼 때 함께 확인하면 좋은 것">
        <InfoList
          items={[
            "직렬과 직급: 일반직, 특정직 등 보수표 구분에 따라 기준 금액이 달라질 수 있습니다.",
            "호봉: 경력과 재직 흐름을 반영하는 기준으로, 같은 직급 안에서도 금액 차이를 만듭니다.",
            "수당: 기본급 외에 적용되는 항목이 많으므로 별도 수당 페이지와 함께 보는 것이 좋습니다.",
            "공제: 실수령액을 비교하려면 보험료와 세금 등 차감 항목도 함께 고려해야 합니다.",
          ]}
        />
      </ContentCard>

      <ContentCard title="봉급표와 계산기를 함께 사용하는 방법">
        <p>
          먼저 봉급표에서 자신의 직렬, 직급, 호봉에 해당하는 기본급을 확인합니다. 그다음 봉급
          계산기에서 가족수당, 특수업무수당, 초과근무수당, 공제 항목 등을 입력하면 기본급과
          실제 예상 수령액의 차이를 비교할 수 있습니다.
        </p>
        <p>
          봉급표는 공식 기준에 가까운 정적인 자료이고, 계산기는 여러 조건을 입력해 예상 결과를
          비교하는 동적인 도구입니다. 두 기능을 함께 사용하면 단순 금액 확인을 넘어 공무원 보수
          구조 전체를 이해하는 데 도움이 됩니다.
        </p>
      </ContentCard>

      <FaqSection
        items={[
          {
            question: "봉급표 금액이 실제 월급인가요?",
            answer:
              "봉급표 금액은 보통 기본급을 의미합니다. 실제 월급은 기본급에 수당이 더해지고 공제가 차감되어 결정됩니다.",
          },
          {
            question: "호봉이 오르면 실수령액도 같은 비율로 오르나요?",
            answer:
              "기본급은 증가하지만 공제액도 함께 변할 수 있어 실수령액이 같은 비율로 증가한다고 보기는 어렵습니다.",
          },
          {
            question: "봉급표는 언제 업데이트해야 하나요?",
            answer:
              "보수규정이나 연도별 보수표가 바뀌면 업데이트가 필요합니다. 계산 결과를 볼 때는 적용 기준 연도를 함께 확인하는 것이 좋습니다.",
          },
        ]}
      />

      <RelatedGuides
        links={[
          {
            href: "/salary/calculator",
            title: "봉급 계산기로 실수령액 확인",
            desc: "기본급에 수당과 공제를 반영해 예상 급여를 비교합니다.",
          },
          {
            href: "/salary/allowances",
            title: "공무원 수당제도",
            desc: "기본급 외에 적용되는 주요 수당 항목을 확인합니다.",
          },
          {
            href: "/guide/salary/allowance-basic",
            title: "공무원 수당 종류 정리",
            desc: "수당을 처음 보는 사람도 이해할 수 있게 정리했습니다.",
          },
        ]}
      />
    </ContentShell>
  );
}

export function PensionCalcContent() {
  return (
    <ContentShell>
      <ContentCard eyebrow="PENSION GUIDE" title="공무원 연금 계산에서 중요한 기준">
        <p>
          공무원 연금은 단순히 현재 월급만으로 결정되는 항목이 아닙니다. 재직기간, 기준소득월액,
          적용률, 퇴직 시점의 제도 기준 등 여러 요소가 함께 반영됩니다. 그래서 연금 계산기는
          정확한 확정 금액을 알려주는 도구라기보다, 입력한 조건에 따라 예상 흐름을 비교하는
          참고 도구로 이해하는 것이 좋습니다.
        </p>
        <p>
          특히 기준소득월액은 연금 계산에서 자주 등장하는 개념입니다. 현재 급여의 일부 항목만
          단순히 더한 금액과는 다를 수 있으므로, 연금 예상액을 볼 때는 기준소득월액이 무엇을
          의미하는지 먼저 이해하는 것이 중요합니다.
        </p>
      </ContentCard>

      <ContentCard title="연금 예상액을 볼 때 확인할 항목">
        <InfoList
          items={[
            "재직기간: 장기 재직 여부는 연금 수준과 퇴직수당 계산에 큰 영향을 줍니다.",
            "기준소득월액: 연금 산정의 기초가 되는 금액으로, 일반 월급과 구분해서 봐야 합니다.",
            "퇴직 시점: 제도 기준과 개인별 상황에 따라 실제 수급 시기와 금액이 달라질 수 있습니다.",
            "퇴직수당: 연금과 별도로 비교해야 하는 퇴직 급여 성격의 항목입니다.",
          ]}
        />
      </ContentCard>

      <ContentCard title="계산 결과는 참고용으로 활용하세요">
        <p>
          연금 관련 제도는 법령 개정, 재직 이력, 개인별 기준소득월액, 납부 이력 등에 따라 실제
          금액이 달라질 수 있습니다. 따라서 공무원 노트의 연금 계산 결과는 장기적인 재정 계획을
          세우기 전에 대략적인 방향을 확인하는 자료로 활용하는 것이 안전합니다.
        </p>
        <p>
          공식적인 예상 연금액이나 퇴직 관련 상담이 필요한 경우에는 공무원연금공단 등 공식
          기관에서 제공하는 자료를 함께 확인해야 합니다.
        </p>
      </ContentCard>

      <FaqSection
        items={[
          {
            question: "공무원 연금 계산기는 확정 금액을 알려주나요?",
            answer:
              "아니요. 입력값과 공개 기준을 바탕으로 예상 흐름을 보여주는 참고용 계산입니다. 실제 금액은 공식 기관의 산정 결과와 다를 수 있습니다.",
          },
          {
            question: "기준소득월액과 월급은 같은 개념인가요?",
            answer:
              "같은 개념으로 보기 어렵습니다. 기준소득월액은 연금 산정에 쓰이는 기준 금액으로, 일반적인 월급 총액이나 실수령액과 다를 수 있습니다.",
          },
          {
            question: "퇴직수당도 연금 계산에 포함되나요?",
            answer:
              "퇴직수당은 연금과 함께 확인해야 하는 별도 항목입니다. 장기 재직 후 퇴직 계획을 볼 때는 연금 예상액과 퇴직수당을 함께 비교하는 것이 좋습니다.",
          },
        ]}
      />

      <RelatedGuides
        links={[
          {
            href: "/pension/severance",
            title: "공무원 퇴직수당 계산",
            desc: "재직기간과 기준 정보를 바탕으로 퇴직수당을 확인합니다.",
          },
          {
            href: "/guide/pension/basic-income",
            title: "기준소득월액이란?",
            desc: "연금 계산의 기초가 되는 기준소득월액을 쉽게 설명합니다.",
          },
          {
            href: "/guide/pension/retirement",
            title: "연금과 퇴직수당의 차이",
            desc: "퇴직 후 받을 수 있는 주요 항목을 구분해봅니다.",
          },
        ]}
      />
    </ContentShell>
  );
}

export function PensionSeveranceContent() {
  return (
    <ContentShell>
      <ContentCard eyebrow="SEVERANCE GUIDE" title="공무원 퇴직수당은 연금과 별도로 확인해야 합니다">
        <p>
          공무원 퇴직수당은 퇴직 시점에 확인하게 되는 급여 성격의 항목으로, 매월 받는 연금과는
          구분해서 이해해야 합니다. 재직기간, 기준소득월액, 적용 기준에 따라 결과가 달라질 수
          있으므로 연금 예상액과 함께 비교하면 퇴직 후 재정 흐름을 더 현실적으로 볼 수 있습니다.
        </p>
        <p>
          퇴직수당은 장기 재직 여부에 영향을 많이 받습니다. 같은 현재 급여 수준이라도 재직기간이
          다르면 결과가 달라질 수 있고, 퇴직 시점의 제도 기준에 따라 산식이나 반영 방식이 달라질
          수 있습니다.
        </p>
      </ContentCard>

      <ContentCard title="퇴직수당 계산 전에 확인할 것">
        <InfoList
          items={[
            "총 재직기간: 실제 인정되는 재직기간이 계산의 출발점입니다.",
            "기준소득월액: 퇴직수당 계산에서도 중요한 기준이 될 수 있습니다.",
            "퇴직 예정 시점: 제도 변경과 개인 상황에 따라 결과가 달라질 수 있습니다.",
            "연금 예상액: 퇴직수당만 단독으로 보기보다 연금 예상액과 함께 비교하는 것이 좋습니다.",
          ]}
        />
      </ContentCard>

      <ContentCard title="공식 확인이 필요한 경우">
        <p>
          퇴직수당은 개인의 재직 이력과 적용 기준에 따라 달라질 수 있는 항목입니다. 공무원 노트의
          계산 결과는 예상 비교용으로 활용하고, 실제 퇴직 준비나 재정 계획을 확정하기 전에는
          공무원연금공단 등 공식 기관의 안내를 확인하는 것이 안전합니다.
        </p>
      </ContentCard>

      <FaqSection
        items={[
          {
            question: "퇴직수당과 퇴직연금은 같은 건가요?",
            answer:
              "같은 개념은 아닙니다. 퇴직수당은 퇴직 시 확인하는 급여 성격의 항목이고, 연금은 퇴직 후 정기적으로 받을 수 있는 급여 성격으로 구분해서 보는 것이 좋습니다.",
          },
          {
            question: "재직기간이 길수록 퇴직수당도 늘어나나요?",
            answer:
              "일반적으로 재직기간은 중요한 요소입니다. 다만 실제 금액은 기준소득월액과 적용 기준에 따라 함께 달라질 수 있습니다.",
          },
          {
            question: "계산 결과를 공식 자료로 제출해도 되나요?",
            answer:
              "아니요. 공무원 노트의 결과는 참고용입니다. 공식 제출이나 확정 금액 확인에는 관련 기관의 공식 자료를 사용해야 합니다.",
          },
        ]}
      />
    </ContentShell>
  );
}
