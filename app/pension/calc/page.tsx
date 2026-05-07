import type { Metadata } from "next";
import PensionCalcPageClient from "@/components/pension/PensionCalcPageClient";

export const metadata: Metadata = {
  title: "공무원 연금 계산기",
  description:
    "재직기간과 기준소득월액을 바탕으로 공무원 연금 예상액을 간편하게 계산하세요.",
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
  return <PensionCalcPageClient />;
}