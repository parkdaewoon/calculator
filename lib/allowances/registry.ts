import type { AllowanceDefinition, AllowanceId } from "./types";

import { bonusPwu } from "./definitions/bonus/pwu";
import { bonusRegular } from "./definitions/bonus/regular";
import { bonusPerformance } from "./definitions/bonus/performance";

import { familyAllowance } from "./definitions/family/family";
import { familyEducation } from "./definitions/family/education";
import { familyHousing } from "./definitions/family/housing";
import { familyChildcare } from "./definitions/family/childcare";

import { specialAreaRemote } from "./definitions/special-area/remote";

import { specialDutyRisk } from "./definitions/special-duty/risk";
import { specialDutySpecial } from "./definitions/special-duty/special";
import { specialDutySubstitute } from "./definitions/special-duty/substitute";
import { specialDutyLegal } from "./definitions/special-duty/legal";

import { overtimeAllowance } from "./definitions/overtime/overtime";
import { overtimeManagement } from "./definitions/overtime/management";

import { expenseMeal } from "./definitions/expense/meal";
import { expensePosition } from "./definitions/expense/position";
import { expenseHoliday } from "./definitions/expense/holiday";
import { expenseLeave } from "./definitions/expense/leave";

const REGISTRY: Record<AllowanceId, AllowanceDefinition> = {
  "bonus.pwu": bonusPwu,
  "bonus.regular": bonusRegular,
  "bonus.performance": bonusPerformance,

  "family.family": familyAllowance,
  "family.education": familyEducation,
  "family.housing": familyHousing,
  "family.childcare": familyChildcare,

  "special-area.remote": specialAreaRemote,

  "special-duty.risk": specialDutyRisk,
  "special-duty.special": specialDutySpecial,
  "special-duty.substitute": specialDutySubstitute,
  "special-duty.legal": specialDutyLegal,

  "overtime.overtime": overtimeAllowance,
  "overtime.management": overtimeManagement,

  "expense.meal": expenseMeal,
  "expense.position": expensePosition,
  "expense.holiday": expenseHoliday,
  "expense.leave": expenseLeave,
};

export function getAllowanceDefinition(id: AllowanceId): AllowanceDefinition | null {
  return REGISTRY[id] ?? null;
}