import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/AppShell";
import SplashScreen from "@/components/SplashScreen";
import SwipeBackBlocker from "@/components/SwipeBackBlocker";

const siteName = "공무원 노트";
const siteUrl = "https://nokobridge.com";
const siteDescription = "봉급·수당·연금 계산과 달력을 한 곳에서";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 공무원 봉급·수당·연금 계산기`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/manifest.json",
  keywords: [
    "공무원 노트",
    "공무원 봉급",
    "공무원 봉급표",
    "공무원 수당",
    "공무원 수당 계산기",
    "공무원 연금",
    "공무원 연금 계산기",
    "공무원 퇴직수당",
    "공무원 퇴직수당 계산기",
    "공무원 기준소득월액",
    "교대근무 캘린더",
    "공무원 달력",
    "소방공무원 봉급",
    "경찰공무원 봉급",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName,
    title: `${siteName} | 공무원 봉급·수당·연금 계산기`,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "공무원 노트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | 공무원 봉급·수당·연금 계산기`,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "QH2tu1jVQN-Fsn3Pnav9Pw7NcqiAMxtyaT5C3",
    other: {
      "naver-site-verification": "b4734cb10293d0179bebef3ca5d12cf790df6d81",
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: "ko-KR",
  };

  return (
    <html lang="ko">
      <head>
        <Script
          id="adsense-script"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7723637407359078"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SwipeBackBlocker />
        <SplashScreen minDurationMs={700}>
          <AppShell>{children}</AppShell>
        </SplashScreen>
      </body>
    </html>
  );
}