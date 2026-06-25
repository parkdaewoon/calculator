"use client";

import Link from "next/link";

const footerLinks = [
  ["소개", "/about"],
  ["작성 기준", "/editorial-policy"],
  ["체크리스트", "/checklist"],
  ["출처", "/sources"],
  ["문의", "/contact"],
  ["개인정보", "/privacy"],
  ["약관", "/terms"],
  ["면책", "/disclaimer"],
];

export default function SiteInfoFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-white px-5 pb-8 pt-6 text-xs leading-6 text-neutral-500">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {footerLinks.map(([label, href]) => (
          <Link key={href} href={href} className="underline underline-offset-4">
            {label}
          </Link>
        ))}
      </div>
      <p className="mt-3">
        공무원 노트는 급여와 연금 구조를 이해하기 위한 참고 서비스이며, 실제 적용 기준은 관련 기관 자료를 함께 확인해야 합니다.
      </p>
    </footer>
  );
}
