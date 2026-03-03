import type { AllowanceDefinition } from "../../types";

export const expenseMeal: AllowanceDefinition = {
  id: "expense.meal",
  title: "정액급식비",
  summary:
    "식비 성격의 정액급식비를 지급합니다. 지급 방식은 보수규정 준용 조문에 따라 처리됩니다(결근 시 일액 공제 가능).",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제18조의7(보수규정 준용)",
    "지방: 지방공무원 수당 등에 관한 규정 제18조의7(보수규정 준용)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "원칙적으로 전 공무원(기관별 예외/제외자 존재 가능)" },
    { field: "지급/정산", value: "보수규정 준용 방식으로 지급" },
    { field: "공제", value: "결근 시 정액급식비 ‘일액’ 공제 규정 존재" },
  ],
  footnotes: ["* 지방은 일부 직(예: 한시임기제)은 근무일수 비례 지급 규정이 별도로 존재합니다."],
};