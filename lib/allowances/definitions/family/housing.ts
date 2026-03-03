import type { AllowanceDefinition } from "../../types";

export const familyHousing: AllowanceDefinition = {
  id: "family.housing",
  title: "주택수당",
  summary:
    "재외공무원 및 일부 군인에게 주택수당을 지급합니다(정부 제공/임차 주택 무상거주 등은 미지급). 봉급 감액 시 [별표4]로 감액.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제11조의2 및 [별표6의2], [별표4]",
    "지방: 지방공무원 수당 등에 관한 규정 제3조(국외파견 특례로 국가 규정 준용)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    { field: "지급대상", national: "재외공무원(및 하사~중령 군인)", local: "국외파견 시 국가 규정 준용" },
    { field: "지급액/구분", national: "[별표6의2]", local: "준용(국가 [별표6의2])" },
    { field: "감액", national: "봉급 감액 시 [별표4] 감액", local: "준용" },
  ],
  footnotes: ["* 재외근무 조건·거주형태에 따라 미지급 사유가 발생할 수 있습니다."],
};