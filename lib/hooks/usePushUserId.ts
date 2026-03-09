"use client";

import { useEffect, useState } from "react";
import { ensureDeviceUserId } from "@/lib/push/client";

export default function usePushUserId() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const id = ensureDeviceUserId();
    setUserId(id);

    if (!("serviceWorker" in navigator)) return;

    const sendUserIdToServiceWorker = () => {
      navigator.serviceWorker.controller?.postMessage({
        type: "SET_USER_ID",
        userId: id,
      });
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "REQUEST_USER_ID") {
        sendUserIdToServiceWorker();
      }
    };

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.active?.postMessage({
          type: "SET_USER_ID",
          userId: id,
        });
      })
      .catch((e) => {
        console.error("service worker ready failed", e);
      });

    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return userId;
}