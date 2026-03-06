import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "공무원 노트",
  description: "봉급·수당·연금 계산과 달력을 한 곳에서",

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "공무원 노트",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SplashScreen minDurationMs={2000}>
          <AppShell>{children}</AppShell>
        </SplashScreen>
      </body>
    </html>
  );
}