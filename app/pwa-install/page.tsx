export const metadata = {
  title: "아이폰 · 안드로이드 PWA 설치 방법",
  description:
    "아이폰 Safari와 안드로이드 Chrome에서 공무원 노트를 홈 화면에 추가해 앱처럼 사용하는 방법을 안내합니다.",
};

export default function PwaInstallPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-800">
      <article className="space-y-8">
        {/* 헤더 */}
        <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm">
          <p className="mb-2 text-xs font-semibold tracking-wide text-blue-600">
            PWA 설치 안내
          </p>
          <h1 className="text-2xl font-bold leading-tight text-neutral-900">
            아이폰 · 안드로이드에서
            <br />
            PWA 앱 설치 방법
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            웹사이트를 홈 화면에 추가해 앱처럼 실행하는 기능을
            <span className="font-semibold text-neutral-900"> PWA</span>
            (Progressive Web App)라고 합니다.
            <br />
            앱스토어에서 따로 설치하지 않아도, 자주 쓰는 서비스를 더 빠르고
            편하게 사용할 수 있습니다.
          </p>
        </section>

        {/* 아이폰 */}
        <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">
            아이폰에서 설치하는 방법
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            아이폰은 <span className="font-semibold">Safari 브라우저</span>
            에서 설치하는 것이 가장 안정적입니다.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Safari에서 공무원 노트 웹사이트에 접속합니다.",
              "하단의 공유 버튼(네모 + 화살표)을 누릅니다.",
              "아래 메뉴에서 ‘홈 화면에 추가’를 선택합니다.",
              "이름을 확인한 뒤 ‘추가’를 누릅니다.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-4"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <p className="text-sm leading-6 text-neutral-700">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
            <p className="text-sm leading-6 text-blue-900">
              설치가 완료되면 아이폰 홈 화면에 아이콘이 생성됩니다.
              <br />
              이후에는 브라우저를 다시 열지 않아도
              <span className="font-semibold"> 앱처럼 바로 실행</span>할 수
              있습니다.
            </p>
          </div>
        </section>

        {/* 안드로이드 */}
        <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">
            안드로이드에서 설치하는 방법
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            안드로이드는 보통
            <span className="font-semibold"> Chrome 브라우저</span>에서 쉽게
            설치할 수 있습니다.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Chrome에서 공무원 노트 웹사이트에 접속합니다.",
              "오른쪽 상단의 메뉴 버튼(⋮)을 누릅니다.",
              "‘홈 화면에 추가’ 또는 ‘앱 설치’를 선택합니다.",
              "설치 버튼을 눌러 완료합니다.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-4"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <p className="text-sm leading-6 text-neutral-700">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-4">
            <p className="text-sm leading-6 text-green-900">
              설치가 끝나면 홈 화면에 공무원 노트 아이콘이 생기며,
              일반 앱처럼 바로 실행해서 사용할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 장점 */}
        <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">PWA의 장점</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "앱스토어 설치 없이 바로 사용 가능",
              "홈 화면에서 바로 실행 가능",
              "앱처럼 깔끔한 전체 화면 사용",
              "웹 업데이트 내용이 빠르게 반영됨",
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-neutral-600">
            자주 사용하는 서비스라면 브라우저에서 찾는 것보다
            <span className="font-semibold text-neutral-900">
              {" "}
              홈 화면에 추가해서 바로 실행
            </span>
            하는 편이 훨씬 편합니다.
          </p>
        </section>

        {/* 공무원 노트 안내 */}
        <section className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">
            공무원 노트 PWA 사용 안내
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            공무원 노트는 홈 화면 추가를 지원합니다.
            <br />
            설치해 두면 필요한 기능을 더 빠르게 사용할 수 있습니다.
          </p>

          <div className="mt-4 space-y-2">
            {[
              "교대근무 캘린더 확인",
              "근무시간 및 일정 관리",
              "공무원 봉급 계산",
              "공무원 연금 계산",
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
              >
                • {item}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
            <p className="text-sm leading-6 text-amber-900">
              특히 자주 사용하는 경우에는 홈 화면에 추가해 두면
              로그인이나 주소 입력 없이 더 간편하게 이용할 수 있습니다.
            </p>
          </div>
        </section>

      </article>
    </main>
  );
}