"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AdsenseSlot from "@/components/AdsenseSlot";

import SalaryMenuGrid, { SalaryTabKey } from "@/components/Salary/SalaryTabs";
import PayTableSection from "@/components/Salary/PayTableSection";
import AllowanceSection from "@/components/Salary/AllowanceSection";
import TravelSection from "@/components/Salary/TravelSection";

import { PAY_TABLES, getPay, type PayTableId } from "@/lib/payTables"; // ✅ PAY_TABLES 추가
import {
  calcPwuAllowance,
  calcRegularBonus,
  calcRegularAdd,
  calcFamilyAllowance,
  calcOvertimeAllowance,
  calcNightAllowance,
  calcHolidayAllowance,
  calcMealAllowance,
} from "@/lib/allowances/calculator";
import { calcPositionAllowanceMonthly } from "@/lib/allowances/calculator/expense/position";
import { calcHolidayBonusOnce } from "@/lib/allowances/calculator/expense/holiday";
import { calcLeaveCompensation } from "@/lib/allowances/calculator/expense/leave";
import {
  calcMonthlySalaryForDeductions,
  calcHealthInsurance,
  calcLongTermCare,
  calcPensionContribution,
} from "@/lib/allowances/calculator/deductions";
import { calcTaxesMonthly } from "@/lib/allowances/calculator/tax";

type SeriesKey = PayTableId;
type MoneyMode = "auto" | "manual";

type SalaryInputs = {
  series: SeriesKey;
  columnKey: string; // ✅ grade:number -> columnKey:string
  step: number; // 1~31
  yearsOfService: number; // 근무연수(추후 확장)

  // ===== 가계보전수당 입력(선택) =====
  family_spouse: number; // 0~1
  family_children: number; // 0~10
  family_dependents: number; // 0~10

  // ===== 상여수당 =====
  allow_pwu_mode: MoneyMode; // (자동) 대우공무원수당
  allow_pwu_manual: number;

  allow_long_service_bonus_mode: MoneyMode; // (자동) 정근수당
  allow_long_service_bonus_manual: number;

  allow_long_service_add_mode: MoneyMode; // (자동) 정근수당가산금
  allow_long_service_add_manual: number;

  allow_performance_manual: number; // (수동) 성과상여금

  // ===== 가계보전수당 =====
  allow_family_mode: MoneyMode; // (자동) 가족수당 (가족정보 반영)
  allow_family_manual: number;

  allow_child_edu_manual: number; // (수동) 자녀학비보조수당
  allow_housing_manual: number; // (수동) 주택수당
  allow_parental_leave_manual: number; // (수동) 육아휴직수당

  // ===== 특수지근무수당 =====
  allow_remote_area_type: "NONE" | "GA" | "NA" | "DA" | "RA"; // 가/나/다/라
  allow_remote_area_add_manual: number; // 가산금(직접 입력)

  // ===== 특수근무수당 =====
  allow_risk_mode: MoneyMode; // (자동) 위험근무수당
  allow_risk_manual: number;

  // 기존: risk_type: "NONE" | "A" | "B" | "C";
  risk_type: "NONE" | "A" | "B" | "C" | "OTHER";
  risk_other_manual: number; // 기타 선택 시 직접 입력

  allow_special_task_mode: MoneyMode; // (자동) 특수업무수당
  allow_special_task_manual: number;

  allow_substitute_mode: MoneyMode; // (자동) 업무대행수당
  allow_substitute_manual: number;

  allow_military_law_mode: MoneyMode; // (자동) 군법무관수당
  allow_military_law_manual: number;

  // ===== 초과근무수당 등 =====
  overtime_hours: number; // (자동) 시간외수당 - 시간 입력
  night_hours: number; // (자동) 야간수당 - 시간 입력
  holiday_days: number; // ✅ (자동) 휴일근무수당 - 일수 입력

  allow_overtime_mode: MoneyMode;
  allow_overtime_manual: number;

  allow_night_mode: MoneyMode;
  allow_night_manual: number;

  allow_holiday_mode: MoneyMode;
  allow_holiday_manual: number;

  allow_management_mode: MoneyMode; // (자동) 관리업무수당
  allow_management_manual: number;

  // ===== 실비변상 등 =====
  allow_meal_mode: MoneyMode; // (자동) 정액급식비
  allow_meal_manual: number;

  allow_position_mode: MoneyMode; // (자동) 직급보조비
  allow_position_manual: number;

  allow_holiday_bonus_mode: MoneyMode; // (자동) 명절휴가비
  allow_holiday_bonus_manual: number;

  allow_leave_comp_mode: MoneyMode; // (자동) 연가보상비
  allow_leave_comp_manual: number;

  allow_other_manual: number;
  leave_comp_days: number;

  // ===== 공제(보수월액/기준소득월액: 자동/직접) =====
  bosuMonthly_mode: MoneyMode; // 보수월액(자동/직접)
  bosuMonthly_manual: number;

  standardMonthly_mode: MoneyMode; // 기준소득월액(자동/직접)
  standardMonthly_manual: number;

  // ===== 공제(수동 유지) =====
  employment: number;

  // (유지) 세금은 계산에서 pick은 남겨두되, UI 토글은 제거
  incomeTax_mode: MoneyMode;
  incomeTax_manual: number;
  localTax_mode: MoneyMode;
  localTax_manual: number;

  // 세금 계산용 추가 비과세 월액(정액급식비 외 직접 입력)
  taxFreeMonthly_manual: number;

  otherDeduction: number;
  management_excluded: boolean;
};

type SalaryBreakdown = {
  basePay: number;

  // 상여수당
  allow_pwu: number;
  allow_long_service_bonus: number;
  allow_long_service_add: number;
  allow_performance: number;

  // 가계보전수당
  allow_family: number;
  allow_child_edu: number;
  allow_housing: number;
  allow_parental_leave: number;

  // 특수지근무수당
  allow_remote_area: number;

  // 특수근무수당
  allow_risk: number;
  allow_special_task: number;
  allow_substitute: number;
  allow_military_law: number;

  // 초과근무수당 등
  allow_overtime: number;
  allow_night: number;
  allow_holiday: number;
  allow_management: number;

  // 실비변상 등
  allow_meal: number;
  allow_position: number;
  allow_holiday_bonus: number;
  allow_leave_comp: number;

  // deductions
  pension: number; // ✅ 기준소득월액 기준
  health: number; // ✅ 보수월액 기준
  care: number; // ✅ 건강보험료 기준
  employment: number;
  incomeTax: number;
  localTax: number;
  otherDeduction: number;
};

type SalaryResult = {
  breakdown: SalaryBreakdown;
  allowanceTotal: number;
  deductionTotal: number;
  gross: number;
  net: number;
  _debug?: {
    bosuMonthlyAuto: number;
    standardMonthlyAuto: number;
  };
};

function getFirstColumnKey(series: SeriesKey) {
  return PAY_TABLES[series]?.columns?.[0]?.key ?? "";
}

function getSafeColumnKey(series: SeriesKey, columnKey: string) {
  const t = PAY_TABLES[series];
  const first = t?.columns?.[0]?.key ?? "";
  if (!t || !first) return columnKey || first;
  return t.columns.some((c) => c.key === columnKey) ? columnKey : first;
}

// (선택) columnKey에서 “급(숫자)”를 뽑아내서 기존 자동 계산(직급보조비 등)에 사용
function columnKeyToGradeGuess(series: SeriesKey, columnKey: string): number {
  const label =
    PAY_TABLES[series]?.columns?.find((c) => c.key === columnKey)?.label ?? "";

  // 1) key에서 g9 같은 숫자 추출
  const m1 = String(columnKey).match(/\d+/);
  if (m1) {
    const n = Number(m1[0]);
    if (Number.isFinite(n) && n >= 1 && n <= 9) return n;
  }

  // 2) label에서 "9급" 추출
  const m2 = label.match(/([1-9])\s*급/);
  if (m2) return Number(m2[1]);

  // 못 찾으면 9로 fallback (원래 UX)
  return 9;
}
function makeInitialInputs(series: SeriesKey = "general" as SeriesKey): SalaryInputs {
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

    allow_overtime_mode: "manual",
    allow_overtime_manual: 0,

    allow_night_mode: "manual",
    allow_night_manual: 0,

    allow_holiday_mode: "manual",
    allow_holiday_manual: 0,

    allow_management_mode: "manual",
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
export default function SalaryCalculator() {
  const [active, setActive] = useState<SalaryTabKey | null>(null);
  const [inputs, setInputs] = useState<SalaryInputs>(() => makeInitialInputs());
    const pathname = usePathname();

  useEffect(() => {
    // ✅ 다른 화면(다른 route)으로 이동하면 초기화
    setInputs(makeInitialInputs());
    setActive(null);
  }, [pathname]);
  // ✅ series/columnKey가 어긋나도 안전하게 보정
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

  const title =
    active === "payTable"
      ? "봉급표"
      : active === "allowances"
      ? "수당제도"
      : active === "travel"
      ? "여비제도"
      : active === "calculator"
      ? "실수령 계산"
      : "봉급·수당·여비";

  return (
    <div className="space-y-5">
      <section className="pt-1">
        <div className="text-[11px] tracking-[0.25em] text-neutral-400">
          NOTE KOREAN OFFICER
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight">
            {title}
            <br />
          </h1>

          {active ? (
            <button
              type="button"
              onClick={() => {
  setActive(null);
  setInputs(makeInitialInputs()); // ✅ 입력값 초기화
}}
              className="shrink-0 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              전체 메뉴
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-neutral-500">
          직렬·직급·호봉으로 기본급을 자동 계산하고,
          <br />
          수당·공제를 입력해 실수령액(예상)을 확인하세요.
        </p>
      </section>

      {!active && (
  <SalaryMenuGrid
    onSelect={(next) => {
      setInputs(makeInitialInputs()); // ✅ 이동할 때 초기화
      setActive(next);
    }}
  />
)}

      {active === "payTable" && (
        <PayTableSection
          series={safeInputs.series}
          columnKey={safeInputs.columnKey} // ✅ grade -> columnKey
          step={safeInputs.step}
          onChangeSeries={(series: SeriesKey) =>
            setInputs((p) => ({
              ...p,
              series,
              columnKey: getFirstColumnKey(series) || p.columnKey, // ✅ 표 바꾸면 첫 직급으로
              step: 1,
            }))
          }
          onChangeColumnKey={(columnKey: string) =>
            setInputs((p) => ({ ...p, columnKey }))
          }
          onChangeStep={(step: number) => setInputs((p) => ({ ...p, step }))}
        />
      )}

      {active === "allowances" && <AllowanceSection />}
      {active === "travel" && <TravelSection />}

      {active === "calculator" && (
        <>
          {/* 1) 기본 정보 */}
          <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">
                기본 정보
              </div>
              <div className="text-xs text-neutral-400">자동 산출</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="직렬">
                <select
                  value={safeInputs.series}
                  onChange={(e) => {
                    const series = e.target.value as SeriesKey;
                    setInputs((p) => ({
                      ...p,
                      series,
                      columnKey: getFirstColumnKey(series) || p.columnKey,
                      step: 1,
                    }));
                  }}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  {Object.keys(PAY_TABLES).map((id) => {
                    const key = id as SeriesKey;
                    return (
                      <option key={key} value={key}>
                        {PAY_TABLES[key]?.title ?? key}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="직급">
                <select
                  value={safeInputs.columnKey}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, columnKey: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  {(PAY_TABLES[safeInputs.series]?.columns ?? []).map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="호봉(1~31)">
                <input
                  type="number"
                  min={1}
                  max={PAY_TABLES[safeInputs.series]?.maxStep ?? 31}
                  value={safeInputs.step}
                  onChange={(e) =>
                    setInputs((p) => ({
                      ...p,
                      step: clampInt(
                        e.target.value,
                        1,
                        PAY_TABLES[safeInputs.series]?.maxStep ?? 31
                      ),
                    }))
                  }
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </Field>

              <Field label="근무연수">
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={safeInputs.yearsOfService}
                  onChange={(e) =>
                    setInputs((p) => ({
                      ...p,
                      yearsOfService: clampInt(e.target.value, 0, 40),
                    }))
                  }
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
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
              <div className="text-sm font-semibold text-neutral-900">
                수당(월)
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {/* 상여수당 */}
              <AllowanceGroup title="상여수당" defaultOpen>
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

              {/* 가계보전수당 */}
              <AllowanceGroup title="가계보전수당">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs font-medium text-neutral-900">
                    가족 정보
                  </div>
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

              {/* 특수지근무수당 */}
              <AllowanceGroup title="특수지근무수당">
                <div className="rounded-2xl border border-neutral-200 p-3">
                  <div className="text-sm text-neutral-900">특수지근무수당</div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="block">
                      <div className="text-xs text-neutral-500">
                        구분(가나다라군)
                      </div>
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

                    <label className="block col-span-2">
                      <div className="text-xs text-neutral-500">
                        가산금(직접 입력)
                      </div>
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
                      <div className="text-xs text-neutral-500">
                        특수지근무수당 합계
                      </div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900">
                        {formatWon(
                          result.breakdown.allow_remote_area +
                            safeInputs.allow_remote_area_add_manual
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AllowanceGroup>

              {/* 특수근무수당 */}
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

        // ✅ 갑/을/병 선택하면 자동 금액이 보이고 합산되게
        allow_risk_mode: isOther ? "manual" : "auto",

        // ✅ OTHER가 아니면 기타금액은 0으로 정리
        risk_other_manual: isOther ? p.risk_other_manual : 0,

        // (선택) OTHER면 allow_risk_manual을 기타금액으로 맞춰두면 더 직관적
        allow_risk_manual: isOther ? (p.risk_other_manual ?? 0) : 0,
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
      allow_risk_manual: v, // ✅ 기타 입력 = 실제 합산 값
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

              {/* 초과근무수당 등 */}
              <AllowanceGroup title="초과근무수당 등">
                <AutoTimeMoneyLine
                  label="시간외수당"
                  mode={safeInputs.allow_overtime_mode}
                  hours={safeInputs.overtime_hours}
                  onHoursChange={(h) =>
                    setInputs((p) => ({ ...p, overtime_hours: h }))
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
                    setInputs((p) => ({ ...p, night_hours: h }))
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
                    setInputs((p) => ({ ...p, holiday_days: d }))
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
                    checked={safeInputs.management_excluded}
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

              {/* 실비변상 등 */}
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

              {/* ✅ 기타 수당 */}
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

              {/* 수당계 */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500">수당계</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">
                  {formatWon(result.allowanceTotal)}
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                * 입력값과 자동 계산은 참고용이며, 실제 지급 수당과 차이가 있을 수
                있습니다. 급여명세서·관련 규정을 확인해 주세요.
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

              <MoneyInput
                label="추가 비과세 월액(세금계산용)"
                value={safeInputs.taxFreeMonthly_manual}
                onChange={(v) =>
                  setInputs((p) => ({ ...p, taxFreeMonthly_manual: v }))
                }
              />

              <ReadOnlyMoneyLine label="일반기여금" value={result.breakdown.pension} />
              <ReadOnlyMoneyLine label="건강보험료" value={result.breakdown.health} />
              <ReadOnlyMoneyLine label="장기요양보험료" value={result.breakdown.care} />
              <ReadOnlyMoneyLine label="소득세(간이)" value={result.breakdown.incomeTax} />
              <ReadOnlyMoneyLine label="지방소득세" value={result.breakdown.localTax} />

              <MoneyInput
                label="기타공제"
                value={safeInputs.otherDeduction}
                onChange={(v) => setInputs((p) => ({ ...p, otherDeduction: v }))}
              />

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500">공제(합계)</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">
                  {formatWon(result.deductionTotal)}
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                * 간이세액표, 예상 보수월액 및 기준소득월액을 참고하여 산정한 값으로 실제 공제액과 다를 수 있습니다.
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

          <div className="text-xs text-neutral-500">
            * 실수령액은 입력값 기반 “예상”입니다. (보수월액/기준소득월액만 필요 시
            “직접”으로 수정 가능)
          </div>
        </>
      )}

      {/* 하단 광고 */}
      <section className="pt-2 pb-2">
        <div className="h-px bg-neutral-100" />
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot height={90} />
          </div>
        </div>
      </section>

      <div className="h-2" />
    </div>
  );
}

/** =========================
 *  계산
 *  ========================= */
function calcSalary(inputs: SalaryInputs): SalaryResult {
  const basePay = getBasePay(inputs);

  // ✅ 자동 계산에서 grade가 필요하면 columnKey에서 추정
  const gradeGuess = columnKeyToGradeGuess(inputs.series, inputs.columnKey);

  // ===== 자동값 =====
  const auto_pwu = getAutoPwu(inputs, basePay, gradeGuess);
  const auto_long_bonus = getAutoLongServiceBonus(inputs, basePay);
  const auto_long_add = getAutoLongServiceAdd(inputs);

  const auto_family = getAutoFamilyAllowance(inputs);

  const auto_risk = getAutoRisk(inputs);
  const auto_special_task = getAutoSpecialTask(inputs);
  const auto_substitute = getAutoSubstitute(inputs);
  const auto_military_law = getAutoMilitaryLaw(inputs);

  // 1) 관리업무수당
  const auto_management = getAutoManagement(inputs, basePay);

  // 2) 차단 조건
  const isGrade4OrAbove = gradeGuess <= 4;
  const willGetManagement = auto_management > 0;
  const blockExtra = isGrade4OrAbove || willGetManagement;

  // 3) 초과/야간/휴일
  const auto_overtime = blockExtra ? 0 : getAutoOvertime(inputs);
  const auto_night = blockExtra ? 0 : getAutoNight(inputs);
  const auto_holiday = blockExtra ? 0 : getAutoHoliday(inputs);

  const auto_meal = getAutoMeal();
  const auto_position = getAutoPosition(gradeGuess);
  const auto_holiday_bonus = getAutoHolidayBonus(inputs, basePay);
  const auto_leave_comp = getAutoLeaveComp(inputs, basePay);

  // ===== auto/manual 적용 =====
  const allow_pwu = pick(inputs.allow_pwu_mode, auto_pwu, inputs.allow_pwu_manual);
  const allow_long_service_bonus = pick(
    inputs.allow_long_service_bonus_mode,
    auto_long_bonus,
    inputs.allow_long_service_bonus_manual
  );
  const allow_long_service_add = pick(
    inputs.allow_long_service_add_mode,
    auto_long_add,
    inputs.allow_long_service_add_manual
  );

  const allow_performance = inputs.allow_performance_manual;

  const allow_family = pick(
    inputs.allow_family_mode,
    auto_family,
    inputs.allow_family_manual
  );
  const allow_child_edu = inputs.allow_child_edu_manual;
  const allow_housing = inputs.allow_housing_manual;
  const allow_parental_leave = inputs.allow_parental_leave_manual;

  const remoteBase =
    inputs.allow_remote_area_type === "GA"
      ? 60_000
      : inputs.allow_remote_area_type === "NA"
      ? 50_000
      : inputs.allow_remote_area_type === "DA"
      ? 40_000
      : inputs.allow_remote_area_type === "RA"
      ? 30_000
      : 0;

  const allow_remote_area = remoteBase + (inputs.allow_remote_area_add_manual ?? 0);

  const allow_risk = pick(inputs.allow_risk_mode, auto_risk, inputs.allow_risk_manual);
  const allow_special_task = pick(
    inputs.allow_special_task_mode,
    auto_special_task,
    inputs.allow_special_task_manual
  );
  const allow_substitute = pick(
    inputs.allow_substitute_mode,
    auto_substitute,
    inputs.allow_substitute_manual
  );
  const allow_military_law = pick(
    inputs.allow_military_law_mode,
    auto_military_law,
    inputs.allow_military_law_manual
  );

  const allow_overtime = pick(
    inputs.allow_overtime_mode,
    auto_overtime,
    inputs.allow_overtime_manual
  );
  const allow_night = pick(
    inputs.allow_night_mode,
    auto_night,
    inputs.allow_night_manual
  );
  const allow_holiday = pick(
    inputs.allow_holiday_mode,
    auto_holiday,
    inputs.allow_holiday_manual
  );
  const allow_management = pick(
    inputs.allow_management_mode,
    auto_management,
    inputs.allow_management_manual
  );

  const allow_meal = pick(inputs.allow_meal_mode, auto_meal, inputs.allow_meal_manual);
  const allow_position = pick(
    inputs.allow_position_mode,
    auto_position,
    inputs.allow_position_manual
  );
  const allow_holiday_bonus = pick(
    inputs.allow_holiday_bonus_mode,
    auto_holiday_bonus,
    inputs.allow_holiday_bonus_manual
  );
  const allow_leave_comp = pick(
    inputs.allow_leave_comp_mode,
    auto_leave_comp,
    inputs.allow_leave_comp_manual
  );

  const allowanceTotal = sum(
    allow_pwu,
    allow_long_service_bonus,
    allow_long_service_add,
    allow_performance,

    allow_family,
    allow_child_edu,
    allow_housing,
    allow_parental_leave,

    allow_remote_area,

    allow_risk,
    allow_special_task,
    allow_substitute,
    allow_military_law,

    allow_overtime,
    allow_night,
    allow_holiday,
    allow_management,

    allow_meal,
    allow_position,
    allow_holiday_bonus,
    allow_leave_comp,

    inputs.allow_other_manual
  );

  // ✅ 공제용 보수월액(사이트 규칙) 계산
  const bosuMonthlyAuto = calcMonthlySalaryForDeductions({
    basePay,

    allow_pwu,
    allow_family,
    allow_child_edu,
    allow_housing,
    allow_parental_leave,

    allow_remote_area,
    allow_risk,
    allow_special_task,
    allow_substitute,
    allow_military_law,

    allow_management,
    allow_meal,
    allow_position,
  });

  // ✅ 보수월액: 자동/직접
  const bosuMonthlyPicked = pick(
    inputs.bosuMonthly_mode,
    bosuMonthlyAuto,
    inputs.bosuMonthly_manual
  );

  // ✅ 기준소득월액(자동): "보수월액의 10% 가산"
  // - 보수월액을 직접입력해도, 기준소득월액이 자동이면 그 값 기준으로 10% 가산
  const standardMonthlyAuto = Math.trunc(bosuMonthlyPicked * 1.1);

  // ✅ 기준소득월액: 자동/직접
  const standardMonthlyPicked = pick(
    inputs.standardMonthly_mode,
    standardMonthlyAuto,
    inputs.standardMonthly_manual
  );

  // ✅ 핵심 수정
  // - 일반기여금(연금 기여금): 기준소득월액 기준
  // - 건강보험료: 보수월액 기준
  const auto_pension = calcPensionContribution(standardMonthlyPicked);
  const auto_health = calcHealthInsurance(bosuMonthlyPicked);
  const auto_care = calcLongTermCare(auto_health);

  const pension = auto_pension;
  const health = auto_health;
  const care = auto_care;

  const gross = basePay + allowanceTotal;

  // ✅ (세금 자동) 간이세액표 기준 소득세/지방세 계산
  const monthlyGrossPay = gross;
  // 정액급식비는 비과세, 직급보조비는 과세
  const monthlyTaxFree = Math.max(
    0,
    Math.trunc(allow_meal + (inputs.taxFreeMonthly_manual || 0))
  );

  const tax = calcTaxesMonthly({
    monthlyGrossPay,
    monthlyTaxFree,
    monthlyScholarship: 0,
    family: {
      spouse: inputs.family_spouse,
      children: inputs.family_children,
      dependents: inputs.family_dependents,
    },
  });

  const auto_incomeTax = tax.incomeTax;
  const auto_localTax = tax.localIncomeTax;

  const incomeTax = pick(
    inputs.incomeTax_mode,
    auto_incomeTax,
    inputs.incomeTax_manual
  );
  const localTax = pick(
    inputs.localTax_mode,
    auto_localTax,
    inputs.localTax_manual
  );

  const deductionTotal = sum(
    pension,
    health,
    care,
    inputs.employment,
    incomeTax,
    localTax,
    inputs.otherDeduction
  );

  const net = gross - deductionTotal;

  return {
    breakdown: {
      basePay,

      allow_pwu,
      allow_long_service_bonus,
      allow_long_service_add,
      allow_performance,

      allow_family,
      allow_child_edu,
      allow_housing,
      allow_parental_leave,

      allow_remote_area,

      allow_risk,
      allow_special_task,
      allow_substitute,
      allow_military_law,

      allow_overtime,
      allow_night,
      allow_holiday,
      allow_management,

      allow_meal,
      allow_position,
      allow_holiday_bonus,
      allow_leave_comp,

      pension,
      health,
      care,
      employment: inputs.employment,
      incomeTax,
      localTax,
      otherDeduction: inputs.otherDeduction,
    },
    allowanceTotal,
    deductionTotal,
    gross,
    net,
    _debug: {
      bosuMonthlyAuto,
      standardMonthlyAuto,
    },
  };
}

function pick(mode: MoneyMode, autoValue: number, manualValue: number) {
  return mode === "auto" ? autoValue : manualValue;
}

/**
 * ✅ 봉급표 lookup (완전 호환)
 */
function getBasePay(inputs: SalaryInputs): number {
  const v = getPay(inputs.series, inputs.columnKey, inputs.step);
  return typeof v === "number" ? v : 0;
}

function getAutoPwu(inputs: SalaryInputs, basePay: number, gradeGuess: number) {
  return calcPwuAllowance({
    series: inputs.series,
    grade: gradeGuess,
    step: inputs.step,
    basePay,
  });
}

function getAutoLongServiceBonus(inputs: SalaryInputs, basePay: number) {
  return calcRegularBonus(basePay, inputs.yearsOfService);
}
function getAutoLongServiceAdd(inputs: SalaryInputs) {
  const isMilitary = inputs.series === "military"; // ✅ 너 PayTableId에서 군인 키 이름에 맞게 수정
  return calcRegularAdd(inputs.yearsOfService, "MONTHLY", isMilitary);
}
function getAutoFamilyAllowance(inputs: SalaryInputs) {
  return calcFamilyAllowance({
    spouse: inputs.family_spouse,
    children: inputs.family_children,
    dependents: inputs.family_dependents,
  });
}
function getAutoRisk(inputs: SalaryInputs) {
  if (inputs.risk_type === "A") return 60_000;
  if (inputs.risk_type === "B") return 50_000;
  if (inputs.risk_type === "C") return 40_000;
  if (inputs.risk_type === "OTHER") return inputs.risk_other_manual ?? 0;
  return 0;
}
function getAutoSpecialTask(_: SalaryInputs) {
  return 0; // TODO
}
function getAutoSubstitute(_: SalaryInputs) {
  return 0; // TODO
}
function getAutoMilitaryLaw(_: SalaryInputs) {
  return 0; // TODO
}

function getAutoOvertime(inputs: SalaryInputs) {
  return calcOvertimeAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    hours: inputs.overtime_hours,
    kind: "OVERTIME",
  });
}

function getAutoNight(inputs: SalaryInputs) {
  return calcNightAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    hours: inputs.night_hours,
  });
}

function getAutoHoliday(inputs: SalaryInputs) {
  return calcHolidayAllowance({
    series: inputs.series,
    columnKey: inputs.columnKey,
    days: inputs.holiday_days,
  });
}
function getAutoManagement(inputs: SalaryInputs, basePay: number) {
  if (inputs.management_excluded) return 0;

  // TODO: 직렬(series)별 비율 결정
  return 0;
}

function getAutoMeal() {
  return calcMealAllowance();
}
function getAutoPosition(gradeGuess: number) {
  return calcPositionAllowanceMonthly({
    series: "general" as any, // ✅ inputs.series를 넘기려면 함수 인자에 inputs도 받게 바꿔
    gradeGuess,
  });
}
function getAutoHolidayBonus(_: SalaryInputs, basePay: number) {
  return calcHolidayBonusOnce({ basePay });
}
function getAutoLeaveComp(inputs: SalaryInputs, basePay: number) {
  return calcLeaveCompensation({
    basePay,
    days: inputs.leave_comp_days ?? 0,
  });
}

/** =========================
 *  UI helpers
 *  ========================= */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      {children}
    </label>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <input
        inputMode="numeric"
        value={formatNumberInput(value ?? 0)}
        onChange={(e) => onChange(clampInt(e.target.value, 0, 1_000_000_000))}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-white/75">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

/** ====== 공제 표시(토글 없음) ====== */
function ReadOnlyMoneyLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="text-sm text-neutral-900">{label}</div>
      <div className="mt-2 text-sm font-semibold text-neutral-900">
        {formatWon(value)}
      </div>
    </div>
  );
}

/** ====== 수당 UI (아코디언/라인) ====== */
function AllowanceGroup({
  title,
  rightHint,
  defaultOpen = false,
  children,
}: {
  title: string;
  rightHint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="flex items-center gap-2">
          {rightHint ? (
            <span className="text-xs text-neutral-400">{rightHint}</span>
          ) : null}
          <span className="text-neutral-400">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open ? <div className="px-4 pb-4 space-y-2">{children}</div> : null}
    </div>
  );
}

function AutoMoneyLine({
  label,
  mode,
  autoValue,
  manualValue,
  onModeChange,
  onManualChange,
}: {
  label: string;
  mode: MoneyMode;
  autoValue: number;
  manualValue: number;
  onModeChange: (m: MoneyMode) => void;
  onManualChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-900">{label}</div>
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          <ModePill
            active={mode === "auto"}
            label="자동"
            onClick={() => onModeChange("auto")}
          />
          <ModePill
            active={mode === "manual"}
            label="직접"
            onClick={() => onModeChange("manual")}
          />
        </div>
      </div>

      <div className="mt-2">
        {mode === "auto" ? (
          <div className="text-sm font-semibold text-neutral-900">
            {formatWon(autoValue)}
          </div>
        ) : (
          <input
            inputMode="numeric"
            value={formatNumberInput(manualValue)}
            onChange={(e) =>
              onManualChange(clampInt(e.target.value, 0, 1_000_000_000))
            }
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        )}
      </div>
    </div>
  );
}

function ManualMoneyLine({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 p-3">
      <div className="text-sm text-neutral-900">{label}</div>
      <input
        inputMode="numeric"
        value={formatNumberInput(value)}
        onChange={(e) => onChange(clampInt(e.target.value, 0, 1_000_000_000))}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}

function AutoTimeMoneyLine({
  label,
  mode,
  hours,
  onHoursChange,
  autoValue,
  manualValue,
  onModeChange,
  onManualChange,
}: {
  label: string;
  mode: MoneyMode;
  hours: number;
  onHoursChange: (h: number) => void;
  autoValue: number;
  manualValue: number;
  onModeChange: (m: MoneyMode) => void;
  onManualChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-900">{label}</div>
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          <ModePill active={mode === "auto"} label="자동" onClick={() => onModeChange("auto")} />
          <ModePill active={mode === "manual"} label="직접" onClick={() => onModeChange("manual")} />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <div className="text-xs text-neutral-500">시간</div>
          <input
            type="number"
            min={0}
            max={300}
            value={hours}
            onChange={(e) => onHoursChange(clampInt(e.target.value, 0, 300))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        {mode === "auto" ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">자동 금액</div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {formatWon(autoValue)}
            </div>
          </div>
        ) : (
          <label className="block">
            <div className="text-xs text-neutral-500">직접 금액</div>
            <input
              inputMode="numeric"
              value={formatNumberInput(manualValue)}
              onChange={(e) =>
                onManualChange(clampInt(e.target.value, 0, 1_000_000_000))
              }
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>
    </div>
  );
}

function ModePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "min-w-[44px] rounded-full px-3 py-1 text-[11px] transition",
        active ? "bg-white text-neutral-900 shadow-sm" : "bg-transparent text-neutral-500",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SelectInt({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-2 py-2 text-sm"
      >
        {Array.from({ length: max + 1 }, (_, i) => i).map((n) => (
          <option key={n} value={n}>
            {n}명
          </option>
        ))}
      </select>
    </label>
  );
}

function sum(...nums: number[]) {
  let total = 0;
  for (const n of nums) total += Number.isFinite(n) ? n : 0;
  return total;
}

function AutoDayMoneyLine({
  label,
  mode,
  days,
  onDaysChange,
  autoValue,
  manualValue,
  onModeChange,
  onManualChange,
}: {
  label: string;
  mode: MoneyMode;
  days: number;
  onDaysChange: (d: number) => void;
  autoValue: number;
  manualValue: number;
  onModeChange: (m: MoneyMode) => void;
  onManualChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-neutral-900">{label}</div>
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          <ModePill active={mode === "auto"} label="자동" onClick={() => onModeChange("auto")} />
          <ModePill active={mode === "manual"} label="직접" onClick={() => onModeChange("manual")} />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <div className="text-xs text-neutral-500">일수</div>
          <input
            type="number"
            min={0}
            max={31}
            value={days}
            onChange={(e) => onDaysChange(clampInt(e.target.value, 0, 31))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        {mode === "auto" ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500">자동 금액</div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {formatWon(autoValue)}
            </div>
          </div>
        ) : (
          <label className="block">
            <div className="text-xs text-neutral-500">직접 금액</div>
            <input
              inputMode="numeric"
              value={formatNumberInput(manualValue)}
              onChange={(e) =>
                onManualChange(clampInt(e.target.value, 0, 1_000_000_000))
              }
              className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>
    </div>
  );
}

/** =========================
 *  Number helpers
 *  ========================= */

// ✅ 입력칸 표시용(1만원 → 10,000)
function formatNumberInput(n: number) {
  if (!Number.isFinite(n)) return "";
  const v = Math.trunc(n);
  return v === 0 ? "" : v.toLocaleString("ko-KR");
}

function clampInt(v: string, min: number, max: number) {
  // ✅ 콤마 제거 후 숫자 파싱
  const cleaned = String(v).replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function formatWon(n: number) {
  const safe = Number.isFinite(n) ? Math.trunc(n) : 0;
  return `${safe.toLocaleString("ko-KR")}원`;
}