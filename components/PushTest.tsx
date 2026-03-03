"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushTest() {
  async function enablePush() {
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker 미지원");
      return;
    }
    if (!("PushManager" in window)) {
      alert("Push 미지원");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      alert("알림 권한이 필요해");
      return;
    }

    // SW 등록
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // VAPID key 가져오기
    const res = await fetch("/api/push/public-key");
    const { key } = await res.json();
    if (!key) throw new Error("VAPID_PUBLIC_KEY 없음");

    // 구독 생성
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    // 서버에 저장(테스트)
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });

    alert("구독 완료! 이제 테스트 발송 해보자");
  }

  async function sendTest() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) {
    alert("먼저 구독부터 해줘");
    return;
  }

  await fetch("/api/push/send-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub }),
  });

  alert("테스트 발송 완료(푸시 확인해봐)");
}

  return (
    <div className="space-y-2">
      <button onClick={enablePush} className="rounded-xl bg-black px-4 py-2 text-white">
        푸시 알림 켜기(구독)
      </button>
      <button onClick={sendTest} className="rounded-xl border px-4 py-2">
        테스트 푸시 보내기
      </button>
    </div>
  );
}