import type { PayTableId } from "@/lib/payTables";

export type Opt = { value: string; label: string };

export type SeriesKey = PayTableId;
export type MoneyMode = "auto" | "manual";

export type SalaryInputs = {
  series: SeriesKey;
  columnKey: string;
  step: number;
  yearsOfService: number;

  family_spouse: number;
  family_children: number;
  family_dependents: number;

  allow_pwu_mode: MoneyMode;
  allow_pwu_manual: number;

  allow_long_service_bonus_mode: MoneyMode;
  allow_long_service_bonus_manual: number;

  allow_long_service_add_mode: MoneyMode;
  allow_long_service_add_manual: number;

  allow_performance_manual: number;

  allow_family_mode: MoneyMode;
  allow_family_manual: number;

  allow_child_edu_manual: number;
  allow_housing_manual: number;
  allow_parental_leave_manual: number;

  allow_remote_area_type: "NONE" | "GA" | "NA" | "DA" | "RA";
  allow_remote_area_add_manual: number;

  allow_risk_mode: MoneyMode;
  allow_risk_manual: number;

  risk_type: "NONE" | "A" | "B" | "C" | "OTHER";
  risk_other_manual: number;

  allow_special_task_mode: MoneyMode;
  allow_special_task_manual: number;

  allow_substitute_mode: MoneyMode;
  allow_substitute_manual: number;

  allow_military_law_mode: MoneyMode;
  allow_military_law_manual: number;

  overtime_hours: number;
  night_hours: number;
  holiday_days: number;

  allow_overtime_mode: MoneyMode;
  allow_overtime_manual: number;

  allow_night_mode: MoneyMode;
  allow_night_manual: number;

  allow_holiday_mode: MoneyMode;
  allow_holiday_manual: number;

  allow_management_mode: MoneyMode;
  allow_management_manual: number;

  allow_meal_mode: MoneyMode;
  allow_meal_manual: number;

  allow_position_mode: MoneyMode;
  allow_position_manual: number;

  allow_holiday_bonus_mode: MoneyMode;
  allow_holiday_bonus_manual: number;

  allow_leave_comp_mode: MoneyMode;
  allow_leave_comp_manual: number;

  allow_other_manual: number;
  leave_comp_days: number;

  bosuMonthly_mode: MoneyMode;
  bosuMonthly_manual: number;

  standardMonthly_mode: MoneyMode;
  standardMonthly_manual: number;

  employment: number;

  incomeTax_mode: MoneyMode;
  incomeTax_manual: number;
  localTax_mode: MoneyMode;
  localTax_manual: number;
  taxFreeMonthly_manual: number;
  otherDeduction: number;
  management_excluded: boolean;
};

export type SalaryHistoryItem = {
  id: string;
  savedAt: number;
  label: string;
  inputs: SalaryInputs;
};

export type SalaryBreakdown = {
  basePay: number;

  allow_pwu: number;
  allow_long_service_bonus: number;
  allow_long_service_add: number;
  allow_performance: number;

  allow_family: number;
  allow_child_edu: number;
  allow_housing: number;
  allow_parental_leave: number;

  allow_remote_area: number;

  allow_risk: number;
  allow_special_task: number;
  allow_substitute: number;
  allow_military_law: number;

  allow_overtime: number;
  allow_night: number;
  allow_holiday: number;
  allow_management: number;

  allow_meal: number;
  allow_position: number;
  allow_holiday_bonus: number;
  allow_leave_comp: number;

  pension: number;
  health: number;
  care: number;
  employment: number;
  incomeTax: number;
  localTax: number;
  otherDeduction: number;
};

export type SalaryResult = {
  breakdown: SalaryBreakdown;
  allowanceTotal: number;
  deductionTotal: number;
  gross: number;
  net: number;
  _debug?: {
    bosuMonthlyAuto: number;
    standardMonthlyAuto: number;
  };
};