export function calcHealthInsurance(bosuMonthly: number): number {
  const v = Number.isFinite(bosuMonthly) ? bosuMonthly : 0;
  const raw = v * 0.03595;
  return Math.max(0, Math.floor(raw / 10) * 10);
}