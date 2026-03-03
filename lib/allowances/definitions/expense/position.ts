import type { AllowanceDefinition } from "../../types";

export const expensePosition: AllowanceDefinition = {
  id: "expense.position",
  title: "직급보조비",
  summary:
    "직급(또는 직무급) 보조 성격의 직급보조비를 지급합니다. 지급 구분/금액은 별표 기준입니다. 결근 시 일액 공제 규정이 있습니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제18조의6 및 [별표15]",
    "지방: 지방공무원 수당 등에 관한 규정 제18조의6 및 [별표14]",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "지급대상", national: "원칙 전 공무원(일부 제외자 존재)", local: "원칙 전 공무원(일부 제외자 존재)" },
    { field: "금액표", national: "[별표15]", local: "[별표14]" },
    { field: "공제", national: "결근 시 직급보조비 일액 공제", local: "결근 시 직급보조비 일액 공제" },
  ],
  footnotes: ["* 연봉제 등 지급체계에 따라 ‘연봉에 포함된 직급보조비’는 별도 취급될 수 있습니다."],
};
