let CURRENT_USER_ID = null;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SET_USER_ID" && data.userId) {
    CURRENT_USER_ID = data.userId;
  }
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || "공무원 노트";

  const options = {
    body: data.body || "알림이 도착했어요.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "gongmuwon-note-push",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);

        if (clientUrl.origin === self.location.origin) {
          if ("focus" in client) {
            client.postMessage({ type: "OPEN_URL", url });
            return client.focus();
          }
        }
      }

      return clients.openWindow(url);
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const userId = await getStoredUserId();
        if (!userId) {
          console.warn("pushsubscriptionchange: missing userId");
          return;
        }

        const res = await fetch("/api/push/public-key", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        const key = json?.key;

        if (!res.ok || !key) {
          throw new Error("Missing public key");
        }

        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            subscription: newSub.toJSON(),
            deviceLabel: "PWA",
          }),
        });
      } catch (e) {
        console.error("pushsubscriptionchange failed", e);
      }
    })()
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getStoredUserId() {
  if (CURRENT_USER_ID) return CURRENT_USER_ID;

  const allClients = await clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  for (const client of allClients) {
    client.postMessage({ type: "REQUEST_USER_ID" });
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  return CURRENT_USER_ID;
}