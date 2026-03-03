import type { AllowanceDefinition } from "../../types";

export const specialDutyRisk: AllowanceDefinition = {
  id: "special-duty.risk",
  title: "위험근무수당",
  summary:
    "위험한 직무에 종사하는 공무원에게 지급합니다. 지급구분/등급/금액은 별표 기준으로 산정됩니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제13조 및 [별표8], [별표9]",
    "지방: 지방공무원 수당 등에 관한 규정 제13조 및 [별표7], [별표8]",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "지급대상", national: "위험한 직무 종사자", local: "위험한 직무 종사자" },
    { field: "지급구분", national: "[별표8]", local: "[별표7]" },
    { field: "등급/금액", national: "[별표9]", local: "[별표8]" },
  ],
  footnotes: ["* 군인/군무원 등은 별도 규정(국가 규정에 별도 별표/부령)이 적용될 수 있습니다."],
};