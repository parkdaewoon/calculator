import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description:
    "공무원 노트 이용 중 오류 제보, 개선 제안, 계산 기준 문의를 보낼 수 있는 연락처 안내 페이지입니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">문의</h1>

      <section className="space-y-3">
        <p>
          공무원 노트 이용 중 오류 제보, 계산 기준 관련 문의, 기능 개선 제안이 있으시면 아래
          연락처로 보내주세요. 보내주신 내용은 서비스 품질을 개선하고 설명 콘텐츠를 보완하는 데
          참고합니다.
        </p>
        <p>
          모든 문의에 즉시 답변드리기는 어렵지만, 반복적으로 접수되는 오류나 사용자에게 혼란을 줄 수
          있는 계산 기준은 우선적으로 확인하고 개선하겠습니다.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
        <h2 className="mb-2 font-semibold text-neutral-900">연락처</h2>
        <p className="mb-1">
          이메일:{" "}
          <a
            href="mailto:nokobridge.contact@gmail.com"
            className="font-medium text-blue-600 underline underline-offset-2"
          >
            nokobridge.contact@gmail.com
          </a>
        </p>
        <p>
          블로그:{" "}
          <a
            href="https://blog.naver.com/nokobridge"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline underline-offset-2"
          >
            https://blog.naver.com/nokobridge
          </a>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">문의 가능 내용</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>봉급 계산, 수당 계산, 연금 계산 과정에서 발견한 오류</li>
          <li>봉급표, 수당제도, 퇴직수당 등 설명 콘텐츠의 보완 제안</li>
          <li>캘린더, 교대근무, 푸시 알림 기능 관련 개선 의견</li>
          <li>출처, 개인정보 처리방침, 면책조항 등 정책 페이지 관련 문의</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">문의할 때 적어주면 좋은 정보</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>문제가 발생한 페이지 주소 또는 메뉴 이름</li>
          <li>사용한 입력값과 예상했던 결과</li>
          <li>브라우저 종류와 사용 기기</li>
          <li>오류 화면 또는 재현 가능한 순서</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">유의사항</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>주민등록번호, 급여명세서 원본, 계좌번호 등 민감한 개인정보는 보내지 마세요.</li>
          <li>본 서비스는 공식 기관이 아니므로 확정 급여액이나 행정 해석을 안내할 수 없습니다.</li>
          <li>계산 결과는 참고용이며, 공식 확인은 소속 기관 또는 관련 기관을 통해 진행해 주세요.</li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-neutral-500">시행일: 2026년 3월 11일</p>
    </main>
  );
}
