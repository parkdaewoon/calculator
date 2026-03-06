"use client";

import { useEffect, useState } from "react";
import {
  ensureDeviceUserId,
  fetchPushEnabled,
  isInstalledPwa,
  subscribeCalendarPush,
} from "@/lib/push/client";

const PROMPTED_KEY = "calendar_notification_prompted_v1";

export default function NotificationPermissionPrompt() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInstalledPwa()) return;

    const prompted = window.localStorage.getItem(PROMPTED_KEY) === "1";
    if (prompted) return;

    if (typeof Notification !== "undefined" && Notification.permission !== "default") return;

    const id = ensureDeviceUserId();
    setUserId(id);

    void (async () => {
      const enabled = await fetchPushEnabled(id);
      if (!enabled) setOpen(true);
    })();
  }, []);

  function closeAndRemember() {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROMPTED_KEY, "1");
    }
  }

  async function onAllow() {
    if (!userId) return;
    try {
      setLoading(true);
      await subscribeCalendarPush(userId);
      closeAndRemember();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="text-base font-semibold text-neutral-900">캘린더 알림 설정</div>
        <p className="mt-2 text-sm text-neutral-600">앱을 실행할 때 일정 알림을 받을 수 있도록 지금 설정할까요?</p>

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
