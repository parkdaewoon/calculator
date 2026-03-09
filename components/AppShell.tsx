"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import SideMenu from "@/components/SideMenu";
import NotificationPermissionPrompt from "@/components/NotificationPermissionPrompt";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const mainPx = pathname === "/calendar" ? "px-0" : "px-5";

  return (
    <div className="min-h-dvh bg-[#f6f7fb] text-neutral-900">
      <div className="relative mx-auto min-h-dvh max-w-[430px] overflow-hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <TopBar onMenu={() => setMenuOpen(true)} />

        <main className={`${mainPx} pb-24 pt-0`}>
          {children}
        </main>

        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <NotificationPermissionPrompt />
      </div>
    </div>
  );
}