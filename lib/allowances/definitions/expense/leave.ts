import type { AllowanceDefinition } from "../../types";

export const expenseLeave: AllowanceDefinition = {
  id: "expense.leave",
  title: "연가보상비",
  summary:
    "사용하지 않은 연가(통상 20일 이내 등)에 대해 보상하는 수당입니다. 지급 기준·산정·지급시기·퇴직자 정산 등은 규정 및 보수규정 준용에 따릅니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제18조의7(보수규정 준용)",
    "지방: 지방공무원 수당 등에 관한 규정(연가보상비 조문 및 산식) + 제18조의7(준용)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "지급대상(요약)", national: "규정·보수규정 준용 기준", local: "규정 기준(퇴직자/반기정산 등 규정 포함)" },
    {
      field: "산정(예시/핵심)",
      national: "보수규정 준용(기관 기준 적용)",
      local: "예: 월봉급액의 86% × 1/30 × 연가보상일수(정산 방식은 조문 참조)",
    },
  ],
  footnotes: ["* 연가보상일수 한도·지급시기·퇴직정산은 반드시 최신 지침으로 확정하세요."],
};