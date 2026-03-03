import type { AllowanceDefinition } from "../../types";

export const specialDutySpecial: AllowanceDefinition = {
  id: "special-duty.special",
  title: "특수업무수당",
  summary:
    "특수한 업무에 종사하는 공무원에게 지급하며, 업무 곤란성·난이도가 높은 경우 가산금이 있을 수 있습니다. 지급구분/금액은 별표 기준입니다(일부 수당은 중복지급 제한 규정 존재).",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제14조 및 [별표11]",
    "지방: 지방공무원 수당 등에 관한 규정 제14조 및 [별표9]",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "지급대상", national: "특수한 업무 종사자", local: "특수한 업무 종사자" },
    { field: "지급구분/금액", national: "[별표11]", local: "[별표9]" },
    { field: "가산금", national: "업무 곤란성·난이도 높은 경우 가능", local: "업무 곤란성·난이도 높은 경우 가능" },
    { field: "중복지급", national: "별표 수당 간 중복 제한/예외 규정 존재", local: "별표 수당 간 중복 제한/예외 규정 존재" },
  ],
  footnotes: ["* 어떤 수당과 같이 받을 수 있는지(중복 가능/불가)는 별표 및 조문 예외를 꼭 확인하세요."],
};