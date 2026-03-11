export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-6 text-neutral-700">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        출처
      </h1>

      <section className="space-y-3">
        <p>
          공무원 노트 서비스에서 제공되는 봉급, 수당, 연금 및 계산 기능은
          대한민국 정부에서 공개한 법령 및 공식 자료를 기반으로
          작성되었습니다.
        </p>
        <p>
          최신 법령 개정에 따라 실제 금액 또는 기준은 변경될 수 있으며,
          정확한 내용은 해당 법령 및 공식 기관을 통해 확인하시기 바랍니다.
        </p>
      </section>

      {/* 봉급 */}
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          1. 공무원 봉급
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>공무원 보수규정</li>
          <li>공무원 보수규정 별표 (공무원 봉급표)</li>
          <li>인사혁신처 공무원 보수표</li>
        </ul>
      </section>

      {/* 수당 */}
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          2. 공무원 수당
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>공무원수당 등에 관한 규정</li>
          <li>공무원수당 등에 관한 규정 별표</li>
        </ul>
      </section>

      {/* 연금 */}
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          3. 공무원 연금
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>공무원연금법</li>
          <li>공무원연금법 시행령</li>
          <li>공무원연금공단 공개 자료</li>
        </ul>
      </section>

      {/* 퇴직수당 */}
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          4. 퇴직수당
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>공무원연금법</li>
          <li>공무원연금법 시행령</li>
        </ul>
      </section>

      {/* 기타 */}
      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          5. 기타 참고 자료
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>인사혁신처</li>
          <li>공무원연금공단</li>
          <li>국가법령정보센터</li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-neutral-500">
        본 서비스는 공공기관과 무관한 비공식 정보 제공 서비스입니다.
      </p>
    </main>
  );
}