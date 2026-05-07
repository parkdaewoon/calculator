import type { Metadata } from "next";
import PensionCalcPageClient from "@/components/pension/PensionCalcPageClient";
import { PensionCalcContent } from "@/components/seo/AdSenseContent";

export const metadata: Metadata = {
  title: "공무원 연금 계산기 | 예상 연금액 확인",
  description:
    "재직기간과 기준소득월액을 바탕으로 공무원 예상 연금액을 확인하고 연금 계산 시 함께 봐야 할 기준을 정리했습니다.",
  alternates: {
    canonical: "/pension/calc",
  },
  openGraph: {
    title: "공무원 연금 계산기 | 공무원 노트",
    description:
      "재직기간과 기준소득월액을 바탕으로 공무원 연금 예상액을 간편하게 계산하세요.",
    url: "/pension/calc",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <PensionCalcPageClient />
      <PensionCalcContent />
    </>
  );
}
