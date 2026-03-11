import type { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "교대근무 캘린더",
  description:
    "공무원 노트 캘린더에서 업무·복무 일정을 관리하고 교대근무 패턴을 편리하게 확인하세요.",
  alternates: {
    canonical: "/calendar",
  },
  openGraph: {
    title: "교대근무 캘린더 | 공무원 노트",
    description:
      "업무·복무 일정 관리와 교대근무 패턴 확인을 한 곳에서.",
    url: "/calendar",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function Page() {
  return <CalendarClient />;
}