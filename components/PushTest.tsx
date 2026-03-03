"use client";

import React, { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
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
};

export default function PushTest() {
  const [status, setStatus] = useState<Status>({
    permission:
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
    hasSW: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    hasPush: typeof window !== "undefined" && "PushManager" in window,
    isSecure:
      typeof window !== "undefined" ? window.isSecureContext : false,
    hasSubscription: false,
  });

  async function refreshStatus(note?: string) {
    try {
      const permission =
        typeof Notification === "undefined"
          ? "unsupported"
          : Notification.permission;

      const hasSW =
        typeof navigator !== "undefined" && "serviceWorker" in navigator;
      const hasPush = typeof window !== "undefined" && "PushManager" in window;
      const isSecure =
        typeof window !== "undefined" ? window.isSecureContext : false;

      let hasSubscription = false;
      let endpoint: string | undefined;

      if (hasSW) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg && hasPush) {
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
    // 첫 진입 때 현재 상태 표시
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
        alert("Push 미지원 (iOS면 홈화면 추가로 실행 중인지 확인)");
        return;
      }
      if (!window.isSecureContext) {
        alert("HTTPS가 필요해 (보안 컨텍스트 아님)");
        return;
      }

      // ✅ 권한 요청: iOS는 반드시 '클릭 이벤트'에서 실행돼야 팝업이 뜸
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert(`알림 권한이 필요해 (현재: ${perm})`);
        await refreshStatus("enablePush:permission-not-granted");
        return;
      }

      // SW 등록
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // VAPID key 가져오기
      const res = await fetch("/api/push/public-key", { cache: "no-store" });
      const data = await res.json();
      const key = data?.key as string | undefined;
      if (!key) throw new Error("VAPID_PUBLIC_KEY 없음 (/api/push/public-key)");

      // 혹시 이미 구독이 있으면 재사용
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }));

      // 서버에 저장(테스트)
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      alert("구독 완료! 이제 테스트 발송 해보자");
      await refreshStatus("enablePush:done");
    } catch (e: any) {
      const msg = e?.message || String(e);
      alert(`구독 실패: ${msg}`);
      setStatus((p) => ({ ...p, lastError: msg, lastAction: "enablePush:error" }));
    }
  }

  async function sendTest() {
    try {
      await refreshStatus("sendTest:precheck");

      const reg = await navigator.serviceWorker.ready;
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

      alert("테스트 발송 완료(푸시 확인해봐)");
      await refreshStatus("sendTest:done");
    } catch (e: any) {
      const msg = e?.message || String(e);
      alert(msg);
      setStatus((p) => ({ ...p, lastError: msg, lastAction: "sendTest:error" }));
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
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
      setStatus((p) => ({ ...p, lastError: msg, lastAction: "unsubscribe:error" }));
    }
  }

  const permLabel =
    status.permission === "unsupported" ? "unsupported" : status.permission;

  return (
    <div className="space-y-3">
      {/* 상태 표시 */}
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

          <div className="text-neutral-500">subscription</div>
          <div className="font-medium">
            {status.hasSubscription ? "YES" : "NO"}
          </div>
        </div>

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

      {/* 액션 버튼 */}
      <div className="space-y-2">
        <button
          onClick={enablePush}
          className="w-full rounded-xl bg-black px-4 py-2 text-white"
        >
          푸시 알림 켜기(구독)
        </button>

        <button
          onClick={sendTest}
          className="w-full rounded-xl border px-4 py-2"
        >
          테스트 푸시 보내기
        </button>

        <button
          onClick={unsubscribe}
          className="w-full rounded-xl border px-4 py-2 text-neutral-600"
        >
          구독 해제(리셋)
        </button>
      </div>

      {/* iOS 힌트 */}
      <div className="rounded-2xl bg-neutral-50 p-3 text-[13px] text-neutral-600">
        iPhone이면: <b>사파리 → 공유 → 홈 화면에 추가</b>로 설치한 아이콘으로 실행한
        뒤 “구독”을 눌러야 권한 팝업이 떠요.
      </div>
    </div>
  );
}