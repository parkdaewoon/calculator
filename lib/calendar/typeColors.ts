// lib/calendar/typeColors.ts

export type MainType = "WORK" | "DUTY" | "SALARY" | "BONUS" | "ETC";

export const COLOR_PRESETS = [
  "#0F172A",
  "#334155",
  "#64748B",
  "#94A3B8",
  "#CBD5E1",

  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#F43F5E",

  "#FCA5A5",
  "#FDBA74",
  "#FDE68A",
  "#BEF264",
  "#86EFAC",
  "#6EE7B7",
  "#67E8F9",
  "#7DD3FC",
  "#93C5FD",
  "#A5B4FC",
  "#C4B5FD",
  "#D8B4FE",
  "#FBCFE8",
  "#FDA4AF",
] as const;

export type TypeKey = string;
export type TypeColorMap = Record<string, string>;

export const DEFAULT_TYPE_COLORS: TypeColorMap = {
  "WORK|미팅": "#3B82F6",
  "WORK|회의": "#6366F1",
  "WORK|교육": "#10B981",
  "WORK|회식": "#F59E0B",

  "DUTY|연가": "#22C55E",
  "DUTY|병가": "#EF4444",
  "DUTY|공가": "#06B6D4",

  "SALARY|월급": "#F43F5E",
  "BONUS|보너스": "#A855F7",
  "ETC|기타": "#64748B",
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