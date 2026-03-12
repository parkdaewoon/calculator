import type { Metadata } from "next";
import TravelPageClient from "@/components/Salary/TravelPageClient";

export const metadata: Metadata = {
  title: "공무원 여비제도",
  description: "공무원 국내·국외 출장 여비 기준을 확인하세요.",
  alternates: {
    canonical: "/salary/travel",
  },
  openGraph: {
    title: "공무원 여비제도 | 공무원 노트",
    description: "공무원 국내·국외 출장 여비 기준을 확인하세요.",
    url: "/salary/travel",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <TravelPageClient />;
}