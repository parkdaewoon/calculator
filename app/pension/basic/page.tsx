import type { Metadata } from "next";
import PensionBasicPageClient from "@/components/pension/PensionBasicPageClient";

export const metadata: Metadata = {
  title: "공무원 연금 기본 정보",
  description:
    "공무원 연금과 퇴직수당 계산에 필요한 재직기간, 기준소득월액 등 기본 정보를 정리하고 저장하세요.",
  alternates: { canonical: "/pension/basic" },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "공무원 연금 기본 정보 | 공무원 노트",
    description: "연금 계산에 필요한 기본 정보를 입력하고 관리하세요.",
    url: "/pension/basic",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <PensionBasicPageClient />;
}
