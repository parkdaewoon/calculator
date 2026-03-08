export function calcPensionContribution(standardMonthly: number): number {
  const v = Number.isFinite(standardMonthly) ? standardMonthly : 0;
  const raw = v * 0.09;
  return Math.max(0, Math.floor(raw / 10) * 10);
}