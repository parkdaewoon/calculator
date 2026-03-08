"use client";

import { useEffect, useState } from "react";
import {
  ensureDeviceUserId,
  fetchPushEnabled,
  isInstalledPwa,
  subscribeCalendarPush,
  unsubscribeCalendarPush,
} from "@/lib/push/client";

export default function NotificationSettingsCard({ compact = false }: { compact?: boolean }) {
  const [userId, setUserId] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = ensureDeviceUserId();
    setUserId(id);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.active?.postMessage({ type: "SET_USER_ID", userId: id });
        })
        .catch((e) => {
          console.error("service worker ready failed", e);
        });

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "REQUEST_USER_ID") {
          navigator.serviceWorker.controller?.postMessage({
            type: "SET_USER_ID",
            userId: id,
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    void (async () => {
      try {
        const enabled = await fetchPushEnabled(userId);
        setPushEnabled(enabled);
      } catch (e) {
        console.error("fetchPushEnabled failed", e);
      }
    })();
  }, [userId]);

  async function onToggle(next: boolean) {
    if (!userId || loading) return;

    const prev = pushEnabled;
    setPushEnabled(next);
    setLoading(true);

    try {
      if (next) {
        if (!isInstalledPwa()) {
          throw new Error("홈 화면에 추가한 앱에서만 푸시가 동작해요.");
        }

        await subscribeCalendarPush(userId);
      } else {
        await unsubscribeCalendarPush(userId);
      }
    } catch (e) {
      console.error("notification toggle failed", e);
      setPushEnabled(prev);
      alert(next ? "알림 권한/구독 설정에 실패했어요." : "알림 해제에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  if (!userId) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-neutral-900">캘린더 알림 설정</div>
          <div className="text-xs text-neutral-500">일정 시작 전 푸시 알림</div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void onToggle(!pushEnabled)}
          className={[
            "relative h-7 w-12 rounded-full transition",
            pushEnabled ? "bg-neutral-900" : "bg-neutral-300",
            loading ? "opacity-50" : "",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white transition",
              pushEnabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold text-neutral-900">캘린더 알림</div>
      <div className="mt-2 text-xs text-neutral-500">
        홈 화면에 추가한 앱에서만 푸시가 동작해요.
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">푸시 알림 받기</span>

        <button
          type="button"
          disabled={loading}
          onClick={() => void onToggle(!pushEnabled)}
          className={[
            "relative h-7 w-12 rounded-full transition",
            pushEnabled ? "bg-neutral-900" : "bg-neutral-300",
            loading ? "opacity-50" : "",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white transition",
              pushEnabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    </section>
  );
}