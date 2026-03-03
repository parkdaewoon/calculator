import type { AllowanceDefinition } from "../../types";

export const overtimeManagement: AllowanceDefinition = {
  id: "overtime.management",
  title: "관리업무수당",
  summary:
    "관리업무수당은 별표에 규정된 공무원에게 지급되며, 지급 구분은 별표 기준으로 운영됩니다.",
  lawRefs: ["국가: 공무원수당 등에 관한 규정 제17조의2 및 [별표13]"],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "[별표13]에 규정된 공무원" },
    { field: "지급기준/금액", value: "[별표13] 확인" },
  ],
  footnotes: ["* 지방공무원은 지방 규정 내 ‘관리업무수당(또는 유사 수당)’ 조문/별표 체계를 확인해 매핑하면 됩니다."],
};