// lib/allowances/calculator/overtime/index.ts
import { getPay, type PayTableId } from "@/lib/payTables";

export type OvertimeKind = "OVERTIME" | "NIGHT" | "HOLIDAY";

function inferGradeFromColumnKeyOrLabel(
  series: PayTableId,
  columnKey: string
): number | null {
  // 1) key에서 g9 같은 숫자 추출
  const m1 = String(columnKey).match(/\d+/);
  if (m1) {
    const n = Number(m1[0]);
    if (Number.isFinite(n) && n >= 1 && n <= 9) return n;
  }

  // 2) label에서 "9급" 추출
  // (payTables의 label이 "9급·1등급" 같은 형태라면 동작)
  // label을 직접 읽으려면 payTables를 import해야 해서
  // 여기서는 최소 구현으로 key 기반만 두고,
  // 필요하면 이후 PAY_TABLES import해서 label 매칭 추가하면 됨.
  return null;
}

/**
 * 시간외수당 봉급기준액 비율(기본)
 * - 8급 및 8급 상당 이하: 60%
 * - 그 외: 55%
 *
 * (임기제/전문임기제 등 예외는 너가 나중에 series나 별도 플래그로 확장)
 */
export function getOvertimeBaseRate(series: PayTableId, columnKey: string): number {
  const grade = inferGradeFromColumnKeyOrLabel(series, columnKey);

  // grade를 못 뽑으면 일단 55%로 두고,
  // 너 직렬별 columnKey 규칙 정리되면 매핑을 추가하는 게 안전함.
  if (!grade) return 0.55;

  return grade >= 8 ? 0.60 : 0.55;
}

/**
 * 시간외/야간/휴일 자동 계산
 * - 봉급기준액 = (해당 급수 10호봉 봉급) * (55% 또는 60%)
 * - 시간당 = 봉급기준액 / 209
 * - 가산: 시간외 1.5, 야간 0.5, 휴일 2.0 (현재 너 UI가 시간 단위라면)
 */
export function calcOvertimeAllowance(args: {
  series: PayTableId;
  columnKey: string;
  hours: number;
  kind: OvertimeKind;
}): number {
  const { series, columnKey, hours, kind } = args;
  if (!hours || hours <= 0) return 0;

  // ✅ 10호봉 봉급(봉급기준액의 모수)
  const pay10 = getPay(series, columnKey, 10);
  const base10 = typeof pay10 === "number" ? pay10 : 0;
  if (!base10) return 0;

  const rate = getOvertimeBaseRate(series, columnKey);
  const wageStandard = base10 * rate;      // 봉급기준액(비율 적용)
  const hourly = wageStandard / 209;       // 209분의1

  const mul =
    kind === "OVERTIME" ? 1.5 :
    kind === "NIGHT"    ? 0.5 :
    kind === "HOLIDAY"  ? 2.0 :
    0;

  return Math.floor(hourly * mul * hours);
}
export * from "./night";
export * from "./holiday";
export * from "./management";