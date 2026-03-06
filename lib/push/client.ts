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

export async function fetchPushEnabled(userId: string) {
  const res = await fetch(`/api/push/settings?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  const json = await res.json();
  return !!json?.data?.push_enabled;
}

async function getRegistration() {
  let reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) {
    reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }
  await navigator.serviceWorker.ready;
  return reg;
}

export async function subscribeCalendarPush(userId: string) {
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

  await fetch("/api/push/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, push_enabled: true }),
  });
}

export async function unsubscribeCalendarPush(userId: string) {
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

  await fetch("/api/push/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, push_enabled: false }),
  });
}

export function ensureDeviceUserId() {
  return getOrCreateDeviceUserId();
}