import type { Metadata } from "next";
import SalaryCalculatorPageClient from "@/components/Salary/SalaryCalculatorPageClient";

export const metadata: Metadata = {
  title: "공무원 봉급 계산기",
  description:
    "직급·호봉과 수당을 입력해 공무원 봉급, 예상 급여, 연봉을 간편하게 계산하세요.",
  alternates: {
    canonical: "/salary/calculator",
  },
  openGraph: {
    title: "공무원 봉급 계산기 | 공무원 노트",
    description:
      "직급·호봉과 수당을 입력해 공무원 봉급, 예상 급여, 연봉을 간편하게 계산하세요.",
    url: "/salary/calculator",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <SalaryCalculatorPageClient />;
}