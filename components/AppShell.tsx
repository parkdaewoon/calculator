"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import SideMenu from "@/components/SideMenu";
import BottomTabs from "@/components/BottomTabs";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const mainPx = pathname === "/calendar" ? "px-0" : "px-5";

  return (
    <div className="min-h-dvh bg-[#f6f7fb] text-neutral-900">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <TopBar onMenu={() => setMenuOpen(true)} />
        {menuOpen && (
  <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
)}
        <main className={`${mainPx} pb-24 pt-3`}>{children}</main>

        <BottomTabs />
      </div>
    </div>
  );
}