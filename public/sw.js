let CURRENT_USER_ID = null;
const DB_NAME = "nokobridge-push-db";
const DB_VERSION = 1;
const STORE_NAME = "kv";

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
    event.waitUntil(setStoredUserId(data.userId));
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let data = {};

      try {
        data = event.data ? event.data.json() : {};
      } catch (e) {
        console.error("push payload parse failed", e);
        data = {};
      }

      const title = data.title || "공무원 노트";

      const options = {
        body: data.body || "알림이 도착했어요.",
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        tag: data.tag || undefined,
        data: {
          url: data.url || "/",
          sentAt: data.sentAt || Date.now(),
        },
        timestamp: data.sentAt || Date.now(),
      };

      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientList) {
        const clientUrl = new URL(client.url);

        if (clientUrl.origin === self.location.origin) {
          if ("navigate" in client) {
            try {
              await client.navigate(url);
            } catch (e) {
              console.error("client.navigate failed", e);
            }
          }

          if ("focus" in client) {
            return client.focus();
          }
        }
      }

      return clients.openWindow(url);
    })()
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

        const res = await fetch("/api/push/public-key", {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        const key = json?.key;

        if (!res.ok || !key) {
          throw new Error("Missing public key");
        }

        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });

        const saveRes = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": userId,
          },
          body: JSON.stringify({
            subscription: newSub.toJSON(),
            deviceLabel: "PWA",
          }),
        });

        const saveJson = await saveRes.json().catch(() => null);

        if (!saveRes.ok || !saveJson?.ok) {
          throw new Error(saveJson?.error || "push subscription resave failed");
        }
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

  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }

  return out;
}

async function getStoredUserId() {
  if (CURRENT_USER_ID) return CURRENT_USER_ID;

  const fromDb = await readKv("userId");
  if (fromDb) {
    CURRENT_USER_ID = fromDb;
    return fromDb;
  }

  const allClients = await clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  for (const client of allClients) {
    client.postMessage({ type: "REQUEST_USER_ID" });
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (CURRENT_USER_ID) {
    await setStoredUserId(CURRENT_USER_ID);
  }

  return CURRENT_USER_ID;
}

async function setStoredUserId(userId) {
  await writeKv("userId", userId);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readKv(key) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function writeKv(key, value) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}