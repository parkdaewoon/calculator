import type { BaseProfile } from "./types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function makeDefaultProfile(): BaseProfile {
  const today = todayISO();
  return {
    version: 1,
    series: "general",
    columnKey: "g9",
    step: 1,
    startDate: today,
    retireDate: today,
    birthDate: today,

    startSeries: "general",
    startColumnKey: "g9",
    startStep: 1,

    currentSeries: "general",
    currentColumnKey: "g9",
    currentStep: 1,

    promotions: [],
    incomeMode: "auto",
    avgIncomeMonthly: 0,

    militaryServiceYears: 0,
    leaveOfAbsenceYears: 0,

    pensionableAutoFlags: {
      isPwuEligible: false,
      isManagementEligible: false,
      managementRate: 0.09,
      overridePositionAllowance: 0,
      extraPositionAllowance: 0,
    },

    pensionableMonthlyInputs: {
      specialArea: 0,
      specialDuty: 0,
      dangerousDuty: 0,
      taxableEtcIncluded: 0,
      averageReplacementMonthly: 0,
    },

    pensionableExcludedAnnualInputs: {
      performanceBonus: 0,
      jobPerformancePay: 0,
      performanceAnnualSalary: 0,
      bonus: 0,
      overtime: 0,
      night: 0,
      holiday: 0,
      leaveCompensation: 0,
    },
  };
}