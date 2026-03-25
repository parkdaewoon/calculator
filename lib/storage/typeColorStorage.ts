// lib/storage/typeColorStorage.ts

import { DEFAULT_TYPE_COLORS, type TypeColorMap } from "@/lib/calendar/typeColors";

const KEY = "event_type_colors_v1";
const EVT = "type-colors-updated";

function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v);
}

function isAllowedKey(k: string) {
  return (
    k.startsWith("WORK|") ||
    k.startsWith("DUTY|") ||
    k.startsWith("SALARY|") ||
    k.startsWith("BONUS|") ||
    k.startsWith("ETC|")
  );
}

export function loadTypeColors(): TypeColorMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_TYPE_COLORS };

    const obj = JSON.parse(raw) as unknown;
    const cleaned: TypeColorMap = { ...DEFAULT_TYPE_COLORS };

    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (isAllowedKey(k) && isHexColor(v)) cleaned[k] = v;
      }
    }

    return cleaned;
  } catch {
    return { ...DEFAULT_TYPE_COLORS };
  }
}

export function saveTypeColors(map: TypeColorMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map ?? {}));

    // ✅ 같은 탭에서도 MonthGrid가 갱신되도록 커스텀 이벤트 발생
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

// ✅ MonthGrid에서 import해서 쓸 이벤트 이름도 export 해두면 편함
export const TYPE_COLORS_UPDATED_EVENT = EVT;