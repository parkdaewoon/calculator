import type { Metadata } from "next";
import AllowancesPageClient from "@/components/Salary/AllowancesPageClient";

export const metadata: Metadata = {
  title: "공무원 수당제도",
  description: "공무원 수당 종류와 지급 기준을 확인하세요.",
  alternates: {
    canonical: "/salary/allowances",
  },
  openGraph: {
    title: "공무원 수당제도 | 공무원 노트",
    description: "공무원 수당 종류와 지급 기준을 확인하세요.",
    url: "/salary/allowances",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <AllowancesPageClient />;
}