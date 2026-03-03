import type { AllowanceDefinition } from "../../types";

export const bonusPwu: AllowanceDefinition = {
  id: "bonus.pwu",
  title: "대우공무원수당",
  summary:
    "대우공무원으로 선발된 사람에게 월봉급액의 4.1%를 지급(승진 상위직급 봉급 초과 시 차액 한도). 필수실무관/요원 지정 시 월 10만원 가산 가능. 정직·감봉·직위해제·휴직 등 봉급 감액 시 별표4 기준으로 감액.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제6조의2 및 [별표4]",
    "지방: 지방공무원 수당 등에 관한 규정 제5조의2 및 [별표4]",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    {
      field: "지급대상",
      national: "대우공무원으로 선발된 사람",
      local: "대우공무원으로 선발된 사람",
    },
    {
      field: "기본 지급액",
      national: "월봉급액의 4.1%",
      local: "월봉급액의 4.1%",
    },
    {
      field: "상한(승진봉급 초과 방지)",
      national:
        "수당+월봉급액 합산이 상위직급 승진 시 월봉급액을 초과하면 ‘현 직급 봉급액과 상위직급 봉급액의 차액’만 지급",
      local:
        "수당+월봉급액 합산이 상위직급 승진 시 월봉급액을 초과하면 ‘현 직급 봉급액과 상위직급 봉급액의 차액’만 지급",
    },
    {
      field: "가산(필수실무관/요원)",
      national: "예산 범위에서 월 10만원 가산 가능",
      local: "예산 범위에서 월 10만원 가산 가능",
    },
    {
      field: "감액/미지급",
      national: "정직·감봉·직위해제·휴직 등 봉급 감액 시 [별표4]에 따라 감액",
      local: "정직·감봉·직위해제·휴직 등 봉급 감액 시 [별표4]에 따라 감액",
    },
  ],
  footnotes: ["* 실제 적용은 소속기관 지침 및 예산 범위 내에서 운영됩니다."],
};