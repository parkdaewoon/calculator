import type { Metadata } from "next";
import GuideArticle from "@/components/seo/GuideArticle";

export const metadata: Metadata = {
  title: "교대근무 캘린더 사용 방법",
  description:
    "공무원 노트 달력에서 교대근무 패턴, 당직, 휴무, 알림을 관리하는 기본 방법을 정리했습니다.",
  alternates: { canonical: "/guide/calendar/shift-work" },
  openGraph: {
    title: "교대근무 캘린더 사용 방법 | 공무원 노트",
    description: "교대근무와 일정 알림을 함께 관리하는 방법을 확인하세요.",
    url: "/guide/calendar/shift-work",
    siteName: "공무원 노트",
    locale: "ko_KR",
    type: "article",
  },
};

export default function Page() {
  return (
    <GuideArticle
      eyebrow="CALENDAR GUIDE"
      title="교대근무 캘린더 사용 방법"
      description="공무원 일정은 일반 일정뿐 아니라 당직, 교대근무, 휴무, 급여일처럼 반복되는 항목이 함께 관리되어야 합니다. 공무원 노트 달력은 이런 흐름을 한 화면에서 확인하기 위한 기능입니다."
      sections={[
        {
          title: "교대근무는 기준일과 패턴이 중요합니다",
          paragraphs: [
            "교대근무는 반복되는 근무 코드와 기준일을 기준으로 일정이 이어집니다. 예를 들어 주간, 야간, 비번, 휴무가 반복되는 형태라면 어떤 날을 기준일로 잡는지가 전체 달력 표시를 결정합니다.",
            "기준일이 맞지 않으면 이후 날짜의 근무 표시가 모두 어긋날 수 있으므로 처음 설정할 때 실제 근무표와 맞는 기준일을 선택하는 것이 중요합니다.",
          ],
        },
        {
          title: "근무 코드별 알림을 따로 볼 수 있습니다",
          paragraphs: [
            "교대근무는 근무 종류마다 준비 시간이 다를 수 있습니다. 주간 근무, 야간 근무, 당직 등은 알림이 필요한 시간이 다를 수 있기 때문에 근무 코드별 알림을 따로 설정하면 편리합니다.",
            "예를 들어 야간 근무는 전날 밤에 미리 알림을 받고, 주간 근무는 당일 아침에 알림을 받는 방식으로 사용할 수 있습니다.",
          ],
          bullets: [
            "주간 근무: 당일 아침 알림",
            "야간 근무: 전날 또는 당일 지정 시간 알림",
            "당직: 출근 전 준비 시간에 맞춘 알림",
            "휴무: 별도 알림 없이 일정 확인용으로 활용",
          ],
        },
        {
          title: "일반 일정과 함께 관리하면 편합니다",
          paragraphs: [
            "공무원 일정은 근무표만으로 끝나지 않습니다. 출장, 교육, 휴가, 급여일, 개인 일정도 함께 확인해야 합니다. 달력에 근무 패턴과 일반 일정을 함께 표시하면 월별 흐름을 한눈에 보기 쉽습니다.",
            "특히 반복 근무를 하는 경우에는 근무일과 휴무일을 미리 확인해 개인 일정을 계획하는 데 도움이 됩니다.",
          ],
        },
        {
          title: "알림 기능 사용 시 확인할 점",
          paragraphs: [
            "푸시 알림은 브라우저와 기기 설정의 영향을 받을 수 있습니다. 홈 화면에 설치한 PWA 환경, 알림 권한, 네트워크 상태에 따라 알림 수신 여부가 달라질 수 있습니다. 중요한 일정은 달력에서 한 번 더 확인하는 습관이 좋습니다.",
          ],
        },
      ]}
      related={[
        { href: "/calendar", title: "공무원 달력" },
        { href: "/guide", title: "공무원 가이드" },
        { href: "/pwa-install", title: "PWA 설치 안내" },
      ]}
    />
  );
}
