"use client";

import React, { useEffect, useState } from "react";
import AdsenseSlot from "@/components/AdsenseSlot";
import PensionMenuGrid from "@/components/pension/PensionMenuGrid";
import { type PensionTabKey } from "@/components/pension/tabs/PensionTabs";
import { useProfileDraft } from "@/lib/hooks/useProfileDraft";
import {
  addProfileSnapshot,
  deleteProfileSnapshot,
  loadProfileHistory,
  type ProfileHistoryItem,
} from "@/lib/services/storage/profileStorage";

import BasicInfoForm from "@/components/pension/basic/BasicInfoForm";
import BasicInfoHistoryModal from "@/components/pension/basic/BasicInfoHistoryModal";

import SeveranceStub from "@/components/pension/severance/SeveranceStub";
import PensionStub from "@/components/pension/pension/PensionStub";
import CompareStub from "@/components/pension/compare/CompareStub";

type Tab = "menu" | PensionTabKey;

export default function PensionPageClient() {
  const [tab, setTab] = useState<Tab>("menu");

  const { profile, setProfile, hydrated } = useProfileDraft();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ProfileHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadProfileHistory());
  }, []);

  const title =
    tab === "menu"
      ? "공무원 연금 알아보기"
      : tab === "basic"
      ? "기본 정보"
      : tab === "severance"
      ? "퇴직수당"
      : tab === "pension"
      ? "연금 계산"
      : "납부액·수령액 비교";

  if (!hydrated) {
    return <div className="p-4 text-sm text-neutral-500">불러오는 중...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight">
            {title}
            <br />
          </h1>

          {tab !== "menu" ? (
            <button
              type="button"
              onClick={() => setTab("menu")}
              className="shrink-0 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              전체 메뉴
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-neutral-500">
          {tab === "menu"
            ? "기본정보, 퇴직수당, 연금 계산, 납부·수령 비교 메뉴를 선택하세요."
            : "기본 정보를 저장하면, 퇴직수당/연금/비교 탭에서 자동 반영됩니다."}
        </p>
      </div>

      {tab === "menu" ? (
        <>
          <PensionMenuGrid
            onSelect={(next) => {
              setTab(next);
            }}
          />

          <section className="pt-2 pb-2">
            <div className="h-px bg-neutral-100" />
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
                <AdsenseSlot height={90} />
              </div>
            </div>
          </section>
        </>
      ) : null}

      {tab === "basic" ? (
        <>
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
        </>
      ) : null}

      {tab === "severance" ? <SeveranceStub profile={profile} /> : null}
      {tab === "pension" ? <PensionStub profile={profile} /> : null}
      {tab === "compare" ? <CompareStub profile={profile} /> : null}

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

      <div className="h-2" />
    </div>
  );
}