// lib/calendar/typeColors.ts

export type MainType = "WORK" | "DUTY";
export type TypeKey = `${MainType}|${string}`;

export type TypeColorMap = Record<TypeKey, string>;

// ✅ 여러 색 옵션(팔레트)
export const COLOR_PRESETS: readonly string[] = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
  "#111827",
] as const;

// ✅ 기본 타입별 색
export const DEFAULT_TYPE_COLORS: TypeColorMap = {
  "WORK|미팅": "#2563eb",
  "WORK|회의": "#0ea5e9",
  "WORK|교육": "#10b981",
  "WORK|회식": "#f59e0b",

  "DUTY|연가": "#8b5cf6",
  "DUTY|병가": "#ef4444",
  "DUTY|공가": "#64748b",
};

export function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(0,0,0,${alpha})`;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}