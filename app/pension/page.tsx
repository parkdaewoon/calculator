import type { Metadata } from "next";
import PensionPageClient from "./PensionPageClient";

export const metadata: Metadata = {
  title: "공무원 연금 계산기",
  description:
    "기본정보, 퇴직수당, 연금 계산, 납부액·수령액 비교를 통해 공무원 연금을 한눈에 확인하세요.",
  alternates: {
    canonical: "/pension",
  },
  openGraph: {
    title: "공무원 연금 계산기 | 공무원 노트",
    description:
      "공무원 연금, 퇴직수당, 납부액·수령액 비교를 한 곳에서 확인하세요.",
    url: "/pension",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <PensionPageClient />;
}