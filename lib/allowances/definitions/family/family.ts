import type { AllowanceDefinition } from "../../types";

export const familyAllowance: AllowanceDefinition = {
  id: "family.family",
  title: "가족수당",
  summary:
    "부양가족이 있는 공무원에게 가족수당을 지급합니다. 동일 부양가족에 대해 2명 이상 공무원이 부양하거나 부부가 공무원인 경우 1명에게만 지급. 봉급 감액 시 [별표4]로 감액.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정 제10조 및 [별표5], [별표4]",
    "지방: 지방공무원 수당 등에 관한 규정 제10조 및 [별표4]",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "national", header: "국가공무원" },
    { key: "local", header: "지방공무원" },
  ],
  rows: [
    {
      field: "지급대상",
      national: "부양가족이 있는 공무원(부양가족 정의는 조문 기준)",
      local: "부양가족이 있는 공무원(부양가족 정의는 조문 기준)",
    },
    {
      field: "지급액",
      national: "금액/구분은 [별표5] 확인",
      local:
        "배우자 월 4만원 / 첫째 5만원, 둘째 8만원, 셋째부터 12만원 / 기타(배우자·자녀 제외) 1인당 2만원",
    },
    {
      field: "중복 제한",
      national: "같은 부양가족: 공무원 2명 이상 또는 부부 공무원인 경우 1명에게만 지급",
      local: "같은 부양가족: 공무원 2명 이상 또는 부부 공무원인 경우 1명에게만 지급",
    },
    {
      field: "감액",
      national: "강등·정직·감봉·직위해제·휴직 등 봉급 감액 시 [별표4] 감액",
      local: "강등·정직·감봉·직위해제·휴직 등 봉급 감액 시 [별표4] 감액",
    },
  ],
  footnotes: ["* 부양가족 신고/변동신고, 환수·지급정지 등은 각 규정 조문 및 소관 지침을 따릅니다."],
};