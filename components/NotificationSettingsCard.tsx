"use client";

import { useEffect, useState } from "react";
import { getOrCreateDeviceUserId } from "@/lib/storage/deviceUserId";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Props = {
  userId: string;
};

export default function NotificationSettingsCard({ userId }: Props) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [salaryEnabled, setSalaryEnabled] = useState(true);
  const [shiftEnabled, setShiftEnabled] = useState(true);
  const [leaveEnabled, setLeaveEnabled] = useState(true);
  const [noticeEnabled, setNoticeEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/push/settings?userId=${encodeURIComponent(userId)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const s = json?.data;

      if (s) {
        setPushEnabled(!!s.push_enabled);
        setSalaryEnabled(!!s.salary_enabled);
        setShiftEnabled(!!s.shift_enabled);
        setLeaveEnabled(!!s.leave_enabled);
        setNoticeEnabled(!!s.notice_enabled);
      }
    })();
  }, [userId]);

  async function getRegistration() {
    let reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
    await navigator.serviceWorker.ready;
    return reg;
  }

  async function subscribePush() {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      throw new Error(`알림 권한 필요: ${perm}`);
    }

    const reg = await getRegistration();

    const res = await fetch("/api/push/public-key", { cache: "no-store" });
    const { key } = await res.json();

    if (!key) {
      throw new Error("VAPID 공개키 없음");
    }

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
    }

    const saveRes = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        subscription: sub,
        deviceLabel: "PWA",
      }),
    });

    if (!saveRes.ok) {
      throw new Error("구독 저장 실패");
    }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  }

  async function updateSettings(next: Partial<Record<string, boolean>>) {
    await fetch("/api/push/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        push_enabled: pushEnabled,
        salary_enabled: salaryEnabled,
        shift_enabled: shiftEnabled,
        leave_enabled: leaveEnabled,
        notice_enabled: noticeEnabled,
        ...next,
      }),
    });
  }

  async function onTogglePush(next: boolean) {
    try {
      setLoading(true);

      if (next) {
        await subscribePush();
      } else {
        await unsubscribePush();
      }

      setPushEnabled(next);
      await updateSettings({ push_enabled: next });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold text-neutral-900">알림 설정</div>

      <div className="mt-4 space-y-3 text-sm">
        <ToggleRow
          label="푸시 알림 받기"
          checked={pushEnabled}
          disabled={loading}
          onChange={async (v) => onTogglePush(v)}
        />

        <ToggleRow
          label="월급일 전날 알림"
          checked={salaryEnabled}
          disabled={!pushEnabled}
          onChange={async (v) => {
            setSalaryEnabled(v);
            await updateSettings({ salary_enabled: v });
          }}
        />

        <ToggleRow
          label="당직·야간근무 전날 알림"
          checked={shiftEnabled}
          disabled={!pushEnabled}
          onChange={async (v) => {
            setShiftEnabled(v);
            await updateSettings({ shift_enabled: v });
          }}
        />

        <ToggleRow
          label="연가 종료 전날 알림"
          checked={leaveEnabled}
          disabled={!pushEnabled}
          onChange={async (v) => {
            setLeaveEnabled(v);
            await updateSettings({ leave_enabled: v });
          }}
        />

        <ToggleRow
          label="공지사항 알림"
          checked={noticeEnabled}
          disabled={!pushEnabled}
          onChange={async (v) => {
            setNoticeEnabled(v);
            await updateSettings({ notice_enabled: v });
          }}
        />
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void | Promise<void>;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 rounded-full transition",
          checked ? "bg-neutral-900" : "bg-neutral-300",
          disabled ? "opacity-50" : "",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </label>
  );
}