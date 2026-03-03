import type { PayTableDef } from "./index";

export const constitutionalPayTable: PayTableDef = {
  id: "constitutional",
  title: "헌법연구관/보",
  unit: "KRW_PER_MONTH",
  columnLabel: "봉급",
  maxStep: 16,
  columns: [{ key: "pay", label: "봉급" }],
  rows: [
    [3660300],
    [4124400],
    [4475100],
    [4826500],
    [5190400],
    [5551500],
    [5926200],
    [6325100],
    [6787700],
    [7176100],
    [7408400],
    [7606000],
    [8015800],
    [8501100],
    [9042400],
    [9586300],
  ],
};