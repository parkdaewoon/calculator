import type { AllowanceDefinition } from "../../types";

export const specialDutyLegal: AllowanceDefinition = {
  id: "special-duty.legal",
  title: "군법무관수당",
  summary:
    "군법무관에게 월봉급액의 35% 범위에서 지급(세부 대상/금액은 국방부령으로 정함).",
  lawRefs: ["국가: 공무원수당 등에 관한 규정 제14조의3"],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "군법무관" },
    { field: "지급기준", value: "월봉급액의 35% 범위" },
    { field: "세부기준", value: "국방부령으로 정함" },
  ],
  footnotes: ["* 이 수당은 일반 공무원에겐 해당되지 않을 수 있습니다(대상 직군 확인)."],
};