"use client";

import React, { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }

  return out;
}

type Status = {
  permission: NotificationPermission | "unsupported";
  hasSW: boolean;
  hasPush: boolean;
  isSecure: boolean;
  hasSubscription: boolean;
  endpoint?: string;
  lastError?: string;
  lastAction?: string;
  isStandalone?: boolean;
};

export default function PushTest() {
  const [status, setStatus] = useState<Status>({
    permission:
      typeof Notification === "undefined" ? "unsupported" : Notification.permission,
    hasSW: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    hasPush: typeof window !== "undefined" && "PushManager" in window,
    isSecure: typeof window !== "undefined" ? window.isSecureContext : false,
    isStandalone:
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)")?.matches ||
        // @ts-ignore
        window.navigator?.standalone === true),
    hasSubscription: false,
  });

  async function getRegistration() {
    let reg = await navigator.serviceWorker.getRegistration("/");

    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    await reg.update().catch(() => {});
    await navigator.serviceWorker.ready;

    return reg;
  }

  async function refreshStatus(note?: string) {
    try {
      const permission =
        typeof Notification === "undefined"
          ? "unsupported"
          : Notification.permission;

      const hasSW =
        typeof navigator !== "undefined" && "serviceWorker" in navigator;
      const hasPush =
        typeof window !== "undefined" && "PushManager" in window;
      const isSecure =
        typeof window !== "undefined" ? window.isSecureContext : false;
      const isStandalone =
        typeof window !== "undefined" &&
        (window.matchMedia?.("(display-mode: standalone)")?.matches ||
          // @ts-ignore
          window.navigator?.standalone === true);

      let hasSubscription = false;
      let endpoint: string | undefined;

      if (hasSW && hasPush) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          hasSubscription = !!sub;
          endpoint = sub?.endpoint;
        }
      }

      setStatus((p) => ({
        ...p,
        permission,
        hasSW,
        hasPush,
        isSecure,
        isStandalone,
        hasSubscription,
        endpoint,
        lastAction: note ?? p.lastAction,
        lastError: undefined,
      }));
    } catch (e: any) {
      setStatus((p) => ({
        ...p,
        lastError: e?.message || String(e),
        lastAction: note ?? p.lastAction,
      }));
    }
  }

  useEffect(() => {
    refreshStatus("init");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enablePush() {
    try {
      await refreshStatus("enablePush:precheck");

      if (!("serviceWorker" in navigator)) {
        alert("Service Worker 미지원");
        return;
      }

      if (!("PushManager" in window)) {
        alert("Push 미지원");
        return;
      }

      if (!window.isSecureContext) {
        alert("HTTPS 환경에서만 동작해");
        return;
      }

      const isStandalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        // @ts-ignore
        window.navigator?.standalone === true;

      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

      if (isIOS && !isStandalone) {
        alert("iPhone/iPad에서는 홈화면에 추가한 앱으로 실행해야 푸시가 됩니다.");
        await refreshStatus("enablePush:not-standalone");
        return;
      }

      const perm = await Notification.requestPermission();

      if (perm !== "granted") {
        alert(`알림 권한이 필요해 (현재: ${perm})`);
        await refreshStatus("enablePush:permission-not-granted");
        return;
      }

      const reg = await getRegistration();

      const res = await fetch("/api/push/public-key", {
        cache: "no-store",
      });

      const data = await res.json();
      const key = data?.key as string | undefined;

      if (!key) {
        throw new Error("VAPID_PUBLIC_KEY 없음");
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
        body: JSON.stringify(sub),
      });

      const saveText = await saveRes.text().catch(() => "");

      if (!saveRes.ok) {
        throw new Error(`구독 저장 실패: ${saveRes.status} ${saveText}`);
      }

      alert("구독 완료! 이제 테스트 푸시를 보내봐.");
      await refreshStatus("enablePush:done");
    } catch (e: any) {
      const msg = e?.message || String(e);
      alert(`구독 실패: ${msg}`);
      setStatus((p) => ({
        ...p,
        lastError: msg,
        lastAction: "enablePush:error",
      }));
    }
  }

  async function sendTest() {
    try {
      await refreshStatus("sendTest:precheck");

      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();

      if (!sub) {
        alert("먼저 구독부터 해줘");
        return;
      }

      const r = await fetch("/api/push/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });

      const txt = await r.text().catch(() => "");

      if (!r.ok) {
        throw new Error(`send-test 실패: ${r.status} ${txt}`);
      }

      alert("테스트 발송 완료. 알림을 확인해봐.");
      await refreshStatus("sendTest:done");
    } catch (e: any) {
      const msg = e?.message || String(e);
      alert(msg);
      setStatus((p) => ({
        ...p,
        lastError: msg,
        lastAction: "sendTest:error",
      }));
    }
  }

  async function unsubscribe() {
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();

      if (!sub) {
        alert("구독이 없어");
        await refreshStatus("unsubscribe:none");
        return;
      }

      await sub.unsubscribe();
      alert("구독 해제 완료");
      await refreshStatus("unsubscribe:done");
    } catch (e: any) {
      const msg = e?.message || String(e);
      alert(`구독 해제 실패: ${msg}`);
      setStatus((p) => ({
        ...p,
        lastError: msg,
        lastAction: "unsubscribe:error",
      }));
    }
  }

  const permLabel =
    status.permission === "unsupported" ? "unsupported" : status.permission;

  return (
    <div className="relative z-30 space-y-3 pointer-events-auto">
      <div className="rounded-2xl border bg-white p-3 text-sm">
        <div className="font-semibold">Push 상태</div>

        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
          <div className="text-neutral-500">permission</div>
          <div className="font-medium">{permLabel}</div>

          <div className="text-neutral-500">secure(HTTPS)</div>
          <div className="font-medium">{status.isSecure ? "YES" : "NO"}</div>

          <div className="text-neutral-500">serviceWorker</div>
          <div className="font-medium">{status.hasSW ? "YES" : "NO"}</div>

          <div className="text-neutral-500">PushManager</div>
          <div className="font-medium">{status.hasPush ? "YES" : "NO"}</div>

          <div className="text-neutral-500">standalone(PWA)</div>
          <div className="font-medium">{status.isStandalone ? "YES" : "NO"}</div>

          <div className="text-neutral-500">subscription</div>
          <div className="font-medium">{status.hasSubscription ? "YES" : "NO"}</div>
        </div>

        {status.permission === "denied" && (
          <div className="mt-3 rounded-xl bg-amber-50 p-2 text-[12px] text-amber-800">
            알림 권한이 차단되어 있어. 브라우저/기기 설정에서 허용으로 바꿔줘.
          </div>
        )}

        {status.endpoint && (
          <div className="mt-2 break-all text-[11px] text-neutral-500">
            endpoint: {status.endpoint}
          </div>
        )}

        {status.lastAction && (
          <div className="mt-2 text-[12px] text-neutral-600">
            last: {status.lastAction}
          </div>
        )}

        {status.lastError && (
          <div className="mt-2 rounded-xl bg-red-50 p-2 text-[12px] text-red-700">
            error: {status.lastError}
          </div>
        )}

        <button
          onClick={() => refreshStatus("manual-refresh")}
          className="mt-3 rounded-xl border px-3 py-2 text-[13px]"
        >
          상태 새로고침
        </button>
      </div>

      <button
  type="button"
  onClick={enablePush}
  className="relative z-30 pointer-events-auto w-full rounded-xl bg-black px-4 py-2 text-white"
>
  푸시 알림 켜기(구독)
</button>

<button
  type="button"
  onClick={sendTest}
  className="relative z-30 pointer-events-auto w-full rounded-xl border px-4 py-2"
>
  테스트 푸시 보내기
</button>

<button
  type="button"
  onClick={unsubscribe}
  className="relative z-30 pointer-events-auto w-full rounded-xl border px-4 py-2 text-neutral-600"
>
  구독 해제(리셋)
</button>

      <div className="rounded-2xl bg-neutral-50 p-3 text-[13px] text-neutral-600">
        iPhone이면 사파리에서 홈 화면에 추가한 뒤, 그 아이콘으로 실행해서 구독해야 해.
      </div>
    </div>
  );
}