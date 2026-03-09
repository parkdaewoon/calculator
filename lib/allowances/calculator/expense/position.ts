// lib/allowances/calculator/expense/position.ts
import type { PayTableId } from "@/lib/payTables";

/**
 * 직급보조비(제18조의6, 별표 15) 월액 계산
 * - 2026. 1. 2. 시행 기준
 * - payTables의 series(id)를 보고 자동으로 카테고리 분기
 * - 기본은 gradeGuess 기반
 * - 군인은 하사/중사/상사/원사/준위 구간 때문에 columnKey를 함께 받는 것을 권장
 */

export type PositionCategory =
  | "GENERAL"
  | "MILITARY"
  | "POLICE_FIRE"
  | "EDU";

export type PositionAllowanceArgs = {
  /** payTables id */
  series: PayTableId;

  /**
   * 1~9급 추정값
   * - 일반직/경찰소방/교육은 이 값만으로도 대부분 처리 가능
   * - 군인은 가능하면 columnKey도 같이 넘겨서 정확도 보강
   */
  gradeGuess: number;

  /**
   * 원본 컬럼 키
   * - 군인에서 하사/중사/상사/원사/준위 구분용으로 사용
   * - 예: "hasa", "jungsa", "sangsa", "wonsa", "junwi"
   */
  columnKey?: string;

  /**
   * 비고 6 감액 대상 여부
   * - 전용승용차 제공
   * - 재외근무수당(별표11 제4호가목) 지급
   */
  hasOfficialCar?: boolean;
  hasOverseasAllowance?: boolean;

  /**
   * 감액 제외 여부
   * - 차관(급) 이상, 중장 이상, 치안총감/소방총감,
   *   보수규정 별표12 비고 제1호 가/나목 대상 등
   */
  reductionExempt?: boolean;

  /**
   * 지급 제외 여부
   * - 예: 교수보직경비 지급받는 교육공무원 등
   */
  disabled?: boolean;
};

function clampGrade(g: number): number {
  if (!Number.isFinite(g)) return 9;
  return Math.min(9, Math.max(1, Math.trunc(g)));
}

function normalizeKey(v?: string): string {
  return String(v ?? "").trim().toLowerCase().replace(/[\s_-]/g, "");
}

/**
 * payTables id → 직급보조비 카테고리
 * 실제 id가 다르면 이 switch만 네 프로젝트 id에 맞게 바꾸면 됨
 */
export function resolvePositionCategory(series: PayTableId): PositionCategory {
  switch (series) {
    case "military":
      return "MILITARY";

    case "policeFire":
      return "POLICE_FIRE";

    case "teachers":
    case "nationalUniv":
      return "EDU";

    case "general":
    case "constitutional":
    case "guidance":
    case "postal":
    case "professional":
    case "publicSafety":
    case "research":
    default:
      return "GENERAL";
  }
}

/**
 * 일반직/경찰소방/교육공무원 기본 월액
 * - 실제 표의 직위명은 다르지만 금액 체계는 gradeGuess 기준으로 동일하게 처리 가능
 */
export function getPositionBaseMonthlyNonMilitary(
  gradeGuess: number
): number {
  const g = clampGrade(gradeGuess);

  switch (g) {
    case 1:
      return 750_000;
    case 2:
      return 650_000;
    case 3:
      return 500_000;
    case 4:
      return 400_000;
    case 5:
      return 250_000;
    case 6:
      return 185_000;
    case 7:
      return 180_000;
    case 8:
    case 9:
    default:
      return 175_000;
  }
}

/**
 * 군인 기본 월액
 *
 * 정확도 우선 순서:
 * 1) columnKey 기반 정확 분기
 * 2) 없으면 gradeGuess 기반 fallback
 */
export function getPositionBaseMonthlyMilitary(
  gradeGuess: number,
  columnKey?: string
): number {
  const key = normalizeKey(columnKey);

  // columnKey 기반 정확 분기
  if (["daejang"].includes(key)) return 1_240_000;
  if (["jungjang"].includes(key)) return 950_000;
  if (["sojang"].includes(key)) return 900_000;
  if (["junjang"].includes(key)) return 750_000;
  if (["daeryeong", "colonel"].includes(key)) return 650_000;
  if (["jungryeong", "lieutenantcolonel"].includes(key)) return 500_000;
  if (["soryeong", "major"].includes(key)) return 400_000;
  if (["daewi", "captain"].includes(key)) return 250_000;
  if (["junwi", "warrantofficer"].includes(key)) return 200_000;
  if (["wonsa", "mastersergeant"].includes(key)) return 185_000;
  if (["sangsa", "sergeantfirstclass"].includes(key)) return 180_000;
  if (["jungwi", "firstlieutenant"].includes(key)) return 175_000;
  if (["sowi", "secondlieutenant"].includes(key)) return 175_000;
  if (["jungsa", "staffsergeant"].includes(key)) return 175_000;
  if (["hasa", "sergeant"].includes(key)) return 165_000;

  // fallback: columnKey를 못 받는 경우의 단순 추정
  const g = clampGrade(gradeGuess);
  switch (g) {
    case 1:
      return 750_000; // 준장 상당 추정
    case 2:
      return 650_000; // 대령 상당 추정
    case 3:
      return 500_000; // 중령 상당 추정
    case 4:
      return 400_000; // 소령 상당 추정
    case 5:
      return 250_000; // 대위 상당 추정
    case 6:
      return 200_000; // 준위 상당 추정
    case 7:
      return 185_000; // 원사 상당 추정
    case 8:
      return 180_000; // 상사 상당 추정
    case 9:
    default:
      return 175_000; // 중위/소위/중사 상당 추정
  }
}

export function getPositionBaseMonthly(
  category: PositionCategory,
  gradeGuess: number,
  columnKey?: string
): number {
  if (category === "MILITARY") {
    return getPositionBaseMonthlyMilitary(gradeGuess, columnKey);
  }
  return getPositionBaseMonthlyNonMilitary(gradeGuess);
}

/**
 * 일반직 감액(비고 6)
 * - 1~3급: 200,000
 * - 4~5급: 140,000
 * - 6~7급: 130,000
 * - 8~9급: 표 직접 명시 없음 → 0
 */
export function getPositionReductionMonthlyGeneral(
  gradeGuess: number
): number {
  const g = clampGrade(gradeGuess);
  if (g <= 3) return 200_000;
  if (g <= 5) return 140_000;
  if (g <= 7) return 130_000;
  return 0;
}

/**
 * 군인 감액(비고 6)
 * - 소장/준장/대령: 200,000
 * - 중령/소령/대위: 140,000
 * - 준위/원사/상사: 130,000
 * - 그 외: 0
 */
export function getPositionReductionMonthlyMilitary(
  gradeGuess: number,
  columnKey?: string
): number {
  const key = normalizeKey(columnKey);

  if (["sojang", "junjang", "daeryeong", "colonel"].includes(key)) {
    return 200_000;
  }
  if (["jungryeong", "lieutenantcolonel", "soryeong", "major", "daewi", "captain"].includes(key)) {
    return 140_000;
  }
  if (["junwi", "warrantofficer", "wonsa", "mastersergeant", "sangsa", "sergeantfirstclass"].includes(key)) {
    return 130_000;
  }
  if (["jungwi", "firstlieutenant", "sowi", "secondlieutenant", "jungsa", "staffsergeant", "hasa", "sergeant"].includes(key)) {
    return 0;
  }

  // fallback
  const g = clampGrade(gradeGuess);
  if (g <= 2) return 200_000;
  if (g <= 5) return 140_000;
  if (g <= 8) return 130_000;
  return 0;
}

/**
 * 경찰·소방 감액(비고 6)
 * - 치안정감/치안감/경무관, 소방정감/소방감/소방준감: 200,000
 * - 총경/경정, 소방정/소방령: 140,000
 * - 경감/경위/경사, 소방경/소방위/소방장: 130,000
 * - 경장/순경, 소방교/소방사: 0
 */
export function getPositionReductionMonthlyPoliceFire(
  gradeGuess: number
): number {
  const g = clampGrade(gradeGuess);
  if (g <= 3) return 200_000;
  if (g <= 5) return 140_000;
  if (g <= 7) return 130_000;
  return 0;
}

/**
 * 교육공무원 감액(비고 6)
 * - 1~3급 상당/고위직: 200,000
 * - 4~5급 상당/교감 등: 140,000
 * - 장학사/교육연구사: 130,000
 * - 그 외: 0
 */
export function getPositionReductionMonthlyEdu(
  gradeGuess: number
): number {
  const g = clampGrade(gradeGuess);
  if (g <= 3) return 200_000;
  if (g <= 5) return 140_000;
  if (g <= 7) return 130_000;
  return 0;
}

export function getPositionReductionMonthly(
  category: PositionCategory,
  gradeGuess: number,
  columnKey?: string
): number {
  switch (category) {
    case "MILITARY":
      return getPositionReductionMonthlyMilitary(gradeGuess, columnKey);
    case "POLICE_FIRE":
      return getPositionReductionMonthlyPoliceFire(gradeGuess);
    case "EDU":
      return getPositionReductionMonthlyEdu(gradeGuess);
    case "GENERAL":
    default:
      return getPositionReductionMonthlyGeneral(gradeGuess);
  }
}

/**
 * 최종 직급보조비(월)
 */
export function calcPositionAllowanceMonthly(
  args: PositionAllowanceArgs
): number {
  const {
    series,
    gradeGuess,
    columnKey,
    hasOfficialCar = false,
    hasOverseasAllowance = false,
    reductionExempt = false,
    disabled = false,
  } = args;

  if (disabled) return 0;

  const category = resolvePositionCategory(series);

  const base = getPositionBaseMonthly(category, gradeGuess, columnKey);

  const shouldReduce =
    !reductionExempt && (hasOfficialCar || hasOverseasAllowance);

  const reduction = shouldReduce
    ? getPositionReductionMonthly(category, gradeGuess, columnKey)
    : 0;

  return Math.max(0, base - reduction);
}