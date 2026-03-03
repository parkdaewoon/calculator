import type { AllowanceDefinition } from "../../types";

export const familyChildcare: AllowanceDefinition = {
  id: "family.childcare",
  title: "육아휴직수당",
  summary:
    "30일 이상 육아휴직 시 기간 구간별로 월봉급액 기준으로 지급하며, 월 상한이 적용됩니다. (부모 모두 육아휴직, 한부모 등 예외 규정 있음)",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제11조의3",
    "지방: 지방공무원 수당 등에 관한 규정 제11조의2",
  ],
  columns: [
    { key: "period", header: "기간", widthClassName: "w-[240px]" },
    { key: "rule", header: "산정/상한(핵심)" },
  ],
  rows: [
    {
      period: "1~6개월",
      rule: "육아휴직 시작일 기준 월봉급액 상당액(구간별 월 상한 적용)",
    },
    {
      period: "7개월째 이후",
      rule: "육아휴직 시작일 기준 월봉급액의 80%(월 상한 적용)",
    },
    {
      period: "월 상한(기본)",
      rule: "1~3개월 250만원 / 4~6개월 200만원 / 7개월~ 160만원 (최저 70만원)",
    },
    {
      period: "예외(예: 부모 모두 육아휴직 등)",
      rule: "두 번째 육아휴직자 상한 상향 등 별도 규정 적용",
    },
  ],
  footnotes: ["* 세부 예외·지급기간(최대 12~18개월 등)은 조문 기준으로 반영하세요."],
};