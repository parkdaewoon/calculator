// lib/allowances/calculator/expense/position.ts
import type { PayTableId } from "@/lib/payTables";

/**
 * [별표 15] 직급보조비(제18조의6 관련) - 2026.1.2 개정 반영
 * - 기본은 “모든 공무원(군인/경찰·소방/교육공무원 제외)” 기준으로 산정
 * - 너 UI/데이터 구조상 gradeGuess(1~9)를 받아서 계산하는 버전이 실용적이라 그걸 기본 제공
 *
 * 출처: 공무원수당 등에 관한 규정 [별표 15] :contentReference[oaicite:1]{index=1}
 */

export type PositionCategory = "GENERAL" | "MILITARY" | "POLICE_FIRE" | "EDU";

export type PositionAllowanceArgs = {
  /** 너가 쓰는 직렬 키 (PAY_TABLES의 id) */
  series: PayTableId;

  /**
   * 1~9급 추정값 (너 SalaryCalculator의 columnKeyToGradeGuess 결과)
   * - 1: 1급(상당), 2: 2급(상당), ... , 9: 9급
   */
  gradeGuess: number;

  /**
   * 별표15 비고 6 감액(전용승용차 제공받는 경우 / 재외근무수당 일부 받는 경우)
   * - true면 해당 구간 감액 적용
   * - (너 서비스에서 나중에 체크박스로 받기 좋음)
   */
  hasOfficialCar?: boolean;
  hasOverseasAllowance?: boolean;

  /**
   * (선택) 직급보조비 지급 불가 케이스를 너가 관리하고 싶으면 여기서 차단
   * - 예: 교수보직경비 지급받는 교육공무원 등(비고 7)
   */
  disabled?: boolean;
};

function clampGrade(g: number) {
  if (!Number.isFinite(g)) return 9;
  return Math.min(9, Math.max(1, Math.trunc(g)));
}

/**
 * 기본 직급보조비(월) - GENERAL(군인/경찰소방/교육 제외) 기준
 * [별표15 본표] :contentReference[oaicite:2]{index=2}
 */
export function getPositionBaseMonthlyByGradeGeneral(gradeGuess: number): number {
  const g = clampGrade(gradeGuess);

  // 일반직 등: 4급 400,000 / 5급 250,000 / 6급 185,000 / 7급 180,000 / 8·9급 175,000
  // 1~3급(상당): 1급 750,000 / 2급 650,000 / 3급 500,000
  if (g === 1) return 750_000;
  if (g === 2) return 650_000;
  if (g === 3) return 500_000;
  if (g === 4) return 400_000;
  if (g === 5) return 250_000;
  if (g === 6) return 185_000;
  if (g === 7) return 180_000;
  // 8,9
  return 175_000;
}

/**
 * 감액(월) - 비고 6의 감액표를 “급(1~9)” 단순화해서 적용
 * [별표15 비고 6 감액표] :contentReference[oaicite:3]{index=3}
 */
export function getPositionReductionMonthlyGeneral(gradeGuess: number): number {
  const g = clampGrade(gradeGuess);

  // 감액표(일반직 등 기준) 요약:
  // - 1~3급(상당) : 200,000
  // - 4~5급(상당) : 140,000
  // - 6~7급(상당) : 130,000
  // - 8~9급(상당) : 표에 직접 없지만, 실무에선 6~7과 동일/또는 별도 처리 가능
  //   => 안전하게 130,000으로 두고, 정책 확정되면 조정해.
  if (g <= 3) return 200_000;
  if (g <= 5) return 140_000;
  return 130_000;
}

/**
 * 최종 직급보조비(월)
 */
export function calcPositionAllowanceMonthly(args: PositionAllowanceArgs): number {
  const {
    gradeGuess,
    hasOfficialCar = false,
    hasOverseasAllowance = false,
    disabled = false,
  } = args;

  if (disabled) return 0;

  const base = getPositionBaseMonthlyByGradeGeneral(gradeGuess);

  // 비고 6: 전용승용차 제공 또는 재외근무수당 지급 시 감액
  const shouldReduce = hasOfficialCar || hasOverseasAllowance;
  const reduction = shouldReduce ? getPositionReductionMonthlyGeneral(gradeGuess) : 0;

  const v = base - reduction;
  return v > 0 ? v : 0;
}