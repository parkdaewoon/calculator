import type { Metadata } from "next";
import SalaryHome from "@/components/Salary/SalaryHome";

export const metadata: Metadata = {
  title: "공무원 봉급",
  description:
    "봉급표, 수당제도, 여비제도, 봉급 계산 메뉴를 확인하세요.",
  alternates: {
    canonical: "/salary",
  },
  openGraph: {
    title: "공무원 봉급 | 공무원 노트",
    description:
      "봉급표, 수당제도, 여비제도, 봉급 계산 메뉴를 확인하세요.",
    url: "/salary",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function SalaryPage() {
  return <SalaryHome />;
}