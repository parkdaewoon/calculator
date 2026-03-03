// lib/payTables/index.ts
import { generalPayTable } from "./general";
import { professionalPayTable } from "./professional";

// ✅ 추가 테이블들
import { publicSafetyPayTable } from "./publicSafety";
import { researchPayTable } from "./research";
import { guidancePayTable } from "./guidance";
import { postalPayTable } from "./postal";
import { policeFirePayTable } from "./policeFire";
import { teachersPayTable } from "./teachers";
import { nationalUnivPayTable } from "./nationalUniv";
import { militaryPayTable } from "./military";
import { constitutionalPayTable } from "./constitutional";

export type PayTableId =
  | "general"
  | "professional"
  | "publicSafety"
  | "research"
  | "guidance"
  | "postal"
  | "policeFire"
  | "teachers"
  | "nationalUniv"
  | "military"
  | "constitutional";

export type PayTableColumn = { key: string; label: string };

export type PayTableDef = {
  id: PayTableId;
  title: string;
  unit: "KRW_PER_MONTH";
  columns: PayTableColumn[];
  rows: Array<Array<number | null>>;
  maxStep: number;
  columnLabel?: string;
};

export const PAY_TABLES: Record<PayTableId, PayTableDef> = {
  general: generalPayTable,
  professional: professionalPayTable,

  publicSafety: publicSafetyPayTable,
  research: researchPayTable,
  guidance: guidancePayTable,
  postal: postalPayTable,
  policeFire: policeFirePayTable,
  teachers: teachersPayTable,
  nationalUniv: nationalUnivPayTable,
  military: militaryPayTable,
  constitutional: constitutionalPayTable,
};

export function getPay(tableId: PayTableId, columnKey: string, step: number) {
  const t = PAY_TABLES[tableId];
  const colIndex = t.columns.findIndex((c) => c.key === columnKey);
  if (colIndex < 0) return null;

  const idx = step - 1;
  if (idx < 0 || idx >= t.rows.length) return null;

  return t.rows[idx]?.[colIndex] ?? null;
}