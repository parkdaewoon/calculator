import { getPay } from "@/lib/payTables";
import {
  calcPwuAllowance,
  calcRegularBonus,
  calcRegularAdd,
  calcFamilyAllowance,
  calcOvertimeAllowance,
  calcNightAllowance,
  calcHolidayAllowance,
  calcMealAllowance,
} from "@/lib/allowances/calculator";
import { calcPositionAllowanceMonthly } from "@/lib/allowances/calculator/expense/position";
import { calcHolidayBonusOnce } from "@/lib/allowances/calculator/expense/holiday";
import { calcLeaveCompensation } from "@/lib/allowances/calculator/expense/leave";
import { calcManagementAllowanceMonthly } from "@/lib/allowances/calculator/overtime/management";
import {
  calcMonthlySalaryForDeductions,
  calcHealthInsurance,
  calcLongTermCare,
  calcPensionContribution,
} from "@/lib/allowances/calculator/deductions";
import { calcTaxesMonthly } from "@/lib/allowances/calculator/tax";

import { columnKeyToGradeGuess, pick, sum } from "./helpers";
import type { SalaryInputs, SalaryResult } from "./types";

export function calcSalary(inputs: SalaryInputs): SalaryResult {
  const basePay = getBasePay(inputs);
  const gradeGuess = columnKeyToGradeGuess(inputs.series, inputs.columnKey);

  const auto_pwu = getAutoPwu(inputs, basePay, gradeGuess);
  const auto_long_bonus = getAutoLongServiceBonus(inputs, basePay);
  const auto_long_add = getAutoLongServiceAdd(inputs);

  const auto_family = getAutoFamilyAllowance(inputs);

  const auto_risk = getAutoRisk(inputs);
  const auto_special_task = getAutoSpecialTask(inputs);
  const auto_substitute = getAutoSubstitute(inputs);
  const auto_military_law = getAutoMilitaryLaw(inputs);

  const hasExtraWorkInput =
    (inputs.overtime_hours ?? 0) > 0 ||
    (inputs.night_hours ?? 0) > 0 ||
    (inputs.holiday_days ?? 0) > 0;

  const effectiveManagementExcluded =
    !!inputs.management_excluded || hasExtraWorkInput;

  const auto_management = getAutoManagement(
    {
      ...inputs,
      management_excluded: effectiveManagementExcluded,
    },
    basePay
  );

  const isGrade4OrAbove = gradeGuess <= 4;
  const willGetManagement = auto_management > 0;
  const blockExtra = isGrade4OrAbove || willGetManagement;

  const auto_overtime = blockExtra ? 0 : getAutoOvertime(inputs);
  const auto_night = blockExtra ? 0 : getAutoNight(inputs);
  const auto_holiday = blockExtra ? 0 : getAutoHoliday(inputs);

  const auto_meal = getAutoMeal();
  const auto_position = getAutoPosition(gradeGuess);
  const auto_holiday_bonus = getAutoHolidayBonus(inputs, basePay);
  const auto_leave_comp = getAutoLeaveComp(inputs, basePay);

  const allow_pwu = pick(
    inputs.allow_pwu_mode,
    auto_pwu,
    inputs.allow_pwu_manual
  );
  const allow_long_service_bonus = pick(
    inputs.allow_long_service_bonus_mode,
    auto_long_bonus,
    inputs.allow_long_service_bonus_manual
  );
  const allow_long_service_add = pick(
    inputs.allow_long_service_add_mode,
    auto_long_add,
    inputs.allow_long_service_add_manual
  );

  const allow_performance = inputs.allow_performance_manual;

  const allow_family = pick(
    inputs.allow_family_mode,
    auto_family,
    inputs.allow_family_manual
  );
  const allow_child_edu = inputs.allow_child_edu_manual;
  const allow_housing = inputs.allow_housing_manual;
  const allow_parental_leave = inputs.allow_parental_leave_manual;

  const remoteBase =
    inputs.allow_remote_area_type === "GA"
      ? 60_000
      : inputs.allow_remote_area_type === "NA"
      ? 50_000
      : inputs.allow_remote_area_type === "DA"
      ? 40_000
      : inputs.allow_remote_area_type === "RA"
      ? 30_000
      : 0;

  const allow_remote_area =
    remoteBase + (inputs.allow_remote_area_add_manual ?? 0);

  const allow_risk = pick(
    inputs.allow_risk_mode,
    auto_risk,
    inputs.allow_risk_manual
  );
  const allow_special_task = pick(
    inputs.allow_special_task_mode,
    auto_special_task,
    inputs.allow_special_task_manual
  );
  const allow_substitute = pick(
    inputs.allow_substitute_mode,
    auto_substitute,
    inputs.allow_substitute_manual
  );
  const allow_military_law = pick(
    inputs.allow_military_law_mode,
    auto_military_law,
    inputs.allow_military_law_manual
  );

  const allow_overtime = pick(
    inputs.allow_overtime_mode,
    auto_overtime,
    inputs.allow_overtime_manual
  );
  const allow_night = pick(
    inputs.allow_night_mode,
    auto_night,
    inputs.allow_night_manual
  );
  const allow_holiday = pick(
    inputs.allow_holiday_mode,
    auto_holiday,
    inputs.allow_holiday_manual
  );
  const allow_management = pick(
    inputs.allow_management_mode,
    auto_management,
    inputs.allow_management_manual
  );

  const allow_meal = pick(
    inputs.allow_meal_mode,
    auto_meal,
    inputs.allow_meal_manual
  );
  const allow_position = pick(
    inputs.allow_position_mode,
    auto_position,
    inputs.allow_position_manual
  );
  const allow_holiday_bonus = pick(
    inputs.allow_holiday_bonus_mode,
    auto_holiday_bonus,
    inputs.allow_holiday_bonus_manual
  );
  const allow_leave_comp = pick(
    inputs.allow_leave_comp_mode,
    auto_leave_comp,
    inputs.allow_leave_comp_manual
  );

  const allowanceTotal = sum(
    allow_pwu,
    allow_long_service_bonus,
    allow_long_service_add,
    allow_performance,

    allow_family,
    allow_child_edu,
    allow_housing,
    allow_parental_leave,

    allow_remote_area,

    allow_risk,
    allow_special_task,
    allow_substitute,
    allow_military_law,

    allow_overtime,
    allow_night,
    allow_holiday,
    allow_management,

    allow_meal,
    allow_position,
    allow_holiday_bonus,
    allow_leave_comp,

    inputs.allow_other_manual
  );

  const bosuMonthlyAuto = calcMonthlySalaryForDeductions({
    basePay,

    allow_pwu,
    allow_family,
    allow_child_edu,
    allow_housing,
    allow_parental_leave,

    allow_remote_area,
    allow_risk,
    allow_special_task,
    allow_substitute,
    allow_military_law,

    allow_management,
    allow_meal,
    allow_position,
  });

  const bosuMonthlyPicked = pick(
    inputs.bosuMonthly_mode,
    bosuMonthlyAuto,
    inputs.bosuMonthly_manual
  );

  const standardMonthlyAuto = Math.trunc(bosuMonthlyPicked * 1.1);

  const standardMonthlyPicked = pick(
    inputs.standardMonthly_mode,
    standardMonthlyAuto,
    inputs.standardMonthly_manual
  );

  const auto_pension = calcPensionContribution(standardMonthlyPicked);
  const auto_health = calcHealthInsurance(bosuMonthlyPicked);
  const auto_care = calcLongTermCare(auto_health);

  const pension = auto_pension;
  const health = auto_health;
  const care = auto_care;

  const gross = basePay + allowanceTotal;

  const monthlyTaxFree = Math.max(
    0,
    Math.trunc(allow_meal + (inputs.taxFreeMonthly_manual || 0))
  );

  const jeonggeunOnceForTax = Math.max(0, Math.trunc(auto_long_bonus));
  const holidayOnceForTax = Math.max(0, Math.trunc(auto_holiday_bonus));

  const bonusProration = Math.floor(
    (jeonggeunOnceForTax + holidayOnceForTax) / 6
  );

  const jeonggeunPaidThisMonth = Math.max(
    0,
    Math.trunc(allow_long_service_bonus)
  );
  const holidayPaidThisMonth = Math.max(0, Math.trunc(allow_holiday_bonus));

  const monthlyGrossPay = Math.max(
    0,
    Math.trunc(
      gross - jeonggeunPaidThisMonth - holidayPaidThisMonth + bonusProration
    )
  );

  const tax = calcTaxesMonthly({
    monthlyGrossPay,
    monthlyTaxFree,
    monthlyScholarship: 0,
    family: {
      spouse: inputs.family_spouse,
      children: inputs.family_children,
      dependents: inputs.family_dependents,
    },
  });

  const auto_incomeTax = tax.incomeTax;
  const auto_localTax = tax.localIncomeTax;

  const incomeTax = pick(
    inputs.incomeTax_mode,
    auto_incomeTax,
    inputs.incomeTax_manual
  );
  const localTax = pick(
    inputs.localTax_mode,
    auto_localTax,
    inputs.localTax_manual
  );

  const deductionTotal = sum(
    pension,
    health,
    care,
    inputs.employment,
    incomeTax,
    localTax,
    inputs.otherDeduction
  );

  const net = gross - deductionTotal;

  return {
    breakdown: {
      basePay,

      allow_pwu,
      allow_long_service_bonus,
      allow_long_service_add,
      allow_performance,

      allow_family,
      allow_child_edu,
      allow_housing,
      allow_parental_leave,

      allow_remote_area,

      allow_risk,
      allow_special_task,
      allow_substitute,
      allow_military_law,

      allow_overtime,
      allow_night,
      allow_holiday,
      allow_management,

      allow_meal,
      allow_position,
      allow_holiday_bonus,
      allow_leave_comp,

      pension,
      health,
      care,
      employment: inputs.employment,
      incomeTax,
      localTax,
      otherDeduction: inputs.otherDeduction,
    },
    allowanceTotal,
    deductionTotal,
    gross,
    net,
    _debug: {
      bosuMonthlyAuto,
      standardMonthlyAuto,
    },
  };
}

export function getBasePay(inputs: SalaryInputs): number {
  const v = getPay(inputs.series, inputs.columnKey, inputs.step);
  return typeof v === "number" ? v : 0;
}

export function getAutoPwu(
  inputs: SalaryInputs,
  basePay: number,
  gradeGuess: number
) {
  return calcPwuAllowance({
    series: inputs.series,
    grade: gradeGuess,
    step: inputs.step,
    basePay,
  });
}

export function getAutoLongServiceBonus(
  inputs: SalaryInputs,
  basePay: number
) {
  return calcRegularBonus(basePay, inputs.yearsOfService);
}

export function getAutoLongServiceAdd(inputs: SalaryInputs) {
  const isMilitary = inputs.series === "military";
  return calcRegularAdd(inputs.yearsOfService, "MONTHLY", isMilitary);
}

export function getAutoFamilyAllowance(inputs: SalaryInputs) {
  return calcFamilyAllowance({
    spouse: inputs.family_spouse,
    children: inputs.family_children,
    dependents: inputs.family_dependents,
  });
}

export function getAutoRisk(inputs: SalaryInputs) {
  if (inputs.risk_type === "A") return 60_000;
  if (inputs.risk_type === "B") return 50_000;
  if (inputs.risk_type === "C") return 40_000;
  if (inputs.risk_type === "OTHER") return inputs.risk_other_manual ?? 0;
  return 0;
}

export function getAutoSpecialTask(_: SalaryInputs) {
  return 0;
}

export function getAutoSubstitute(_: SalaryInputs) {
  return 0;
}

export function getAutoMilitaryLaw(_: SalaryInputs) {
  return 0;
}

export function getAutoOvertime(inputs: SalaryInputs) {
  return calcOvertimeAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    hours: inputs.overtime_hours,
    kind: "OVERTIME",
  });
}

export function getAutoNight(inputs: SalaryInputs) {
  return calcNightAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    hours: inputs.night_hours,
  });
}

export function getAutoHoliday(inputs: SalaryInputs) {
  return calcHolidayAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    days: inputs.holiday_days,
  });
}

export function getAutoManagement(inputs: SalaryInputs, basePay: number) {
  const gradeGuess = columnKeyToGradeGuess(inputs.series, inputs.columnKey);

  return calcManagementAllowanceMonthly({
    series: inputs.series,
    monthlyBasePay: basePay,
    gradeGuess,
    excluded: inputs.management_excluded,
  }).amount;
}

export function getAutoMeal() {
  return calcMealAllowance();
}

export function getAutoPosition(gradeGuess: number) {
  return calcPositionAllowanceMonthly({
    series: "general" as any,
    gradeGuess,
  });
}

export function getAutoHolidayBonus(_: SalaryInputs, basePay: number) {
  return calcHolidayBonusOnce({ basePay });
}

export function getAutoLeaveComp(inputs: SalaryInputs, basePay: number) {
  return calcLeaveCompensation({
    basePay,
    days: inputs.leave_comp_days ?? 0,
  });
}