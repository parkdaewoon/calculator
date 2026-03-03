import type { AllowanceDefinition } from "../../types";

export const specialAreaRemote: AllowanceDefinition = {
  id: "special-area.remote",
  title: "특수지근무수당",
  summary:
    "도서·벽지·접적지 등 특수지 근무자에게 지급합니다. 지급대상지역·등급·금액은 별표(및 실태조사/지침) 기준으로 운영됩니다.",
  lawRefs: [
    "국가: 공무원수당 등에 관한 규정(특수지근무수당 조문 및 별표)",
    "지방: 지방공무원 수당 등에 관한 규정(특수지근무수당 조문 및 별표)",
  ],
  columns: [
    { key: "field", header: "항목", widthClassName: "w-[220px]" },
    { key: "value", header: "내용" },
  ],
  rows: [
    { field: "지급대상", value: "도서·벽지·접적지·특수기관 등 해당 지역/기관 근무자" },
    { field: "금액/등급", value: "지급구분·대상지역·등급은 ‘별표’에서 확인" },
    { field: "운영", value: "대상지역 조정/실태조사 및 소관 지침 적용" },
  ],
  footnotes: ["* 특수지근무수당은 결근 시 일액 공제가 적용될 수 있습니다(관련 조문)."],
};