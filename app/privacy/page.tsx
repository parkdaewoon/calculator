export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-6 text-neutral-700">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        개인정보 처리방침
      </h1>

      <section className="space-y-3">
        <p>
          공무원 노트(이하 "서비스")는 이용자의 개인정보를 중요하게
          생각하며 「개인정보 보호법」 등 관련 법령을 준수합니다.
        </p>
        <p>
          본 개인정보 처리방침은 서비스 이용 과정에서 수집될 수 있는
          정보의 종류, 이용 목적, 보관 및 처리 방법 등에 대해 안내합니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          1. 수집하는 정보
        </h2>
        <p>
          서비스는 회원가입 기능을 제공하지 않으며, 이용 과정에서
          다음과 같은 정보가 자동으로 수집될 수 있습니다.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>브라우저 정보 및 기기 정보 (OS, 브라우저 종류 등)</li>
          <li>서비스 이용 기록</li>
          <li>IP 주소</li>
          <li>푸시 알림 서비스 이용 시 알림 토큰 정보</li>
        </ul>

        <p className="mt-3">
          또한 일정 관리 기능을 제공하기 위해 일부 데이터는 이용자의
          브라우저 로컬 저장소(localStorage)에 저장될 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          2. 개인정보의 이용 목적
        </h2>

        <ul className="list-disc pl-5 space-y-1">
          <li>서비스 기능 제공 및 운영</li>
          <li>캘린더 및 계산 기능 제공</li>
          <li>푸시 알림 제공</li>
          <li>서비스 품질 개선 및 오류 분석</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          3. 개인정보의 보관 및 파기
        </h2>

        <p>
          서비스는 별도의 회원 정보를 서버에 저장하지 않습니다.
        </p>

        <p className="mt-2">
          이용자가 입력한 일정 정보 및 설정 데이터는 이용자의 브라우저
          로컬 저장소(localStorage)에 저장될 수 있으며 이용자가
          브라우저 데이터를 삭제할 경우 함께 삭제될 수 있습니다.
        </p>

        <p className="mt-2">
          서비스 운영에 필요한 최소한의 로그 정보는 관련 법령에 따라
          일정 기간 보관될 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          4. 개인정보의 제3자 제공
        </h2>

        <p>
          서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지
          않습니다. 다만 다음의 경우에는 예외로 할 수 있습니다.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>법령에 의거하거나 수사기관의 요청이 있는 경우</li>
          <li>서비스 제공을 위해 필요한 최소한의 범위 내에서 처리되는 경우</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          5. 광고 및 쿠키 사용
        </h2>

        <p>
          서비스는 Google AdSense 광고를 사용할 수 있습니다.
        </p>

        <p className="mt-2">
          Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의
          이전 방문 기록을 기반으로 광고를 제공할 수 있습니다.
        </p>

        <p className="mt-2">
          Google의 광고 쿠키 사용에 대한 자세한 내용은 Google의
          광고 및 콘텐츠 네트워크 개인정보처리방침을 참고하시기 바랍니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          6. 이용자의 권리
        </h2>

        <p>
          이용자는 언제든지 브라우저 설정을 통해 쿠키를 차단하거나
          저장된 데이터를 삭제할 수 있습니다.
        </p>

        <p className="mt-2">
          또한 서비스 이용 중 생성된 로컬 데이터는 이용자의 브라우저
          설정을 통해 직접 삭제할 수 있습니다.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-neutral-900 mb-2">
          7. 개인정보 보호책임자
        </h2>

        <p>서비스의 개인정보 보호 관련 문의는 아래로 연락하시기 바랍니다.</p>

        <p className="mt-2">
          이메일: pwbw066@gmail.com
        </p>
      </section>

      <p className="mt-10 text-xs text-neutral-500">
        시행일: 2026년 3월 11일
      </p>
    </main>
  );
}