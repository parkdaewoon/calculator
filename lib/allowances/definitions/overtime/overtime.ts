import type { AllowanceDefinition } from "../../types";

export const overtimeAllowance: AllowanceDefinition = {
  id: "overtime.overtime",
  title: "초과근무수당(시간외근무수당)",
  summary:
    "근무명령에 따라 규정된 근무시간 외 근무를 한 경우 지급합니다. 산정기준(봉급기준액 등)과 제외대상은 조문 및 소관 지침에 따릅니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제15조",
    "지방: 지방공무원 수당 등에 관한 규정(시간외근무수당 조문) 및 제22조(자율 운영 특례 가능)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "근무명령에 따라 규정 근무시간 외 근무한 공무원(일부 제외자 존재)" },
    { field: "산정", value: "기준호봉 봉급액 등 조문 산식/기준 적용" },
    { field: "운영", value: "기관별 승인·정산 절차 및 상한/예외는 지침 반영" },
  ],
  footnotes: ["* 현업공무원 야간/휴일근무수당 등은 별도 조문으로 운영됩니다."],
};