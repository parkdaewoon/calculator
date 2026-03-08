export function calcLongTermCare(healthInsurance: number): number {
  const v = Number.isFinite(healthInsurance) ? healthInsurance : 0;
  const raw = v * 0.1314047;
  return Math.max(0, Math.floor(raw / 10) * 10);
}