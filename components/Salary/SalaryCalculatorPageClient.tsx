"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdsenseSlot from "@/components/AdsenseSlot";
import NiceSelect from "@/components/Salary/Calculator/NiceSelect";
import Field from "@/components/Salary/Calculator/Field";
import MoneyInput from "@/components/Salary/Calculator/MoneyInput";
import Row from "@/components/Salary/Calculator/Row";
import ReadOnlyMoneyLine from "@/components/Salary/Calculator/ReadOnlyMoneyLine";
import AllowanceGroup from "@/components/Salary/Calculator/AllowanceGroup";
import AutoMoneyLine from "@/components/Salary/Calculator/AutoMoneyLine";
import ManualMoneyLine from "@/components/Salary/Calculator/ManualMoneyLine";
import AutoTimeMoneyLine from "@/components/Salary/Calculator/AutoTimeMoneyLine";
import AutoDayMoneyLine from "@/components/Salary/Calculator/AutoDayMoneyLine";
import SelectInt from "@/components/Salary/Calculator/SelectInt";
import HistoryModal from "@/components/Salary/Calculator/HistoryModal";

import { PAY_TABLES } from "@/lib/payTables";
import type {
  SalaryInputs,
  SalaryHistoryItem,
  SeriesKey,
} from "@/lib/salary/types";
import { calcSalary } from "@/lib/salary/calcSalary";
import {
  getFirstColumnKey,
  getSafeColumnKey,
} from "@/lib/salary/helpers";
import {
  loadDraft,
  saveDraft,
  loadHistory,
  saveHistory,
  addHistorySnapshot,
  HISTORY_MAX,
} from "@/lib/salary/storage";
import {
  formatWon,
  formatNumberInput,
  clampInt,
} from "@/lib/salary/format";
import {
  STEP_OPTIONS,
  YEAR_OPTIONS,
} from "@/lib/salary/selectors";
import type { Opt } from "@/lib/salary/types";

export default function SalaryCalculatorPageClient() {
  const router = useRouter();

  const [inputs, setInputs] = useState<SalaryInputs>(() => {
    const draft = loadDraft();
    return draft ?? makeInitialInputsSafe();
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    saveDraft(inputs);
  }, [inputs]);

  const safeInputs = useMemo<SalaryInputs>(() => {
    const safeSeries: SeriesKey = inputs.series;
    const safeColumnKey = getSafeColumnKey(safeSeries, inputs.columnKey);

    return {
      ...inputs,
      series: safeSeries,
      columnKey: safeColumnKey,
      allow_remote_area_type: inputs.allow_remote_area_type ?? "NONE",
      allow_remote_area_add_manual: inputs.allow_remote_area_add_manual ?? 0,
      risk_type: inputs.risk_type ?? "NONE",
      risk_other_manual: inputs.risk_other_manual ?? 0,
      management_excluded: inputs.management_excluded ?? false,
      leave_comp_days: inputs.leave_comp_days ?? 0,
      bosuMonthly_mode: inputs.bosuMonthly_mode ?? "auto",
      bosuMonthly_manual: inputs.bosuMonthly_manual ?? 0,
      standardMonthly_mode: inputs.standardMonthly_mode ?? "auto",
      standardMonthly_manual: inputs.standardMonthly_manual ?? 0,
      taxFreeMonthly_manual: inputs.taxFreeMonthly_manual ?? 0,
    };
  }, [inputs]);

  const result = useMemo(() => calcSalary(safeInputs), [safeInputs]);

  const title = "봉급 계산";
  const description =
    "직렬·직급·호봉으로 기본급을 자동 계산하고,\n수당·공제를 입력해 실수령액(예상)을 확인하세요.";

  const seriesOptions: Opt[] = useMemo(
    () =>
      Object.keys(PAY_TABLES).map((id) => {
        const key = id as SeriesKey;
        return {
          value: key,
          label: PAY_TABLES[key]?.title ?? key,
        };
      }),
    []
  );

  const columnOptions: Opt[] = useMemo(
    () =>
      (PAY_TABLES[safeInputs.series]?.columns ?? []).map((c) => ({
        value: c.key,
        label: c.label,
      })),
    [safeInputs.series]
  );

  return (
    <div className="space-y-5">
      <section className="pt-1">
        <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
            {title}
          </h1>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-7 items-center rounded-full border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 active:scale-[0.98]"
          >
            전체메뉴
          </button>
        </div>

        <p className="mt-3 whitespace-pre-line text-sm text-neutral-500">
          {description}
        </p>
      </section>

      <HistoryModal
        open={historyOpen}
        history={history.slice(0, HISTORY_MAX)}
        selectedId={selectedId}
        onClose={() => setHistoryOpen(false)}
        onSelectId={setSelectedId}
        onApplyHistory={(historyInputs, id) => {
          setSelectedId(id);
          setInputs(historyInputs);
          setHistoryOpen(false);
        }}
        onDeleteSelected={() => {
          if (!selectedId) {
            alert("삭제할 기록을 선택하세요.");
            return;
          }

          const ok = confirm("선택한 기록을 삭제할까요?");
          if (!ok) return;

          const next = history.filter((x) => x.id !== selectedId);
          setHistory(next);
          saveHistory(next);
          setSelectedId(null);
        }}
      />

      {/* 1) 기본 정보 */}
      <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">기본 정보</div>

          <button
            type="button"
            onClick={() => {
              setHistory(loadHistory());
              setHistoryOpen(true);
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            이전 기록 보기
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="직렬">
            <NiceSelect
              value={String(safeInputs.series)}
              options={seriesOptions}
              onChange={(v: string) => {
                const series = v as SeriesKey;
                setInputs((p) => ({
                  ...p,
                  series,
                  columnKey: getFirstColumnKey(series) || p.columnKey,
                  step: 1,
                }));
              }}
            />
          </Field>

          <Field label="직급">
            <NiceSelect
              value={String(safeInputs.columnKey)}
              options={columnOptions}
              onChange={(v: string) => setInputs((p) => ({ ...p, columnKey: v }))}
            />
          </Field>

          <Field label="호봉(1~32)">
            <NiceSelect
              value={String(safeInputs.step)}
              options={STEP_OPTIONS}
              onChange={(v: string) => setInputs((p) => ({ ...p, step: Number(v) }))}
            />
          </Field>

          <Field label="근무연수(0~40)">
            <NiceSelect
              value={String(safeInputs.yearsOfService)}
              options={YEAR_OPTIONS}
              onChange={(v: string) =>
                setInputs((p) => ({ ...p, yearsOfService: Number(v) }))
              }
            />
          </Field>

          <div className="col-span-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">기본급(월)</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              {formatWon(result.breakdown.basePay)}
            </div>
          </div>
        </div>
      </section>

      {/* 2) 수당(월) */}
      <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">수당(월)</div>
        </div>

        <div className="mt-3 space-y-3">
          <AllowanceGroup title="상여수당">
            <AutoMoneyLine
              label="대우공무원수당"
              mode={safeInputs.allow_pwu_mode}
              autoValue={result.breakdown.allow_pwu}
              manualValue={safeInputs.allow_pwu_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_pwu_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_pwu_manual: v }))
              }
            />

            <AutoMoneyLine
              label="정근수당"
              mode={safeInputs.allow_long_service_bonus_mode}
              autoValue={result.breakdown.allow_long_service_bonus}
              manualValue={safeInputs.allow_long_service_bonus_manual}
              onModeChange={(m) =>
                setInputs((p) => ({
                  ...p,
                  allow_long_service_bonus_mode: m,
                }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_long_service_bonus_manual: v,
                }))
              }
            />

            <AutoMoneyLine
              label="정근수당가산금"
              mode={safeInputs.allow_long_service_add_mode}
              autoValue={result.breakdown.allow_long_service_add}
              manualValue={safeInputs.allow_long_service_add_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_long_service_add_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_long_service_add_manual: v,
                }))
              }
            />

            <ManualMoneyLine
              label="성과상여금"
              value={safeInputs.allow_performance_manual}
              onChange={(v) =>
                setInputs((p) => ({ ...p, allow_performance_manual: v }))
              }
            />
          </AllowanceGroup>

          <AllowanceGroup title="가계보전수당">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-xs font-medium text-neutral-900">가족 정보</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <SelectInt
                  label="배우자"
                  value={safeInputs.family_spouse}
                  max={1}
                  onChange={(v) =>
                    setInputs((p) => ({ ...p, family_spouse: v }))
                  }
                />
                <SelectInt
                  label="자녀"
                  value={safeInputs.family_children}
                  max={10}
                  onChange={(v) =>
                    setInputs((p) => ({ ...p, family_children: v }))
                  }
                />
                <SelectInt
                  label="부양가족"
                  value={safeInputs.family_dependents}
                  max={10}
                  onChange={(v) =>
                    setInputs((p) => ({ ...p, family_dependents: v }))
                  }
                />
              </div>
              <div className="mt-2 text-[11px] text-neutral-500">
                * 배우자가 공무원인 경우 0명 선택
              </div>
            </div>

            <AutoMoneyLine
              label="가족수당"
              mode={safeInputs.allow_family_mode}
              autoValue={result.breakdown.allow_family}
              manualValue={safeInputs.allow_family_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_family_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_family_manual: v }))
              }
            />

            <ManualMoneyLine
              label="자녀학비보조수당"
              value={safeInputs.allow_child_edu_manual}
              onChange={(v) =>
                setInputs((p) => ({ ...p, allow_child_edu_manual: v }))
              }
            />

            <ManualMoneyLine
              label="주택수당"
              value={safeInputs.allow_housing_manual}
              onChange={(v) =>
                setInputs((p) => ({ ...p, allow_housing_manual: v }))
              }
            />

            <ManualMoneyLine
              label="육아휴직수당"
              value={safeInputs.allow_parental_leave_manual}
              onChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_parental_leave_manual: v,
                }))
              }
            />
          </AllowanceGroup>

          <AllowanceGroup title="특수지근무수당">
            <div className="rounded-2xl border border-neutral-200 p-3">
              <div className="text-sm text-neutral-900">특수지근무수당</div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="text-xs text-neutral-500">구분(가나다라군)</div>
                  <select
                    value={safeInputs.allow_remote_area_type ?? "NONE"}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        allow_remote_area_type: e.target.value as
                          | "NONE"
                          | "GA"
                          | "NA"
                          | "DA"
                          | "RA",
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="NONE">해당없음</option>
                    <option value="GA">가군 (60,000원)</option>
                    <option value="NA">나군 (50,000원)</option>
                    <option value="DA">다군 (40,000원)</option>
                    <option value="RA">라군 (30,000원)</option>
                  </select>
                </label>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">기본 금액</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {formatWon(result.breakdown.allow_remote_area)}
                  </div>
                </div>

                <label className="col-span-2 block">
                  <div className="text-xs text-neutral-500">가산금(직접 입력)</div>
                  <input
                    inputMode="numeric"
                    value={formatNumberInput(
                      safeInputs.allow_remote_area_add_manual
                    )}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        allow_remote_area_add_manual: clampInt(
                          e.target.value,
                          0,
                          1_000_000_000
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  />
                </label>

                <div className="col-span-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-500">특수지근무수당 합계</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {formatWon(result.breakdown.allow_remote_area)}
                  </div>
                </div>
              </div>
            </div>
          </AllowanceGroup>

          <AllowanceGroup title="특수근무수당">
            <div className="rounded-2xl border border-neutral-200 p-3">
              <div className="text-sm text-neutral-900">위험근무수당</div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="text-xs text-neutral-500">구분</div>
                  <select
                    value={safeInputs.risk_type}
                    onChange={(e) =>
                      setInputs((p) => {
                        const next = e.target.value as SalaryInputs["risk_type"];
                        const isOther = next === "OTHER";

                        return {
                          ...p,
                          risk_type: next,
                          allow_risk_mode: isOther ? "manual" : "auto",
                          risk_other_manual: isOther ? p.risk_other_manual : 0,
                          allow_risk_manual: isOther
                            ? (p.risk_other_manual ?? 0)
                            : 0,
                        };
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="NONE">해당없음</option>
                    <option value="A">갑 (60,000원)</option>
                    <option value="B">을 (50,000원)</option>
                    <option value="C">병 (40,000원)</option>
                    <option value="OTHER">기타(직접입력)</option>
                  </select>
                </label>

                {safeInputs.risk_type === "OTHER" ? (
                  <label className="block">
                    <div className="text-xs text-neutral-500">기타 금액</div>
                    <input
                      inputMode="numeric"
                      value={formatNumberInput(safeInputs.risk_other_manual)}
                      onChange={(e) =>
                        setInputs((p) => {
                          const v = clampInt(e.target.value, 0, 1_000_000_000);
                          return {
                            ...p,
                            risk_other_manual: v,
                            allow_risk_mode: "manual",
                            allow_risk_manual: v,
                          };
                        })
                      }
                      className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-500">금액</div>
                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                      {formatWon(result.breakdown.allow_risk)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AutoMoneyLine
              label="특수업무수당"
              mode={safeInputs.allow_special_task_mode}
              autoValue={result.breakdown.allow_special_task}
              manualValue={safeInputs.allow_special_task_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_special_task_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_special_task_manual: v,
                }))
              }
            />

            <AutoMoneyLine
              label="업무대행수당"
              mode={safeInputs.allow_substitute_mode}
              autoValue={result.breakdown.allow_substitute}
              manualValue={safeInputs.allow_substitute_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_substitute_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_substitute_manual: v,
                }))
              }
            />

            <AutoMoneyLine
              label="군법무관수당"
              mode={safeInputs.allow_military_law_mode}
              autoValue={result.breakdown.allow_military_law}
              manualValue={safeInputs.allow_military_law_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_military_law_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_military_law_manual: v,
                }))
              }
            />
          </AllowanceGroup>

          <AllowanceGroup title="초과근무수당 등">
            <AutoTimeMoneyLine
              label="시간외수당"
              mode={safeInputs.allow_overtime_mode}
              hours={safeInputs.overtime_hours}
              onHoursChange={(h) =>
                setInputs((p) => ({
                  ...p,
                  overtime_hours: h,
                  allow_overtime_mode: h > 0 ? "auto" : p.allow_overtime_mode,
                  management_excluded:
                    h > 0 || p.night_hours > 0 || p.holiday_days > 0,
                }))
              }
              autoValue={result.breakdown.allow_overtime}
              manualValue={safeInputs.allow_overtime_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_overtime_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_overtime_manual: v }))
              }
            />

            <AutoTimeMoneyLine
              label="야간수당"
              mode={safeInputs.allow_night_mode}
              hours={safeInputs.night_hours}
              onHoursChange={(h) =>
                setInputs((p) => ({
                  ...p,
                  night_hours: h,
                  allow_night_mode: h > 0 ? "auto" : p.allow_night_mode,
                  management_excluded:
                    p.overtime_hours > 0 || h > 0 || p.holiday_days > 0,
                }))
              }
              autoValue={result.breakdown.allow_night}
              manualValue={safeInputs.allow_night_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_night_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_night_manual: v }))
              }
            />

            <AutoDayMoneyLine
              label="휴일수당"
              mode={safeInputs.allow_holiday_mode}
              days={safeInputs.holiday_days}
              onDaysChange={(d) =>
                setInputs((p) => ({
                  ...p,
                  holiday_days: d,
                  allow_holiday_mode: d > 0 ? "auto" : p.allow_holiday_mode,
                  management_excluded:
                    p.overtime_hours > 0 || p.night_hours > 0 || d > 0,
                }))
              }
              autoValue={result.breakdown.allow_holiday}
              manualValue={safeInputs.allow_holiday_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_holiday_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_holiday_manual: v }))
              }
            />

            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={
                  safeInputs.management_excluded ||
                  safeInputs.overtime_hours > 0 ||
                  safeInputs.night_hours > 0 ||
                  safeInputs.holiday_days > 0
                }
                onChange={(e) =>
                  setInputs((p) => ({
                    ...p,
                    management_excluded: e.target.checked,
                  }))
                }
              />
              관리업무수당 제외(강등·정직·휴직·보직없음 등)
            </label>

            <AutoMoneyLine
              label="관리업무수당"
              mode={safeInputs.allow_management_mode}
              autoValue={result.breakdown.allow_management}
              manualValue={safeInputs.allow_management_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_management_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_management_manual: v,
                }))
              }
            />
          </AllowanceGroup>

          <AllowanceGroup title="실비변상 등">
            <AutoMoneyLine
              label="정액급식비"
              mode={safeInputs.allow_meal_mode}
              autoValue={result.breakdown.allow_meal}
              manualValue={safeInputs.allow_meal_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_meal_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_meal_manual: v }))
              }
            />

            <AutoMoneyLine
              label="직급보조비"
              mode={safeInputs.allow_position_mode}
              autoValue={result.breakdown.allow_position}
              manualValue={safeInputs.allow_position_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_position_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_position_manual: v,
                }))
              }
            />

            <AutoMoneyLine
              label="명절휴가비"
              mode={safeInputs.allow_holiday_bonus_mode}
              autoValue={result.breakdown.allow_holiday_bonus}
              manualValue={safeInputs.allow_holiday_bonus_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_holiday_bonus_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_holiday_bonus_manual: v,
                }))
              }
            />

            <AutoDayMoneyLine
              label="연가보상비"
              mode={safeInputs.allow_leave_comp_mode}
              days={safeInputs.leave_comp_days}
              onDaysChange={(d) =>
                setInputs((p) => ({ ...p, leave_comp_days: d }))
              }
              autoValue={result.breakdown.allow_leave_comp}
              manualValue={safeInputs.allow_leave_comp_manual}
              onModeChange={(m) =>
                setInputs((p) => ({ ...p, allow_leave_comp_mode: m }))
              }
              onManualChange={(v) =>
                setInputs((p) => ({ ...p, allow_leave_comp_manual: v }))
              }
            />
          </AllowanceGroup>

          <AllowanceGroup title="기타 수당">
            <ManualMoneyLine
              label="기타 수당(합산)"
              value={safeInputs.allow_other_manual}
              onChange={(v) =>
                setInputs((p) => ({
                  ...p,
                  allow_other_manual: v,
                }))
              }
            />
            <div className="text-[11px] text-neutral-500">
              * 위 항목에 없는 수당을 합산해서 입력하세요.
            </div>
          </AllowanceGroup>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">수당계</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatWon(result.allowanceTotal)}
            </div>
          </div>
        </div>
      </section>

      {/* 3) 공제 */}
      <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">공제(월)</div>
        </div>

        <div className="mt-3 space-y-3">
          <AutoMoneyLine
            label="보수월액"
            mode={safeInputs.bosuMonthly_mode}
            autoValue={result._debug?.bosuMonthlyAuto ?? 0}
            manualValue={safeInputs.bosuMonthly_manual}
            onModeChange={(m) =>
              setInputs((p) => ({ ...p, bosuMonthly_mode: m }))
            }
            onManualChange={(v) =>
              setInputs((p) => ({ ...p, bosuMonthly_manual: v }))
            }
          />

          <AutoMoneyLine
            label="기준소득월액"
            mode={safeInputs.standardMonthly_mode}
            autoValue={result._debug?.standardMonthlyAuto ?? 0}
            manualValue={safeInputs.standardMonthly_manual}
            onModeChange={(m) =>
              setInputs((p) => ({ ...p, standardMonthly_mode: m }))
            }
            onManualChange={(v) =>
              setInputs((p) => ({ ...p, standardMonthly_manual: v }))
            }
          />

          <ReadOnlyMoneyLine label="일반기여금" value={result.breakdown.pension} />
          <ReadOnlyMoneyLine label="건강보험료" value={result.breakdown.health} />
          <ReadOnlyMoneyLine
            label="장기요양보험료"
            value={result.breakdown.care}
          />
          <ReadOnlyMoneyLine
            label="소득세(간이)"
            value={result.breakdown.incomeTax}
          />
          <ReadOnlyMoneyLine
            label="지방소득세"
            value={result.breakdown.localTax}
          />

          <AllowanceGroup title="기타 공제">
            <MoneyInput
              label="기타공제(합산)"
              value={safeInputs.otherDeduction}
              onChange={(v) => setInputs((p) => ({ ...p, otherDeduction: v }))}
            />
            <div className="text-[11px] text-neutral-500">
              * 위 항목에 없는 공제(노조비, 상조회비, 대출상환 등)를 합산해서
              입력하세요.
            </div>
          </AllowanceGroup>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">공제(합계)</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatWon(result.deductionTotal)}
            </div>
          </div>
        </div>
      </section>

      {/* 4) 결과 */}
      <section className="rounded-3xl bg-neutral-900 p-5 text-white">
        <div className="text-xs text-white/70">실수령액(예상)</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          {formatWon(result.net)}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="기본급(월)" value={formatWon(result.breakdown.basePay)} />
          <Row label="수당(합계)" value={formatWon(result.allowanceTotal)} />
          <div className="my-2 h-px bg-white/10" />
          <Row label="공제(합계)" value={formatWon(result.deductionTotal)} />
        </div>
      </section>

      <div className="ml-3 text-xs text-neutral-500">
        * 실수령액은 예상액입니다.
        <br />
        (자동 계산된 수당과 공제는 참고용이며 실제 지급액과 다를 수 있습니다.)
      </div>

      {/* 데이터 저장 */}
      <section className="mt-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">
            계산 데이터 저장
          </div>

          <button
            type="button"
            onClick={() => {
              const ok = confirm("현재 계산 데이터를 저장하시겠습니까?");
              if (!ok) return;

              const next = addHistorySnapshot(inputs);
              setHistory(next);
              setSelectedId(next[0]?.id ?? null);

              alert("저장되었습니다.");
            }}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            저장하기
          </button>
        </div>

        <div className="mt-2 text-[11px] text-neutral-500">
          현재 계산된 입력값을 저장하고 이전 기록에서 다시 불러올 수 있습니다.
        </div>
      </section>

      {/* 하단 광고 */}
      <section className="pt-2">
        <div className="mt-2 h-px bg-neutral-100" />
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot slot="8421356790" height={50} />
          </div>
        </div>
      </section>

      <div className="h-2" />
    </div>
  );
}

function makeInitialInputsSafe(series: SeriesKey = "general" as SeriesKey): SalaryInputs {
  return {
    series,
    columnKey: getFirstColumnKey(series) || "g9",
    step: 1,
    yearsOfService: 1,

    family_spouse: 0,
    family_children: 0,
    family_dependents: 0,

    allow_pwu_mode: "manual",
    allow_pwu_manual: 0,

    allow_long_service_bonus_mode: "manual",
    allow_long_service_bonus_manual: 0,

    allow_long_service_add_mode: "manual",
    allow_long_service_add_manual: 0,

    allow_performance_manual: 0,

    allow_family_mode: "manual",
    allow_family_manual: 0,

    allow_child_edu_manual: 0,
    allow_housing_manual: 0,
    allow_parental_leave_manual: 0,

    allow_remote_area_type: "NONE",
    allow_remote_area_add_manual: 0,

    allow_risk_mode: "auto",
    allow_risk_manual: 0,
    risk_type: "NONE",
    risk_other_manual: 0,

    allow_special_task_mode: "manual",
    allow_special_task_manual: 0,

    allow_substitute_mode: "manual",
    allow_substitute_manual: 0,

    allow_military_law_mode: "manual",
    allow_military_law_manual: 0,

    overtime_hours: 0,
    night_hours: 0,
    holiday_days: 0,

    allow_overtime_mode: "auto",
    allow_overtime_manual: 0,

    allow_night_mode: "auto",
    allow_night_manual: 0,

    allow_holiday_mode: "auto",
    allow_holiday_manual: 0,

    allow_management_mode: "auto",
    allow_management_manual: 0,

    allow_meal_mode: "auto",
    allow_meal_manual: 0,

    allow_position_mode: "auto",
    allow_position_manual: 0,

    allow_holiday_bonus_mode: "manual",
    allow_holiday_bonus_manual: 0,

    allow_leave_comp_mode: "manual",
    allow_leave_comp_manual: 0,

    allow_other_manual: 0,
    leave_comp_days: 0,

    bosuMonthly_mode: "manual",
    bosuMonthly_manual: 0,

    standardMonthly_mode: "manual",
    standardMonthly_manual: 0,

    employment: 0,
    incomeTax_mode: "auto",
    incomeTax_manual: 0,
    localTax_mode: "auto",
    localTax_manual: 0,
    taxFreeMonthly_manual: 0,
    otherDeduction: 0,

    management_excluded: false,
  };
}