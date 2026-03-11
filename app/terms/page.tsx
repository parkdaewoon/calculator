export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-6 text-neutral-700">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        이용약관
      </h1>

      <section className="space-y-3">
        <p>
          본 약관은 공무원 노트(이하 "서비스")가 제공하는 모든 기능의
          이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을
          규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          1. 서비스의 목적
        </h2>
        <p>
          본 서비스는 공무원 봉급, 연금, 일정 관리 등 관련 정보를
          제공하기 위한 정보 제공 서비스입니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          2. 서비스 이용
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스는 별도의 회원가입 없이 이용할 수 있습니다.</li>
          <li>서비스 이용에 필요한 일부 데이터는 이용자의 브라우저에 저장될 수 있습니다.</li>
          <li>이용자는 관련 법령을 준수하여 서비스를 이용해야 합니다.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          3. 서비스 변경 및 중단
        </h2>
        <p>
          서비스는 운영상의 필요에 따라 서비스 내용의 일부 또는 전부를
          변경하거나 중단할 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          4. 지적재산권
        </h2>
        <p>
          서비스에 포함된 모든 콘텐츠 및 기능에 대한 저작권 및 기타
          지적재산권은 서비스 운영자에게 귀속됩니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          5. 이용자의 책임
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자는 서비스 이용 시 관련 법령을 준수해야 합니다.</li>
          <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          6. 약관의 변경
        </h2>
        <p>
          본 약관은 관련 법령 또는 서비스 정책에 따라 변경될 수 있으며,
          변경된 약관은 서비스 내에 공지됩니다.
        </p>
      </section>

      <p className="mt-10 text-xs text-neutral-500">
        시행일: 2026년 3월 11일
      </p>
    </main>
  );
}