import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import AppShell from "@/components/AppShell";
import SplashScreen from "@/components/SplashScreen";
import SwipeBackBlocker from "@/components/SwipeBackBlocker";

const siteName = "공무원 노트";
const siteUrl = "https://www.nokobridge.com";
const siteDescription = "공무원 노트에서 봉급·수당·연금 계산과 달력 기능을 한 곳에서 이용하세요.";

const googleVerification = "QH2tu1jVQN-Fsn3Pnav9Pw7NcqiAMxtyaT5C3";
const naverVerification = "836e851277d7d3cb2c1a0d4a890a1d34daff3718";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${siteName} | 공무원 봉급·수당·연금 계산기 및 캘린더`,
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
    canonical: siteUrl,
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName,
    title: `${siteName} | 공무원 봉급·수당·연금 계산기 및 캘린더`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "공무원 노트",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteName} | 공무원 봉급·수당·연금 계산기 및 캘린더`,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
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
    google: googleVerification,
    other: {
      "naver-site-verification": naverVerification,
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
    alternateName: ["Nokobridge", "노코브릿지", "공무원노트"],
    url: siteUrl,
    description: siteDescription,
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content={naverVerification} />
        <meta name="google-site-verification" content={googleVerification} />

        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7723637407359078"
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