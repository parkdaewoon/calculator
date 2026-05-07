import type { Metadata } from "next";
import PayTablePageClient from "@/components/Salary/PayTablePageClient";
import { PayTableContent } from "@/components/seo/AdSenseContent";

export const metadata: Metadata = {
  title: "공무원 봉급표 | 직급·호봉별 기본급 확인",
  description:
    "직렬·직급·호봉별 공무원 봉급표를 확인하고 기본급, 수당, 실수령액의 차이를 함께 이해해보세요.",
  alternates: {
    canonical: "/salary/pay-table",
  },
  openGraph: {
    title: "공무원 봉급표 | 공무원 노트",
    description:
      "직렬·직급·호봉별 기본급 흐름과 공무원 봉급표 보는 방법을 확인하세요.",
    url: "/salary/pay-table",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <PayTablePageClient />
      <PayTableContent />
    </>
  );
}
