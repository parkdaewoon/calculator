export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-6 text-neutral-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">문의</h1>

      <section className="space-y-3">
        <p>
          공무원 노트 이용 중 문의사항, 오류 제보, 제안사항이 있으시면 아래
          연락처로 문의해 주세요.
        </p>
        <p>
          보내주신 내용은 서비스 개선에 참고되며, 모든 문의에 대해 즉시 답변을
          드리기 어려울 수 있습니다.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
        <h2 className="mb-2 font-semibold text-neutral-900">연락처</h2>
        <p>
          이메일:{" "}
          <a
            href="mailto:contact@example.com"
            className="font-medium text-blue-600 underline underline-offset-2"
          >
            nokobridge.contact@gmail.com
          </a>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">문의 가능 내용</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>서비스 이용 중 오류 또는 오작동 신고</li>
          <li>봉급, 연금, 일정 기능 관련 개선 제안</li>
          <li>정책 페이지 관련 문의</li>
          <li>기타 서비스 이용 관련 문의</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-semibold text-neutral-900">유의사항</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>개인정보나 민감한 정보는 이메일에 과도하게 기재하지 마세요.</li>
          <li>
            계산 결과에 대한 문의 시 입력값과 함께 문의해 주시면 확인에 도움이
            됩니다.
          </li>
          <li>
            본 서비스는 참고용 정보를 제공하며, 공식적인 행정 해석이나 확정
            금액 안내는 소속 기관 또는 관련 기관을 통해 확인해 주세요.
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-neutral-500">
        시행일: 2026년 3월 11일
      </p>
    </main>
  );
}