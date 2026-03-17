import type { Metadata } from "next";
import AdsenseSlot from "@/components/AdsenseSlot";
import IconCard from "@/components/IconCard";
import { Calculator, Landmark, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "공무원 봉급·수당·연금 계산기 및 캘린더",
  description:
    "공무원 봉급, 수당, 연금 계산과 달력 기능을 한 곳에서 간편하게 이용하세요.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "공무원 봉급·수당·연금 계산기 및 캘린더 | 공무원 노트",
    description:
      "공무원 급여와 연금을 확인하고 업무 일정을 관리하세요.",
    url: "/",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="pt-4 pb-1">
        <div className="flex justify-center">
          <div className="w-full rounded-2xl border border-neutral-100 bg-white px-5 py-3 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <p className="text-[14px] leading-relaxed text-neutral-700">
              공무원 급여와 연금을 간편하게 확인하고
              <br />
              업무 일정을 관리하세요.
            </p>
          </div>
        </div>
        <div className="mt-4 h-px bg-neutral-100" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <IconCard
          href="/salary"
          icon={<Calculator className="h-9 w-9" />}
          title="봉급"
          desc={
            <>
              직급·호봉과 수당을 입력하면
              <br />
              다음달 예상 급여와 연봉을
              <br />
              확인합니다.
            </>
          }
        />
        <IconCard
          href="/pension"
          icon={<Landmark className="h-9 w-9" />}
          title="연금"
          desc={
            <>
              재직기간과 급여를 기준으로
              <br />
              예상 연금과 퇴직수당을
              <br />
              확인합니다.
            </>
          }
        />
        <IconCard
          href="/calendar"
          icon={<Calendar className="h-9 w-9" />}
          title="달력"
          desc={
            <>
              업무·복무 등 일정을
              <br />
              관리하세요.
            </>
          }
        />
        <IconCard
          href="#"
          icon={<Clock className="h-9 w-9" />}
          title="준비중"
          desc={
            <>
              추가 기능을 준비하고
              <br />
              있습니다.
            </>
          }
          disabled
        />
      </section>

      <section className="pt-2">
  <div className="mt-2 h-px bg-neutral-100" />

  <div className="mt-4 flex justify-center">
    <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
      <AdsenseSlot slot="1234567890" height={50} />
    </div>
  </div>
</section>
    </div>
  );
}