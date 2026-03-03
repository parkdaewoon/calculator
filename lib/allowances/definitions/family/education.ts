import type { AllowanceDefinition } from "../../types";

export const familyEducation: AllowanceDefinition = {
  id: "family.education",
  title: "자녀학비보조수당",
  summary:
    "국외학교에 다니는 자녀가 있는 재외(국외파견 포함) 공무원에게 자녀 1명당 기준에 따라 지급합니다. 학비 면제/무상인 경우 미지급. 봉급 감액 시 [별표4]로 감액.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제11조 및 [별표6], [별표4]",
    "지방: 지방공무원 수당 등에 관한 규정 제3조(국외파견 특례로 국가 규정 준용)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    {
      field: "지급대상",
      national: "국외학교에 다니는 자녀가 있는 재외공무원",
      local: "국외파견 시 국가 규정 준용(재외공무원 준용)",
    },
    {
      field: "지급액/구분",
      national: "자녀 1명당 [별표6] 지급구분에 따름",
      local: "준용(국가 [별표6])",
    },
    {
      field: "미지급",
      national: "법령에 따라 학비 면제 또는 무상인 국외학교인 경우",
      local: "준용",
    },
    {
      field: "감액",
      national: "봉급 감액 시 [별표4] 감액(월할 계산 적용)",
      local: "준용",
    },
  ],
  footnotes: ["* 신청/변동신고·환수 등은 규정 조문 절차를 따릅니다."],
};