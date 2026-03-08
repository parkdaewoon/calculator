"use client";

import { getOrCreateDeviceUserId } from "@/lib/storage/deviceUserId";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function isInstalledPwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function ensureDeviceUserId() {
  return getOrCreateDeviceUserId();
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("이 기기에서는 service worker를 지원하지 않아요.");
  }

  let reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) {
    reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }

  await navigator.serviceWorker.ready;
  return reg;
}

async function syncUserIdToServiceWorker(userId: string) {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "SET_USER_ID", userId });

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SET_USER_ID",
        userId,
      });
    }
  } catch (e) {
    console.error("syncUserIdToServiceWorker failed", e);
  }
}

export async function fetchPushEnabled(userId: string) {
  const res = await fetch(`/api/push/settings?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "푸시 설정 조회 실패");
  }

  return !!json?.data?.push_enabled;
}

export async function subscribeCalendarPush(userId: string) {
  if (typeof window === "undefined") {
    throw new Error("브라우저 환경이 아니에요.");
  }

  if (!("Notification" in window)) {
    throw new Error("이 기기에서는 알림을 지원하지 않아요.");
  }

  if (!("PushManager" in window)) {
    throw new Error("이 기기에서는 푸시를 지원하지 않아요.");
  }

  if (!isInstalledPwa()) {
    throw new Error("아이폰은 홈 화면에 추가한 앱에서만 푸시가 동작해요.");
  }

  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    throw new Error(`알림 권한 필요: ${perm}`);
  }

  const reg = await getRegistration();
  await syncUserIdToServiceWorker(userId);

  const res = await fetch("/api/push/public-key", {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  const key = json?.key;

  if (!res.ok || !key) {
    throw new Error("VAPID 공개키 없음");
  }

  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }

  const subscriptionJson = sub.toJSON();

  const saveRes = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      subscription: subscriptionJson,
      deviceLabel: "PWA",
    }),
  });

  const saveJson = await saveRes.json().catch(() => null);

  if (!saveRes.ok || !saveJson?.ok) {
    throw new Error(saveJson?.error || `구독 저장 실패: ${saveRes.status}`);
  }

  const settingsRes = await fetch("/api/push/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, push_enabled: true }),
  });

  const settingsJson = await settingsRes.json().catch(() => null);

  if (!settingsRes.ok || !settingsJson?.ok) {
    throw new Error(settingsJson?.error || `푸시 설정 저장 실패: ${settingsRes.status}`);
  }

  await syncUserIdToServiceWorker(userId);

  return true;
}

export async function unsubscribeCalendarPush(userId: string) {
  if (!("serviceWorker" in navigator)) {
    throw new Error("service worker를 지원하지 않아요.");
  }

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();

  if (sub) {
    const unsubRes = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        endpoint: sub.endpoint,
      }),
    });

    const unsubJson = await unsubRes.json().catch(() => null);

    if (!unsubRes.ok || !unsubJson?.ok) {
      throw new Error(unsubJson?.error || `구독 해제 저장 실패: ${unsubRes.status}`);
    }

    try {
      await sub.unsubscribe();
    } catch (e) {
      console.error("browser unsubscribe failed", e);
    }
  }

  const settingsRes = await fetch("/api/push/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, push_enabled: false }),
  });

  const settingsJson = await settingsRes.json().catch(() => null);

  if (!settingsRes.ok || !settingsJson?.ok) {
    throw new Error(settingsJson?.error || `푸시 설정 저장 실패: ${settingsRes.status}`);
  }

  return true;
}