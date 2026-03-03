"use client";

import { useLayoutEffect } from "react";

export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const body = document.body;

    // iOS 포함 안정적으로 배경 스크롤 차단
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      // 복구 + 원래 스크롤 위치로
      const y = Math.abs(parseInt(body.style.top || "0", 10)) || scrollY;

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";

      window.scrollTo(0, y);
    };
  }, [locked]);
}