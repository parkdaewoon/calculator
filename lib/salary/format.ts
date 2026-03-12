export function formatNumberInput(n: number) {
  if (!Number.isFinite(n)) return "";
  const v = Math.trunc(n);
  return v === 0 ? "" : v.toLocaleString("ko-KR");
}

export function clampInt(
  v: string,
  min: number,
  max: number,
  fallback: number = min
) {
  const cleaned = String(v).replace(/,/g, "").trim();

  if (cleaned === "") return fallback;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return fallback;

  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function formatWon(n: number) {
  const safe = Number.isFinite(n) ? Math.trunc(n) : 0;
  return `${safe.toLocaleString("ko-KR")}원`;
}

export function ymdLabel(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}