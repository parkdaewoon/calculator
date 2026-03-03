// lib/allowances/index.ts  (⭐ 루트)
export * from "./types";
export { allowanceGroups } from "./groups";
export { getAllowanceDefinition } from "./registry";

// ✅ 계산기 함수들은 calculator 폴더에서 한 번에 내보내기
export * from "./calculator";