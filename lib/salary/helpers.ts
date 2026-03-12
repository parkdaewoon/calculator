import { PAY_TABLES, type PayTableId } from "@/lib/payTables";
import type { MoneyMode, SalaryInputs, SeriesKey } from "./types";

export function sum(...nums: number[]) {
  let total = 0;
  for (const n of nums) total += Number.isFinite(n) ? n : 0;
  return total;
}

export function pick(mode: MoneyMode, autoValue: number, manualValue: number) {
  return mode === "auto" ? autoValue : manualValue;
}

export function getFirstColumnKey(series: SeriesKey) {
  return PAY_TABLES[series]?.columns?.[0]?.key ?? "";
}

export function getSafeColumnKey(series: SeriesKey, columnKey: string) {
  const t = PAY_TABLES[series];
  const first = t?.columns?.[0]?.key ?? "";

  if (!t || !first) return columnKey || first;
  return t.columns.some((c) => c.key === columnKey) ? columnKey : first;
}

export function columnKeyToGradeGuess(
  series: SeriesKey,
  columnKey: string
): number {
  const label =
    PAY_TABLES[series]?.columns?.find((c) => c.key === columnKey)?.label ?? "";

  const m1 = String(columnKey).match(/\d+/);
  if (m1) {
    const n = Number(m1[0]);
    if (Number.isFinite(n) && n >= 1 && n <= 9) return n;
  }

  const m2 = label.match(/([1-9])\s*급/);
  if (m2) return Number(m2[1]);

  return 9;
}

export function makeInitialInputs(
  series: SeriesKey = "general" as PayTableId
): SalaryInputs {
  return {
    series,
    columnKey: getFirstColumnKey(series) || "g9",
    step: 1,
    yearsOfService: 1,

    family_spouse: 0,
    family_children: 0,
    family_dependents: 0,

    allow_pwu_mode: "manual",
    allow_pwu_manual: 0,

    allow_long_service_bonus_mode: "manual",
    allow_long_service_bonus_manual: 0,

    allow_long_service_add_mode: "manual",
    allow_long_service_add_manual: 0,

    allow_performance_manual: 0,

    allow_family_mode: "manual",
    allow_family_manual: 0,

    allow_child_edu_manual: 0,
    allow_housing_manual: 0,
    allow_parental_leave_manual: 0,

    allow_remote_area_type: "NONE",
    allow_remote_area_add_manual: 0,

    allow_risk_mode: "auto",
    allow_risk_manual: 0,
    risk_type: "NONE",
    risk_other_manual: 0,

    allow_special_task_mode: "manual",
    allow_special_task_manual: 0,

    allow_substitute_mode: "manual",
    allow_substitute_manual: 0,

    allow_military_law_mode: "manual",
    allow_military_law_manual: 0,

    overtime_hours: 0,
    night_hours: 0,
    holiday_days: 0,

    allow_overtime_mode: "auto",
    allow_overtime_manual: 0,

    allow_night_mode: "auto",
    allow_night_manual: 0,

    allow_holiday_mode: "auto",
    allow_holiday_manual: 0,

    allow_management_mode: "auto",
    allow_management_manual: 0,

    allow_meal_mode: "auto",
    allow_meal_manual: 0,

    allow_position_mode: "auto",
    allow_position_manual: 0,

    allow_holiday_bonus_mode: "manual",
    allow_holiday_bonus_manual: 0,

    allow_leave_comp_mode: "manual",
    allow_leave_comp_manual: 0,

    allow_other_manual: 0,
    leave_comp_days: 0,

    bosuMonthly_mode: "manual",
    bosuMonthly_manual: 0,

    standardMonthly_mode: "manual",
    standardMonthly_manual: 0,

    employment: 0,
    incomeTax_mode: "auto",
    incomeTax_manual: 0,
    localTax_mode: "auto",
    localTax_manual: 0,
    taxFreeMonthly_manual: 0,
    otherDeduction: 0,

    management_excluded: false,
  };
}