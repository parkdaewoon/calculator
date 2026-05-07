import type { Metadata } from "next";
import GuideArticle from "@/components/seo/GuideArticle";

export const metadata: Metadata = {
  title: "공무원 수당 종류 한눈에 정리",
  description:
    "공무원 월급을 이해할 때 함께 봐야 할 주요 수당 종류와 확인 순서를 정리했습니다.",
  alternates: { canonical: "/guide/salary/allowance-basic" },
  openGraph: {
    title: "공무원 수당 종류 한눈에 정리 | 공무원 노트",
    description: "기본급 외에 월급에 영향을 주는 주요 수당 항목을 확인하세요.",
    url: "/guide/salary/allowance-basic",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "article",
  },
};

export default function Page() {
  return (
    <GuideArticle
      eyebrow="ALLOWANCE GUIDE"
      title="공무원 수당 종류 한눈에 정리"
      description="공무원 월급은 기본급만으로 결정되지 않습니다. 여러 수당이 더해지기 때문에 어떤 수당이 있는지, 어떤 기준으로 확인해야 하는지 이해하는 것이 중요합니다."
      sections={[
        {
          title: "수당은 기본급을 보완하는 항목입니다",
          paragraphs: [
            "기본급은 직급과 호봉을 기준으로 정해지는 중심 금액입니다. 수당은 근무 조건, 직무 특성, 생활 보전, 초과근무 등 다양한 사유로 추가될 수 있는 금액입니다. 그래서 같은 봉급표 금액을 가진 사람이라도 실제 월급은 달라질 수 있습니다.",
            "공무원 수당을 볼 때는 모든 사람이 같은 항목을 받는다고 생각하기보다, 자신에게 적용되는 조건이 무엇인지 확인하는 방식으로 접근하는 것이 좋습니다.",
          ],
        },
        {
          title: "자주 확인하는 수당 항목",
          paragraphs: [
            "대표적으로 가족수당, 정액급식비, 직급보조비, 위험근무수당, 특수업무수당, 시간외근무수당, 야간근무수당, 휴일근무수당 등이 있습니다. 항목마다 지급 요건과 기준이 다르기 때문에 이름만 보고 금액을 확정하기는 어렵습니다.",
          ],
          bullets: [
            "생활 보전 성격: 가족수당, 정액급식비 등",
            "직무나 근무 조건 성격: 위험근무수당, 특수업무수당 등",
            "근무 실적 성격: 시간외근무수당, 야간근무수당, 휴일근무수당 등",
            "직위·직급 관련 성격: 직급보조비 등",
          ],
        },
        {
          title: "월급 계산 시 수당을 입력하는 방법",
          paragraphs: [
            "봉급 계산기를 사용할 때는 먼저 기본급을 확인하고, 이후 실제 적용되는 수당만 입력하는 것이 좋습니다. 적용 여부가 불확실한 항목은 임의로 넣기보다 0원으로 두고 비교하거나, 별도로 확인한 뒤 입력하는 편이 안전합니다.",
            "특히 초과근무수당처럼 매월 달라질 수 있는 항목은 평균적인 값을 넣어보거나 월별로 따로 비교해보면 급여 흐름을 이해하는 데 도움이 됩니다.",
          ],
        },
        {
          title: "수당 확인 시 주의사항",
          paragraphs: [
            "수당은 법령과 내부 기준, 근무 사실에 따라 적용 여부가 달라질 수 있습니다. 같은 명칭의 수당이라도 직렬, 기관, 근무 형태에 따라 실제 지급 조건이 다를 수 있으므로 공식 자료와 소속 기관 안내를 함께 확인해야 합니다.",
          ],
        },
      ]}
      related={[
        { href: "/salary/allowances", title: "공무원 수당제도" },
        { href: "/salary/calculator", title: "공무원 봉급 계산기" },
        { href: "/guide/salary/overtime", title: "초과근무수당 계산 방식" },
      ]}
    />
  );
}
