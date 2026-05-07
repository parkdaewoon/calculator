import type { Metadata } from "next";
import PensionComparePageClient from "@/components/pension/PensionComparePageClient";

export const metadata: Metadata = {
  title: "공무원 연금 비교",
  description:
    "재직기간과 기준소득월액 조건을 바꿔가며 공무원 연금과 퇴직수당 예상 흐름을 비교하세요.",
  alternates: { canonical: "/pension/compare" },
  openGraph: {
    title: "공무원 연금 비교 | 공무원 노트",
    description: "조건에 따라 달라지는 공무원 연금 예상 흐름을 비교하세요.",
    url: "/pension/compare",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <PensionComparePageClient />;
}
