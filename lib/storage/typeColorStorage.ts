// lib/storage/typeColorStorage.ts

import { DEFAULT_TYPE_COLORS, type TypeColorMap, type TypeKey } from "@/lib/calendar/typeColors";

const KEY = "event_type_colors_v1";

function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v);
}

export function loadTypeColors(): TypeColorMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_TYPE_COLORS;

    const obj = JSON.parse(raw) as unknown;

    const cleaned: TypeColorMap = { ...DEFAULT_TYPE_COLORS };

    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        // 키는 "WORK|..." 또는 "DUTY|..." 형태만 허용 (느슨하게 체크)
        if ((k.startsWith("WORK|") || k.startsWith("DUTY|")) && isHexColor(v)) {
          cleaned[k as TypeKey] = v;
        }
      }
    }

    return cleaned;
  } catch {
    return DEFAULT_TYPE_COLORS;
  }
}

export function saveTypeColors(map: TypeColorMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}