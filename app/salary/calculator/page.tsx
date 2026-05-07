import type { Metadata } from "next";
import SalaryCalculatorPageClient from "@/components/Salary/SalaryCalculatorPageClient";
import { SalaryCalculatorContent } from "@/components/seo/AdSenseContent";

export const metadata: Metadata = {
  title: "공무원 봉급 계산기 | 월급·연봉·실수령액 계산",
  description:
    "직급·호봉·수당·공제 항목을 입력해 공무원 월급, 연봉, 예상 실수령액을 확인하고 봉급표와 실제 수령액의 차이를 이해해보세요.",
  alternates: {
    canonical: "/salary/calculator",
  },
  openGraph: {
    title: "공무원 봉급 계산기 | 공무원 노트",
    description:
      "직급·호봉과 수당을 입력해 공무원 월급, 연봉, 예상 실수령액을 간편하게 계산하세요.",
    url: "/salary/calculator",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <SalaryCalculatorPageClient />
      <SalaryCalculatorContent />
    </>
  );
}
