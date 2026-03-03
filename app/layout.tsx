import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "공무원 노트",
  description: "봉급·수당·연금 계산과 달력을 한 곳에서",

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/icon-512.png",
  },

  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}