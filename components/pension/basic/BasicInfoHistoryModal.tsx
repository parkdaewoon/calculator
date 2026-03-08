"use client";

import React from "react";
import type { ProfileHistoryItem } from "@/lib/services/storage/profileStorage";
import { PROFILE_HISTORY_MAX } from "@/lib/services/storage/keys";

export default function BasicInfoHistoryModal({
  open,
  items,
  selectedId,
  onClose,
  onPick,
  onSelectOnly,
  onDeleteSelected,
}: {
  open: boolean;
  items: ProfileHistoryItem[];
  selectedId: string | null;
  onClose: () => void;
  onPick: (item: ProfileHistoryItem) => void;
  onSelectOnly: (id: string) => void;
  onDeleteSelected: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">저장 기록</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
              저장된 기록이 없습니다.
            </div>
          ) : (
            items.slice(0, PROFILE_HISTORY_MAX).map((h) => {
              const selected = selectedId === h.id;
              return (
                <div
                  key={h.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onPick(h)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPick(h);
                    }
                  }}
                  className={[
                    "w-full rounded-2xl border px-3 py-3 text-left transition cursor-pointer select-none",
                    selected
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900">
                        {h.label}
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {new Date(h.savedAt).toLocaleString("ko-KR")}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOnly(h.id);
                      }}
                      className={[
                        "mt-0.5 grid h-6 w-6 place-items-center rounded-full border text-[14px] font-black",
                        selected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 bg-white text-transparent",
                      ].join(" ")}
                      aria-label={selected ? "선택됨" : "선택하기"}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onDeleteSelected}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            선택 기록 삭제
          </button>
        </div>

        <div className="mt-3 text-[11px] text-neutral-400">
          * 기본정보는 자동으로 임시저장(draft)됩니다. 저장 버튼은 최대 5개 기록을 남깁니다.
        </div>
      </div>
    </div>
  );
}
