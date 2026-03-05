// lib/calendar/typeColors.ts

export type MainType = "WORK" | "DUTY";

// lib/calendar/typeColors.ts

export const COLOR_PRESETS = [
  // 기존 있던 것들 + 아래 추가 (더 많이 넣음)
  "#0F172A", // slate-900
  "#334155", // slate-700
  "#64748B", // slate-500
  "#94A3B8", // slate-400
  "#CBD5E1", // slate-300

  "#EF4444", // red-500
  "#F97316", // orange-500
  "#F59E0B", // amber-500
  "#EAB308", // yellow-500
  "#84CC16", // lime-500
  "#22C55E", // green-500
  "#10B981", // emerald-500
  "#06B6D4", // cyan-500
  "#0EA5E9", // sky-500
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#A855F7", // purple-500
  "#EC4899", // pink-500
  "#F43F5E", // rose-500

  // 파스텔/부드러운 톤
  "#FCA5A5", // red-300
  "#FDBA74", // orange-300
  "#FDE68A", // yellow-200
  "#BEF264", // lime-300
  "#86EFAC", // green-300
  "#6EE7B7", // emerald-300
  "#67E8F9", // cyan-300
  "#7DD3FC", // sky-300
  "#93C5FD", // blue-300
  "#A5B4FC", // indigo-300
  "#C4B5FD", // violet-300
  "#D8B4FE", // purple-300
  "#FBCFE8", // pink-200
  "#FDA4AF", // rose-300
] as const;

// ✅ 핵심: 동적 추가 항목을 위해 string 허용
export type TypeKey = string;

// ✅ 핵심: 동적 키-색상 맵
export type TypeColorMap = Record<string, string>;

// 기본값(원래 쓰던 기본값 유지하면 됨)
export const DEFAULT_TYPE_COLORS: TypeColorMap = {
  "WORK|미팅": "#3B82F6",
  "WORK|회의": "#6366F1",
  "WORK|교육": "#10B981",
  "WORK|회식": "#F59E0B",

  "DUTY|연가": "#22C55E",
  "DUTY|병가": "#EF4444",
  "DUTY|공가": "#06B6D4",
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