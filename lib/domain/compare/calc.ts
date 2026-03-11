import type { BaseProfile } from "@/lib/domain/profile/types";
import { calcPension } from "@/lib/domain/pension/calc";
import { calcSeverance } from "@/lib/domain/severance/calc";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";

export type CompareYearBucket = {
  label: string;
  yearsAfterPensionStart: number;
  cumulativePension: number;
  totalReceipt: number;
  receiptVsContributionRatio: number;
};

export type CompareCalcResult = {
  totalContribution: number;
  monthlyContribution: number;

  estimatedMonthlyPension: number;
  estimatedSeverance: number;

  incomeReplacementRate: number;
  incomeReplacementRateVsAverage: number;

  pensionCurrentMonthlyBase: number;
  pensionAverageMonthlyBase: number;

  buckets: CompareYearBucket[];
};

export function calcCompare(profile: BaseProfile): CompareCalcResult {
  const pension = calcPension(profile);

  const pensionable =
    calcEstimatedCurrentPensionableMonthly(profile);

  const finalPensionableMonthly =
    pensionable.estimatedCurrentPensionableMonthly ?? 0;

  // ✅ 퇴직수당 계산기와 같은 기준소득월액을 강제로 넣어줌
  const severance = calcSeverance(profile, finalPensionableMonthly);

  const averageMonthlyBase =
    Number(profile.calculatedAverageMonthlyBase ?? 0) > 0
      ? Number(profile.calculatedAverageMonthlyBase)
      : Number(pension.averageMonthlyBase ?? 0);

  const recognizedYears =
    Number(profile.calculatedPensionRecognizedYears ?? 0) > 0
      ? Number(profile.calculatedPensionRecognizedYears)
      : 0;

  const monthlyContribution = Math.round(averageMonthlyBase * 0.09);
  const totalContribution = Math.round(
    monthlyContribution * recognizedYears * 12
  );

  const estimatedMonthlyPension = Math.round(
    Number(pension.monthlyPensionNet ?? pension.monthlyPensionGross ?? 0)
  );

  // ✅ 이제 퇴직수당 계산기와 같은 값으로 맞아야 함
  const estimatedSeverance = Math.round(
    Number(severance.estimatedNet ?? severance.gross ?? 0)
  );

  const incomeReplacementRate =
    finalPensionableMonthly > 0
      ? (estimatedMonthlyPension / finalPensionableMonthly) * 100
      : 0;

  const incomeReplacementRateVsAverage =
    averageMonthlyBase > 0
      ? (estimatedMonthlyPension / averageMonthlyBase) * 100
      : 0;

  const buckets: CompareYearBucket[] = [10, 20, 30].map((years) => {
    const cumulativePension = estimatedMonthlyPension * 12 * years;
    const totalReceipt = cumulativePension + estimatedSeverance;
    const receiptVsContributionRatio =
      totalContribution > 0 ? (totalReceipt / totalContribution) * 100 : 0;

    return {
      label: `${years}년 총수령액`,
      yearsAfterPensionStart: years,
      cumulativePension,
      totalReceipt,
      receiptVsContributionRatio,
    };
  });

  return {
    totalContribution,
    monthlyContribution,
    estimatedMonthlyPension,
    estimatedSeverance,
    incomeReplacementRate,
    incomeReplacementRateVsAverage,
    pensionCurrentMonthlyBase: finalPensionableMonthly,
    pensionAverageMonthlyBase: averageMonthlyBase,
    buckets,
  };
}