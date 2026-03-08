"use client";

import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  minDurationMs?: number;
};

function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as any)?.standalone === true;
  const mql =
    window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  return iosStandalone || mql;
}

export default function SplashScreen({ children, minDurationMs = 900 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);

    const pwa = isStandalonePWA();
    setShouldShow(pwa);

    if (!pwa) {
      setReady(true); // PWA 아니면 바로 children
      return;
    }

    // PWA면 스플래시 최소 노출 보장
    const t = setTimeout(() => setReady(true), minDurationMs);
    return () => clearTimeout(t);
  }, [minDurationMs]);

  // ✅ 서버/초기 하이드레이션 순간엔 아무것도 안 보여줘서 “히어로 먼저 뜨는 현상” 차단
  if (!mounted) return null;

  if (shouldShow && !ready) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-center">
          <img
            src="/icon-192.png"
            alt="공무원 노트"
            className="h-16 w-16"
            draggable={false}
          />
          <div className="mt-4 text-[18px] font-semibold text-neutral-900">
            공무원 노트
          </div>
          <div className="mt-1 text-[12px] font-semibold tracking-[0.24em] text-neutral-400">
            NOTE KOREAN OFFICER
          </div>
          <div className="mt-5 flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}