import type { Metadata } from "next";
import PayTablePageClient from "@/components/Salary/PayTablePageClient";

export const metadata: Metadata = {
  title: "공무원 봉급표",
  description: "직렬·직급·호봉별 공무원 봉급표를 확인하세요.",
  alternates: {
    canonical: "/salary/pay-table",
  },
  openGraph: {
    title: "공무원 봉급표 | 공무원 노트",
    description: "직렬·직급·호봉별 공무원 봉급표를 확인하세요.",
    url: "/salary/pay-table",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <PayTablePageClient />;
}