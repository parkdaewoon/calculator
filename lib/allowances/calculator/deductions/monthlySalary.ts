// lib/calculator/deductions/monthlySalary.ts

export type MonthlySalaryForDeductionsInput = {
  basePay: number;

  // ✅ 월 고정/정기성(사이트 규칙상 포함)
  allow_pwu?: number;
  allow_family?: number;
  allow_child_edu?: number;
  allow_housing?: number;
  allow_parental_leave?: number;

  allow_remote_area?: number;
  allow_risk?: number;
  allow_special_task?: number;
  allow_substitute?: number;
  allow_military_law?: number;

  allow_overtime?: number; // ❌ 제외(변동) - 받더라도 여기선 무시 가능
  allow_night?: number;    // ❌ 제외(변동)
  allow_holiday?: number;  // ❌ 제외(변동)

  allow_management?: number;

  allow_meal?: number;
  allow_position?: number;

  // ❌ 제외(일시/연단위)
  allow_long_service_bonus?: number;
  allow_long_service_add?: number;
  allow_performance?: number;
  allow_holiday_bonus?: number;
  allow_leave_comp?: number;

  // ❌ 기타(섞임) - 기본 제외
  allow_other?: number;
};

/**
 * ✅ 공제 계산용 "보수월액"(사이트 규칙)
 * - 월 고정/정기성 수당만 포함
 * - 연/반기/일시/변동성 수당은 제외
 */
export function calcMonthlySalaryForDeductions(
  v: MonthlySalaryForDeductionsInput
): number {
  const n = (x?: number) => (Number.isFinite(x) ? (x as number) : 0);

  const bosu =
    n(v.basePay) +
    n(v.allow_pwu) +
    n(v.allow_family) +
    n(v.allow_child_edu) +
    n(v.allow_housing) +
    n(v.allow_parental_leave) +
    n(v.allow_remote_area) +
    n(v.allow_risk) +
    n(v.allow_special_task) +
    n(v.allow_substitute) +
    n(v.allow_military_law) +
    n(v.allow_management) +
    n(v.allow_meal) +
    n(v.allow_position);

  return Math.max(0, Math.floor(bosu));
}