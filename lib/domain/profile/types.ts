export type MoneyMode = "auto" | "manual";

/** ✅ 페이지들(퇴직/연금/비교)에서 공통으로 쓰는 '기본 정보' */
export type BaseProfile = {
  version: 1;

  // PAY_TABLES 연동
  series: string;     // PayTableId로 좁혀도 됨
  columnKey: string;  // 예: "g9"
  step: number;       // 1~32

  // 날짜 기반 근속/퇴직
  startDate: string;  // YYYY-MM-DD (임용/재직 시작)
  retireDate: string; // YYYY-MM-DD (퇴직 예정)

  // 옵션
  birthDate?: string; // 필요 시(연금 수령개시 나이 계산)
};
