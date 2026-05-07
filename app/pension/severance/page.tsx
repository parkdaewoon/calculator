import type { Metadata } from "next";
import PensionSeverancePageClient from "@/components/pension/PensionSeverancePageClient";
import { PensionSeveranceContent } from "@/components/seo/AdSenseContent";

export const metadata: Metadata = {
  title: "공무원 퇴직수당 계산기 | 퇴직수당 예상액 확인",
  description:
    "재직기간과 기준소득월액을 바탕으로 공무원 퇴직수당 예상액을 확인하고 연금과 퇴직수당의 차이를 이해해보세요.",
  alternates: {
    canonical: "/pension/severance",
  },
  openGraph: {
    title: "공무원 퇴직수당 계산기 | 공무원 노트",
    description:
      "공무원 퇴직수당 예상액과 퇴직 전 확인해야 할 기준을 정리했습니다.",
    url: "/pension/severance",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <PensionSeverancePageClient />
      <PensionSeveranceContent />
    </>
  );
}
