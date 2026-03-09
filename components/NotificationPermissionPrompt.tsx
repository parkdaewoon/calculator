"use client";

import { useEffect, useState } from "react";
import {
  fetchPushEnabled,
  isInstalledPwa,
  subscribeCalendarPush,
} from "@/lib/push/client";
import usePushUserId from "@/lib/hooks/usePushUserId";

const PROMPTED_KEY = "calendar_notification_prompted_v1";

export default function NotificationPermissionPrompt() {
  const userId = usePushUserId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    void (async () => {
      try {
        const prompted =
          typeof window !== "undefined" &&
          window.localStorage.getItem(PROMPTED_KEY) === "1";

        if (prompted) return;
        if (!isInstalledPwa()) return;

        const enabled = await fetchPushEnabled(userId);
        if (enabled) return;

        setOpen(true);
      } catch (e) {
        console.error("notification prompt init failed", e);
      }
    })();
  }, [userId]);

  function closeAndRemember() {
    setOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROMPTED_KEY, "1");
    }
  }

  async function onAllow() {
    if (!userId || loading) return;

    try {
      setLoading(true);
      await subscribeCalendarPush(userId);
      closeAndRemember();
    } catch (e) {
      console.error("subscribeCalendarPush failed", e);
      alert("알림 허용 설정에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="text-base font-semibold text-neutral-900">
          캘린더 알림 설정
        </div>

        <p className="mt-2 text-sm text-neutral-600">
          앱을 실행할 때 일정 알림을 받을 수 있도록 지금 설정할까요?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeAndRemember}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700"
          >
            나중에
          </button>

          <button
            type="button"
            onClick={() => void onAllow()}
            disabled={loading}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            알림 허용
          </button>
        </div>
      </div>
    </div>
  );
}