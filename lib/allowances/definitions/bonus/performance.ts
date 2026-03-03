import type { AllowanceDefinition } from "../../types";

export const bonusPerformance: AllowanceDefinition = {
  id: "bonus.performance",
  title: "성과상여금",
  summary:
    "근무성적·업무실적 등이 우수한 공무원에게 성과상여금을 지급합니다. 지급대상·기준액·등급·지급방식은 별표와 소관 지침에 따라 운영됩니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제7조의2 및 [별표2의2], [별표2의3], [별표2의4]",
    "지방: 지방공무원 수당 등에 관한 규정 제6조의2 및 [별표2의2], [별표2의3], [별표3] 등",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    {
      field: "지급대상",
      national: "[별표2의2] 대상 중 우수자",
      local: "[별표2의2] 대상 중 우수자",
    },
    {
      field: "지급기준액표",
      national: "[별표2의3]",
      local: "[별표2의3]",
    },
    {
      field: "등급/지급액",
      national: "개인차등 지급 시 [별표2의4] 기준(기관 조정 가능)",
      local: "개인차등 지급 시 [별표3] 기준(기관 조정 가능)",
    },
    {
      field: "지급방식",
      national: "개인 차등/부서 차등/혼합 등(조문 규정)",
      local: "개인 차등/부서 차등/혼합 등(조문 규정)",
    },
  ],
  footnotes: ["* 기관별 ‘성과상여금 운영지침’이 실제 지급에 큰 영향을 줍니다."],
};