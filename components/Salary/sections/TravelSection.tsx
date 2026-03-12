export default function TravelSection() {
  const overview =
    "여비는 공무여행 중 필요한 경비를 충당하기 위해 지급하는 비용으로 운임, 일비, 숙박비, 식비, 이전비, 가족여비 및 준비금 등으로 구분됩니다. 운임은 실제 소요 비용을 지급하는 실비정산이 원칙이며, 숙박비·식비·일비는 국내·국외 기준표에 따라 지급됩니다.";

  const expenseTypes = [
    {
      name: "운임",
      desc: "출장지 이동을 위한 교통비 (철도·선박·항공·자동차) – 실비 지급",
    },
    { name: "숙박비", desc: "출장 중 숙박 비용" },
    { name: "식비", desc: "출장 중 식사 비용" },
    { name: "일비", desc: "현지 교통비·통신비 등 출장 활동 비용" },
    {
      name: "이전비",
      desc: "근무지 변경 시 이사 화물 운송 비용",
    },
    {
      name: "가족여비",
      desc: "근무지 변경 시 가족 이동 비용",
    },
    {
      name: "준비금",
      desc: "국외출장 준비 비용 (비자, 예방접종, 보험 등)",
    },
  ];

  const travelCategories = [
    {
      type: "근무지내 국내출장",
      items: "정액 1만원 또는 2만원",
    },
    {
      type: "근무지외 국내출장",
      items: "운임, 식비, 숙박비, 일비",
    },
    {
      type: "국외출장",
      items: "운임, 식비, 숙박비, 일비, 준비금",
    },
    {
      type: "근무지 변경",
      items: "부임여비, 이전비, 가족여비",
    },
  ];

  const mileageRules = [
    "공무여행으로 발생한 항공 마일리지는 공적으로 관리",
    "출장 전 e-사람 시스템에 적립·사용 내역 등록",
    "공무 항공여행 시 공적 마일리지 우선 사용",
    "보너스 항공권, 좌석승급, 부가서비스 등에 활용 가능",
    "3만 마일 초과분: 1마일 20원 / 이하: 10원으로 개인 구매 가능",
  ];

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] space-y-6">
      <div className="text-sm font-semibold">여비제도</div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="text-xs font-semibold text-neutral-700">개요</div>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          {overview}
        </p>
      </div>

      <div>
        <div className="text-xs font-semibold text-neutral-700">여비 종류</div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          {expenseTypes.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-neutral-200 bg-white p-3"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {t.name}
              </div>
              <div className="mt-1 text-xs text-neutral-600">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-neutral-700">
          여비 지급 구분
        </div>

        <div className="mt-2 overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="min-w-[520px] w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                  구분
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                  지급항목
                </th>
              </tr>
            </thead>
            <tbody>
              {travelCategories.map((c) => (
                <tr key={c.type} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {c.type}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{c.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-xs font-semibold text-neutral-700">
          공적 항공마일리지
        </div>

        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          {mileageRules.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 text-xs text-neutral-500">
          근거: 「공무원 여비 규정」 제12조
        </div>
      </div>

      <div className="text-xs text-neutral-400">
        * 세부 금액 기준은 국내·국외 여비 별표 기준에 따릅니다.
      </div>
    </section>
  );
}