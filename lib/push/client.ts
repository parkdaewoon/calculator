"use client";

import { getOrCreateDeviceUserId } from "@/lib/storage/deviceUserId";

let CACHED_VAPID_KEY: string | null = null;

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

async function getPublicKey() {
  if (CACHED_VAPID_KEY) {
    console.log("[push] using cached vapid key");
    return CACHED_VAPID_KEY;
  }

  console.log("[push] fetching vapid public key...");
  const res = await fetch("/api/push/public-key", {
    method: "GET",
    cache: "force-cache",
  });

  const json = await res.json().catch(() => null);
  console.log("[push] public key response", { status: res.status, json });

  const key = json?.key;
  if (!res.ok || !key) {
    throw new Error(json?.error || "VAPID 공개키 없음");
  }

  CACHED_VAPID_KEY = key;
  return key;
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

  console.log("[push] checking existing service worker registration...");
  const existing = await navigator.serviceWorker.getRegistration();

  if (existing) {
    await navigator.serviceWorker.ready;
    console.log("[push] existing service worker ready", existing);
    return existing;
  }

  console.log("[push] registering service worker...");
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  console.log("[push] new service worker ready", reg);

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

    console.log("[push] synced userId to service worker", { userId });
  } catch (e) {
    console.error("[push] syncUserIdToServiceWorker failed", e);
  }
}

export async function fetchPushEnabled(userId: string) {
  const res = await fetch("/api/push/settings", {
    method: "GET",
    cache: "no-store",
    headers: {
      "x-device-id": userId,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "푸시 설정 조회 실패");
  }

  return !!json?.data?.push_enabled;
}

export async function subscribeCalendarPush(userId: string) {
  console.log("[push] subscribeCalendarPush start", {
    userId,
    permission: typeof Notification !== "undefined" ? Notification.permission : "unknown",
    standalone: typeof window !== "undefined" ? isInstalledPwa() : false,
    hasSW: typeof navigator !== "undefined" ? "serviceWorker" in navigator : false,
    hasPushManager: typeof window !== "undefined" ? "PushManager" in window : false,
  });

  if (typeof window === "undefined") {
    throw new Error("브라우저 환경이 아니에요.");
  }

  if (!("Notification" in window)) {
    throw new Error("이 기기에서는 알림을 지원하지 않아요.");
  }

  if (!("PushManager" in window)) {
    throw new Error("이 기기에서는 푸시를 지원하지 않아요.");
  }

  // 디버깅 끝날 때까지 이 가드 제거
  // if (!isInstalledPwa()) {
  //   throw new Error("홈 화면에 추가한 앱에서만 푸시가 동작해요.");
  // }

  let perm = Notification.permission;
  console.log("[push] current permission", perm);

  if (perm !== "granted") {
    perm = await Notification.requestPermission();
    console.log("[push] requested permission result", perm);
  }

  if (perm !== "granted") {
    throw new Error(`알림 권한 필요: ${perm}`);
  }

  const reg = await getRegistration();
  await syncUserIdToServiceWorker(userId);

  console.log("[push] checking existing subscription...");
  let sub = await reg.pushManager.getSubscription();
  console.log("[push] existing subscription", sub);

  if (!sub) {
    const key = await getPublicKey();
    console.log("[push] subscribing with vapid key...");

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    console.log("[push] new subscription created", sub);
  }

  const subscriptionJson = sub.toJSON();
  console.log("[push] subscription json", subscriptionJson);

  console.log("[push] POST /api/push/subscribe");
  const saveRes = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify({
      subscription: subscriptionJson,
      deviceLabel: "PWA",
    }),
  });

  const saveJson = await saveRes.json().catch(() => null);
  console.log("[push] subscribe save response", {
    status: saveRes.status,
    json: saveJson,
    userId,
  });

  if (!saveRes.ok || !saveJson?.ok) {
    throw new Error(saveJson?.error || `구독 저장 실패: ${saveRes.status}`);
  }

  console.log("[push] POST /api/push/settings");
  const settingsRes = await fetch("/api/push/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify({
      push_enabled: true,
      endpoint: sub.endpoint,
    }),
  });

  const settingsJson = await settingsRes.json().catch(() => null);
  console.log("[push] settings save response", {
    status: settingsRes.status,
    json: settingsJson,
    userId,
    endpoint: sub.endpoint,
  });

  if (!settingsRes.ok || !settingsJson?.ok) {
    throw new Error(settingsJson?.error || `푸시 설정 저장 실패: ${settingsRes.status}`);
  }

  await syncUserIdToServiceWorker(userId);

  console.log("[push] subscribeCalendarPush success");
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
      headers: {
        "Content-Type": "application/json",
        "x-device-id": userId,
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
      }),
    });

    const unsubJson = await unsubRes.json().catch(() => null);
    console.log("[push] unsubscribe response", {
      status: unsubRes.status,
      json: unsubJson,
      endpoint: sub.endpoint,
      userId,
    });

    if (!unsubRes.ok || !unsubJson?.ok) {
      throw new Error(unsubJson?.error || `구독 해제 저장 실패: ${unsubRes.status}`);
    }

    try {
      await sub.unsubscribe();
      console.log("[push] browser subscription removed");
    } catch (e) {
      console.error("[push] browser unsubscribe failed", e);
    }
  }

  const settingsRes = await fetch("/api/push/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify({
      push_enabled: false,
      endpoint: null,
    }),
  });

  const settingsJson = await settingsRes.json().catch(() => null);
  console.log("[push] disable settings response", {
    status: settingsRes.status,
    json: settingsJson,
    userId,
  });

  if (!settingsRes.ok || !settingsJson?.ok) {
    throw new Error(settingsJson?.error || `푸시 설정 저장 실패: ${settingsRes.status}`);
  }

  return true;
}