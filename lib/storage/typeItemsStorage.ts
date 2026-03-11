const STORAGE_KEY = "calendar:type-items:v1";

export type StoredTypeItems = {
  workSubs: string[];
  dutySubs: string[];
  etcSubs: string[];
};

const DEFAULT_VALUE: StoredTypeItems = {
  workSubs: ["미팅", "회의", "교육", "회식"],
  dutySubs: ["연가", "병가", "공가"],
  etcSubs: ["기타"],
};

function uniqClean(arr: unknown, fallback: string[]) {
  if (!Array.isArray(arr)) return fallback;
  const cleaned = arr
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

export function loadTypeItems(): StoredTypeItems {
  if (typeof window === "undefined") return DEFAULT_VALUE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VALUE;

    const parsed = JSON.parse(raw);

    return {
      workSubs: uniqClean(parsed?.workSubs, DEFAULT_VALUE.workSubs),
      dutySubs: uniqClean(parsed?.dutySubs, DEFAULT_VALUE.dutySubs),
      etcSubs: uniqClean(parsed?.etcSubs, DEFAULT_VALUE.etcSubs),
    };
  } catch {
    return DEFAULT_VALUE;
  }
}

export function saveTypeItems(value: StoredTypeItems) {
  if (typeof window === "undefined") return;

  try {
    const safe: StoredTypeItems = {
      workSubs: uniqClean(value?.workSubs, DEFAULT_VALUE.workSubs),
      dutySubs: uniqClean(value?.dutySubs, DEFAULT_VALUE.dutySubs),
      etcSubs: uniqClean(value?.etcSubs, DEFAULT_VALUE.etcSubs),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {}
}