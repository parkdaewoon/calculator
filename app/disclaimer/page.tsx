export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-6 text-neutral-700">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        면책조항
      </h1>

      <section className="space-y-3">
        <p>
          공무원 노트(이하 "서비스")는 공무원 관련 정보를 제공하기 위한
          참고용 서비스입니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          1. 정보의 정확성
        </h2>
        <p>
          서비스에서 제공되는 봉급, 연금 및 기타 계산 결과는 관련
          법령과 공개 자료를 기반으로 산출된 참고용 정보이며,
          실제 지급 금액과 차이가 있을 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          2. 법적 효력
        </h2>
        <p>
          서비스에서 제공되는 정보는 법적 효력을 가지지 않으며
          공식적인 행정 판단이나 재정 계산의 근거로 사용될 수 없습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          3. 손해에 대한 책임
        </h2>
        <p>
          이용자가 서비스에서 제공되는 정보를 활용하여 발생한
          직·간접적인 손해에 대해 서비스 운영자는 책임을 지지 않습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          4. 서비스 변경
        </h2>
        <p>
          서비스는 운영상의 필요에 따라 기능, 계산 방식,
          제공 정보 등을 변경할 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          5. 외부 서비스
        </h2>
        <p>
          서비스에는 광고 또는 외부 서비스가 포함될 수 있으며,
          해당 서비스 이용에 대한 책임은 각 제공자에게 있습니다.
        </p>
      </section>

      <p className="mt-10 text-xs text-neutral-500">
        시행일: 2026년 3월 11일
      </p>
    </main>
  );
}