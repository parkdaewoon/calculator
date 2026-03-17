"use client";

import React, { useEffect, useState } from "react";
import PensionPageHeader from "@/components/pension/PensionPageHeader";
import AdsenseSlot from "@/components/AdsenseSlot";
import BasicInfoForm from "@/components/pension/basic/BasicInfoForm";
import BasicInfoHistoryModal from "@/components/pension/basic/BasicInfoHistoryModal";
import { useProfileDraft } from "@/lib/hooks/useProfileDraft";
import {
  addProfileSnapshot,
  deleteProfileSnapshot,
  loadProfileHistory,
  type ProfileHistoryItem,
} from "@/lib/services/storage/profileStorage";

export default function PensionBasicPageClient() {
  const { profile, setProfile, hydrated } = useProfileDraft();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ProfileHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadProfileHistory());
  }, []);

  if (!hydrated) {
    return <div className="p-4 text-sm text-neutral-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-5">
      <PensionPageHeader
        title="기본 정보"
        description="기본 정보를 저장하면, 퇴직수당/연금/비교 페이지에 자동 반영됩니다."
      />

      <BasicInfoForm
        profile={profile}
        onChange={setProfile}
        onOpenHistory={() => {
          setHistory(loadProfileHistory());
          setHistoryOpen(true);
        }}
      />

      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">
            기본정보 저장
          </div>

          <button
            type="button"
            onClick={() => {
              const ok = confirm("현재 기본정보를 저장하시겠습니까?");
              if (!ok) return;

              const next = addProfileSnapshot("", profile);
              setHistory(next);
              setSelectedId(next[0]?.id ?? null);

              alert("저장되었습니다.");
            }}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            저장하기
          </button>
        </div>

        <div className="mt-2 text-[11px] text-neutral-500">
          현재 계산된 입력값을 저장하고 이전 기록에서 다시 불러올 수 있습니다.
        </div>
      </section>

      <BasicInfoHistoryModal
        open={historyOpen}
        items={history}
        selectedId={selectedId}
        onClose={() => setHistoryOpen(false)}
        onPick={(item) => {
          setSelectedId(item.id);
          setProfile(item.profile);
          setHistoryOpen(false);
        }}
        onSelectOnly={(id) => setSelectedId(id)}
        onDeleteSelected={() => {
          if (!selectedId) {
            alert("삭제할 기록을 선택하세요.");
            return;
          }

          const ok = confirm("선택한 기록을 삭제할까요?");
          if (!ok) return;

          const next = deleteProfileSnapshot(selectedId);
          setHistory(next);
          setSelectedId(null);
        }}
      />

      <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot slot="8421356790" height={50} />
          </div>
        </div>
    </div>
    
  );
}