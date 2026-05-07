import type { Metadata } from "next";
import PensionHome from "@/components/pension/PensionHome";

export const metadata: Metadata = {
  title: "공무원 연금",
  description:
    "공무원 연금 기본 정보, 퇴직수당, 연금 계산, 비교 기능을 확인하세요.",
  alternates: {
    canonical: "/pension",
  },
  openGraph: {
    title: "공무원 연금 | 공무원 노트",
    description:
      "공무원 연금 기본 정보, 퇴직수당, 연금 계산, 비교 기능을 확인하세요.",
    url: "/pension",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <PensionHome />;
}