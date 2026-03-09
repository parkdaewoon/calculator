import type { BaseProfile } from "@/lib/domain/profile/types";
import { PAY_TABLES, type PayTableId } from "@/lib/payTables";
import {
  PROFILE_DRAFT_KEY,
  PROFILE_HISTORY_KEY,
  PROFILE_HISTORY_MAX,
} from "./keys";

export type ProfileHistoryItem = {
  id: string;
  savedAt: number;
  label: string;
  profile: BaseProfile;
};

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function makeProfileSnapshotLabel(profile: BaseProfile) {
  const series = (profile.currentSeries ?? profile.series) as PayTableId;
  const columnKey = profile.currentColumnKey ?? profile.columnKey;
  const step = profile.currentStep ?? profile.step;

  const seriesTitle = PAY_TABLES[series]?.title ?? series;
  const columnLabel =
    PAY_TABLES[series]?.columns?.find((c) => c.key === columnKey)?.label ??
    columnKey ??
    "";

  return `${seriesTitle} ${columnLabel} ${step}호봉`.trim();
}

export function loadProfileDraft(): BaseProfile | null {
  if (typeof window === "undefined") return null;
  return safeParseJSON<BaseProfile>(localStorage.getItem(PROFILE_DRAFT_KEY));
}

export function saveProfileDraft(p: BaseProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(p));
}

export function loadProfileHistory(): ProfileHistoryItem[] {
  if (typeof window === "undefined") return [];
  return (
    safeParseJSON<ProfileHistoryItem[]>(
      localStorage.getItem(PROFILE_HISTORY_KEY)
    ) ?? []
  );
}

export function saveProfileHistory(list: ProfileHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_HISTORY_KEY, JSON.stringify(list));
}

export function addProfileSnapshot(label: string, profile: BaseProfile) {
  const now = Date.now();

  const finalLabel =
    label?.trim() || makeProfileSnapshotLabel(profile);

  const item: ProfileHistoryItem = {
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    savedAt: now,
    label: finalLabel,
    profile,
  };

  const prev = loadProfileHistory();
  const next = [item, ...prev].slice(0, PROFILE_HISTORY_MAX);
  saveProfileHistory(next);
  return next;
}

export function addProfileSnapshotFromProfile(profile: BaseProfile) {
  return addProfileSnapshot("", profile);
}

export function deleteProfileSnapshot(id: string) {
  const prev = loadProfileHistory();
  const next = prev.filter((x) => x.id !== id);
  saveProfileHistory(next);
  return next;
}

export function clearProfileHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_HISTORY_KEY);
}