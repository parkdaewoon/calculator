import type { Metadata } from "next";
import GuideArticle from "@/components/seo/GuideArticle";

export const metadata: Metadata = {
  title: "공무원 초과근무수당 계산 방식",
  description:
    "공무원 시간외근무수당, 야간근무수당, 휴일근무수당을 이해할 때 확인해야 할 기준을 정리했습니다.",
  alternates: { canonical: "/guide/salary/overtime" },
  openGraph: {
    title: "공무원 초과근무수당 계산 방식 | 공무원 노트",
    description: "시간외·야간·휴일근무수당 확인 시 주의할 점을 정리했습니다.",
    url: "/guide/salary/overtime",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "article",
  },
};

export default function Page() {
  return (
    <GuideArticle
      eyebrow="OVERTIME GUIDE"
      title="공무원 초과근무수당 계산 방식"
      description="초과근무수당은 실제 근무 실적과 인정 기준에 따라 달라질 수 있습니다. 시간외, 야간, 휴일근무를 구분해서 보면 월급 변동을 이해하기 쉽습니다."
      sections={[
        {
          title: "초과근무수당은 매월 달라질 수 있습니다",
          paragraphs: [
            "초과근무수당은 기본급처럼 고정적으로 같은 금액이 매월 지급되는 항목이 아닙니다. 실제 인정된 근무 시간, 근무 종류, 단가, 상한 기준 등에 따라 달라질 수 있습니다. 그래서 예상 급여를 계산할 때는 평균적인 근무 시간을 입력하거나 월별로 따로 비교하는 방법이 유용합니다.",
            "시간외근무, 야간근무, 휴일근무는 성격이 다르므로 각각의 시간을 구분해서 입력해야 결과를 더 현실적으로 볼 수 있습니다.",
          ],
        },
        {
          title: "시간외·야간·휴일근무를 구분해야 합니다",
          paragraphs: [
            "시간외근무수당은 정해진 근무시간 외에 근무한 시간과 관련된 항목입니다. 야간근무수당은 야간 시간대 근무와 관련이 있고, 휴일근무수당은 휴일 근무 실적에 따라 확인하게 됩니다. 세 항목은 이름이 비슷해도 적용 기준이 다르기 때문에 분리해서 보는 것이 좋습니다.",
          ],
          bullets: [
            "시간외근무수당: 정규 근무시간 외 근무와 관련된 항목",
            "야간근무수당: 야간 시간대 근무와 관련된 항목",
            "휴일근무수당: 휴일에 실제 근무한 경우 확인하는 항목",
          ],
        },
        {
          title: "계산 결과와 실제 지급액이 달라질 수 있는 이유",
          paragraphs: [
            "초과근무수당은 입력한 시간이 모두 그대로 인정된다는 전제로 계산하면 실제 지급액과 차이가 날 수 있습니다. 인정 시간, 사전 승인, 상한 기준, 소속 기관 처리 방식 등이 실제 지급액에 영향을 줄 수 있습니다.",
            "따라서 계산기는 월급 흐름을 대략 비교하기 위한 용도로 사용하고, 실제 지급 여부와 인정 시간은 소속 기관 기준을 확인하는 것이 안전합니다.",
          ],
        },
        {
          title: "예상 월급을 비교하는 방법",
          paragraphs: [
            "초과근무가 많은 달과 적은 달을 각각 입력해보면 월급 변동 폭을 쉽게 파악할 수 있습니다. 기본급과 고정 수당을 먼저 입력한 뒤, 초과근무 시간만 바꿔가며 비교하면 어떤 항목이 실수령액에 영향을 주는지 확인할 수 있습니다.",
          ],
        },
      ]}
      related={[
        { href: "/salary/calculator", title: "공무원 봉급 계산기" },
        { href: "/guide/salary/allowance-basic", title: "공무원 수당 종류 정리" },
        { href: "/salary/allowances", title: "공무원 수당제도" },
      ]}
    />
  );
}
