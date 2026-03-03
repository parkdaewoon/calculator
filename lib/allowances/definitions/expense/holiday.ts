import type { AllowanceDefinition } from "../../types";

export const expenseHoliday: AllowanceDefinition = {
  id: "expense.holiday",
  title: "명절휴가비",
  summary:
    "설·추석 등 명절 기준 재직자에게 지급되는 실비성 급여입니다. 지급 방식은 보수규정 준용 조문에 따라 처리됩니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제18조의7(보수규정 준용)",
    "지방: 지방공무원 수당 등에 관한 규정 제18조의7(보수규정 준용)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "명절일 기준 재직 공무원(기관별 지급 요건/기준일 운영)" },
    { field: "지급/정산", value: "보수규정 준용 방식으로 지급" },
  ],
  footnotes: ["* 금액 산정 방식은 보수규정(준용)과 기관 지침에 따릅니다."],
};