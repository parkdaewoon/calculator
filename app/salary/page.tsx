import type { Metadata } from "next";
import SalaryCalculator from "@/components/Salary/SalaryCalculator";

export const metadata: Metadata = {
  title: "공무원 봉급표·수당 계산기",
  description:
    "직급·호봉과 수당을 입력해 공무원 봉급, 예상 급여, 연봉을 간편하게 계산하세요.",
  alternates: {
    canonical: "/salary",
  },
  openGraph: {
    title: "공무원 봉급표·수당 계산기 | 공무원 노트",
    description:
      "공무원 봉급표와 각종 수당을 반영해 예상 급여와 연봉을 확인하세요.",
    url: "/salary",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function SalaryPage() {
  return <SalaryCalculator />;
}