"use client";

import { useMemo, useState } from "react";
import {
  allowanceGroups,
  getAllowanceDefinition,
  type AllowanceDefinition,
  type AllowanceId,
} from "@/lib/allowances";

export default function AllowanceSection() {
  const summary =
    "공무원 수당은 공무원에게 지급되는 보수 중의 일부로서 직무여건 및 생활여건 등에 따라 지급되는 부가급여를 말합니다. 「공무원수당 등에 관한 규정」에 따라 5개 분야 14종으로 구분되며, 실비변상 4종도 함께 규정하고 있습니다. 국가공무원에 적용되며, 지방공무원은 「지방공무원수당 등에 관한 규정」을 따릅니다.";

  const [selectedId, setSelectedId] = useState<AllowanceId | null>(null);

  const selectedDef = useMemo(() => {
    if (!selectedId) return null;
    return getAllowanceDefinition(selectedId);
  }, [selectedId]);

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold text-neutral-900">수당제도</div>

      {/* 개요 */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="text-xs font-semibold text-neutral-700">개요</div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {summary}
        </p>
      </div>

      {/* 카테고리별 요약(접기/펼치기) */}
      <div className="mt-5 space-y-3">
        {allowanceGroups.map((g) => (
          <details
            key={g.title}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <summary className="list-none cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-900">
                  {g.title}
                </div>
                <span className="text-xs text-neutral-500">
                  {g.items.length}개
                </span>
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                지급대상 기준 요약 보기
              </div>
            </summary>

            <div className="mt-4 space-y-3">
              {g.items.map((it) => {
                const isActive = selectedId === it.id;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setSelectedId(it.id)}
                    className={[
                      "w-full rounded-2xl border p-3 text-left transition",
                      isActive
                        ? "border-neutral-300 bg-white"
                        : "border-neutral-100 bg-neutral-50 hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-neutral-900">
                        {it.name}
                      </div>
                      <span className="shrink-0 rounded-full border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600">
                        수당표 보기
                      </span>
                    </div>

                    <div className="mt-1 text-xs leading-relaxed text-neutral-600">
                      {it.target}
                    </div>

                    {it.note ? (
                      <div className="mt-2 text-[11px] text-neutral-500">
                        {it.note}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* 선택된 수당의 표 */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        {!selectedDef ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
            <div className="text-sm font-semibold text-neutral-800">수당표</div>
            <div className="mt-1 text-xs text-neutral-600">
              위에서 수당을 선택하면 여기에 수당표가 표시됩니다.
            </div>
          </div>
        ) : (
          <AllowanceTablePanel def={selectedDef} />
        )}
      </div>
    </section>
  );
}

/** 같은 파일 안에 내부 컴포넌트로 유지 */
function AllowanceTablePanel({ def }: { def: AllowanceDefinition }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">
            {def.title} 수당표
          </div>
          {def.summary ? (
            <div className="mt-1 text-xs text-neutral-600">{def.summary}</div>
          ) : null}
        </div>
      </div>

      {def.lawRefs?.length ? (
        <div className="mt-3 text-[11px] text-neutral-500">
          근거: {def.lawRefs.join(" · ")}
        </div>
      ) : null}

      <div className="mt-3 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="min-w-[640px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-neutral-50">
              {def.columns.map((c) => (
                <th
                  key={c.key}
                  className={[
                    "border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold text-neutral-700",
                    c.widthClassName ?? "",
                  ].join(" ")}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {def.rows.map((row, idx) => (
              <tr key={idx} className="align-top">
                {def.columns.map((c) => (
                  <td
                    key={c.key}
                    className="border-b border-neutral-100 px-4 py-3 text-neutral-800"
                  >
                    {row[c.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {def.footnotes?.length ? (
        <div className="mt-3 space-y-1 text-[11px] text-neutral-500">
          {def.footnotes.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}