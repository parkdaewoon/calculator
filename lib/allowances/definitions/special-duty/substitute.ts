import type { AllowanceDefinition } from "../../types";

export const specialDutySubstitute: AllowanceDefinition = {
  id: "special-duty.substitute",
  title: "업무대행수당",
  summary:
    "병가·출산휴가·유산휴가·사산휴가·재난 대응 출장/파견 또는 휴직 등으로 발생한 업무를 대행하는 공무원에게 월 20만원 지급(여러 명이 대행하면 계산식 적용).",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제14조의2",
    "지방: 지방공무원 수당 등에 관한 규정 제14조의2",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "기본 지급액", national: "월 20만원", local: "월 20만원" },
    {
      field: "대상(요약)",
      national: "30일 이상 병가·휴가·재난출장/파견 또는 (육아휴직 외) 6개월 미만 휴직자의 업무 대행 등",
      local: "30일 이상 병가·휴가·재난출장/파견 또는 (육아휴직 외) 6개월 미만 휴직자의 업무 대행 등",
    },
    {
      field: "여러 명 대행",
      national: "조문 계산식에 따라 안분/산정",
      local: "조문 계산식에 따라 안분/산정",
    },
  ],
  footnotes: ["* 실제 지급은 ‘대행 지정’ 및 기관 내부 절차가 전제됩니다."],
};