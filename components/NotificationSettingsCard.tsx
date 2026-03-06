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

export default function NotificationSettingsCard() {
  const [userId, setUserId] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserId(getOrCreateDeviceUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const res = await fetch(`/api/push/settings?userId=${encodeURIComponent(userId)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const s = json?.data;

      if (s) {
        setPushEnabled(!!s.push_enabled);
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

    if (!key) throw new Error("VAPID 공개키 없음");

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
      body: JSON.stringify({ userId, subscription: sub, deviceLabel: "PWA" }),
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

  async function updateSettings(next: boolean) {
    await fetch("/api/push/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        push_enabled: next,
      }),
    });
  }

  async function onToggle(next: boolean) {
    try {
      setLoading(true);

      if (next) {
        await subscribePush();
      } else {
        await unsubscribePush();
      }

      setPushEnabled(next);
      await updateSettings(next);
    } finally {
      setLoading(false);
    }
  }

  if (!userId) return null;

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold text-neutral-900">일정 알림</div>
      <div className="mt-2 text-xs text-neutral-500">
        아이폰은 홈 화면에 추가한 앱에서만 푸시가 동작해요.
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">푸시 알림 받기</span>

        <button
          type="button"
          disabled={loading}
          onClick={() => onToggle(!pushEnabled)}
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