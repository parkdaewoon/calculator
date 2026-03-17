"use client";

import { useEffect, useState } from "react";
import {
  fetchPushEnabled,
  isInstalledPwa,
  subscribeCalendarPush,
  unsubscribeCalendarPush,
} from "@/lib/push/client";
import usePushUserId from "@/lib/hooks/usePushUserId";
import {
  DEFAULT_SHIFT_REMINDER_RULES,
  buildShiftReminderRulesEnabled,
  fetchShiftReminderRules,
  saveShiftReminderRules,
} from "@/lib/push/reminderSettings";

export default function NotificationSettingsCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const userId = usePushUserId();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
    console.log("[push-ui] toggle start", { next, userId });

    if (next) {
      const result = await subscribeCalendarPush(userId);
      console.log("[push-ui] subscribe result", result);
    } else {
      const result = await unsubscribeCalendarPush(userId);
      console.log("[push-ui] unsubscribe result", result);
    }

    const enabled = await fetchPushEnabled(userId);
    console.log("[push-ui] fetchPushEnabled after toggle", enabled);
    setPushEnabled(enabled);
  } catch (e) {
    console.error("[push-ui] toggle failed", e);
    alert(e instanceof Error ? e.message : "알림 설정 실패");
    setPushEnabled(prev);
  } finally {
    setLoading(false);
  }
}

  if (!userId) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-neutral-900">
            캘린더 알림 설정
          </div>
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