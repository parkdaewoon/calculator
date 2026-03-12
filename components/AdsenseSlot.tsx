"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  height?: number;
};

export default function AdsenseSlot({ slot, height = 90 }: Props) {
  const adRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = adRef.current;
    if (!el) return;

    // 개발환경(localhost)에서는 광고 초기화 막기
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return;
    }

    // 이미 초기화된 광고면 다시 push 하지 않음
    if (el.getAttribute("data-adsbygoogle-status")) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Adsense push error:", err);
    }
  }, []);

  return (
    <ins
      ref={adRef as React.RefObject<HTMLModElement>}
      className="adsbygoogle"
      style={{ display: "block", height }}
      data-ad-client="ca-pub-7723637407359078"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}