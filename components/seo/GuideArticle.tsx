import Link from "next/link";

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type Related = {
  href: string;
  title: string;
};

export default function GuideArticle({
  eyebrow,
  title,
  description,
  sections,
  related = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
  related?: Related[];
}) {
  return (
    <main className="space-y-5 pb-8 pt-3">
      <article className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-neutral-700">{description}</p>
      </article>

      {sections.map((section, index) => (
        <section
          key={section.title}
          className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        >
          <h2 className="text-lg font-bold leading-snug text-neutral-900">
            {index + 1}. {section.title}
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul className="list-disc space-y-2 pl-5">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold text-neutral-900">이용 전 참고사항</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
          <p>
            공무원 노트의 설명과 계산 결과는 공개 자료를 바탕으로 한 참고용 정보입니다.
            실제 지급액, 적용 기준, 세부 요건은 소속 기관과 공식 자료에 따라 달라질 수
            있습니다.
          </p>
          <p>
            중요한 의사결정을 앞두고 있다면 계산 결과만으로 판단하지 말고 관련 법령, 공식
            기관 안내, 급여 담당 부서의 확인을 함께 거치는 것이 안전합니다.
          </p>
        </div>
      </section>

      {related.length ? (
        <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold text-neutral-900">관련 페이지</h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-white hover:shadow-sm"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
