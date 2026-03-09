import { PAY_TABLES, type PayTableId } from "@/lib/payTables";

export type ManagementAllowanceCategory =
  | "GENERAL_4_OR_ABOVE"
  | "POLICE_FIRE_4_OR_ABOVE"
  | "RESEARCH_GUIDANCE"
  | "NATIONAL_UNIV_FACULTY"
  | "EDUCATION"
  | "NONE";

export type ManagementAllowanceArgs = {
  series: PayTableId | string;
  monthlyBasePay: number;
  gradeGuess?: number;
  excluded?: boolean;
};

export type ManagementAllowanceResult = {
  category: ManagementAllowanceCategory;
  rate: number;
  amount: number;
};

function roundWon(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((kw) => text.includes(kw));
}

function getSeriesText(series: PayTableId | string) {
  const idText = norm(series);
  const table = PAY_TABLES[series as PayTableId];
  const titleText = norm(table?.title);

  const columnLabels = (table?.columns ?? [])
    .map((c) => norm(c.label))
    .join(" ");

  return `${idText} ${titleText} ${columnLabels}`;
}

function isNationalUnivFaculty(text: string) {
  return (
    (
      includesAny(text, ["국립대", "국립대학교", "national", "univ", "university"]) &&
      includesAny(text, ["교원", "교수", "faculty", "professor"])
    ) ||
    includesAny(text, [
      "국립대학 교원",
      "국립대학교 교원",
      "national university faculty",
    ])
  );
}

function isResearchGuidance(text: string) {
  return includesAny(text, [
    "연구직",
    "지도직",
    "research",
    "guidance",
  ]);
}

function isEducation(text: string) {
  return includesAny(text, [
    "교육공무원",
    "교육직",
    "교원",
    "교사",
    "teacher",
    "education",
    "edu",
  ]);
}

function isPoliceFireGroup(text: string) {
  return includesAny(text, [
    "police",
    "fire",
    "경찰",
    "소방",
    "해양경찰",
    "의무경찰",
    "의경",
  ]);
}

function isGeneralGroup(text: string) {
  // 교육/연구/경찰소방이 아닌 일반 공무원 계열
  return includesAny(text, [
    "general",
    "일반직",
    "공안직",
    "행정직",
    "기술직",
    "일반",
    "공안",
    "행정",
    "기술",
  ]);
}

/**
 * 급수 추정이 실패해도, series/title/column label에
 * 4급·3급·2급·1급 또는 총경/소방정 이상 계열 표기가 있으면
 * 관리업무수당 대상으로 본다.
 */
function isFourOrAboveByText(text: string) {
  return (
    /(^|[^0-9])(1|2|3|4)\s*급/.test(text) ||
    includesAny(text, [
      "고위공무원",
      "고공단",
      "총경",
      "경무관",
      "치안감",
      "치안정감",
      "치안총감",
      "소방정",
      "소방준감",
      "소방감",
      "소방정감",
      "소방총감",
    ])
  );
}

function isFourOrAbove(gradeGuess?: number, text?: string) {
  if (typeof gradeGuess === "number" && gradeGuess >= 1 && gradeGuess <= 4) {
    return true;
  }
  return text ? isFourOrAboveByText(text) : false;
}

export function getManagementAllowanceCategory(
  series: PayTableId | string,
  gradeGuess?: number
): ManagementAllowanceCategory {
  const text = getSeriesText(series);

  // 1) 국립대 교원
  if (isNationalUnivFaculty(text)) {
    return "NATIONAL_UNIV_FACULTY";
  }

  // 2) 연구직/지도직
  if (isResearchGuidance(text)) {
    return "RESEARCH_GUIDANCE";
  }

  // 3) 교육공무원
  if (isEducation(text)) {
    return "EDUCATION";
  }

  // 4) 경찰·소방·의경 계열 4급 이상
  if (isPoliceFireGroup(text) && isFourOrAbove(gradeGuess, text)) {
    return "POLICE_FIRE_4_OR_ABOVE";
  }

  // 5) 일반직/공안직 등 4급 이상
  if (isGeneralGroup(text) && isFourOrAbove(gradeGuess, text)) {
    return "GENERAL_4_OR_ABOVE";
  }

  // 6) 혹시 일반직 title이 애매해도 4급 이상이면 일반 9%로 처리
  if (isFourOrAbove(gradeGuess, text)) {
    return "GENERAL_4_OR_ABOVE";
  }

  return "NONE";
}

export function getManagementAllowanceRate(
  category: ManagementAllowanceCategory
): number {
  switch (category) {
    case "GENERAL_4_OR_ABOVE":
      return 0.09;
    case "POLICE_FIRE_4_OR_ABOVE":
      return 0.09;
    case "RESEARCH_GUIDANCE":
      return 0.078;
    case "NATIONAL_UNIV_FACULTY":
      return 0.09;
    case "EDUCATION":
      return 0.078;
    default:
      return 0;
  }
}

export function calcManagementAllowanceMonthly(
  args: ManagementAllowanceArgs
): ManagementAllowanceResult {
  const monthlyBasePay = Number(args.monthlyBasePay ?? 0);
  const category = getManagementAllowanceCategory(args.series, args.gradeGuess);

  if (args.excluded) {
    return { category, rate: 0, amount: 0 };
  }

  if (!Number.isFinite(monthlyBasePay) || monthlyBasePay <= 0) {
    return { category, rate: 0, amount: 0 };
  }

  const rate = getManagementAllowanceRate(category);

  return {
    category,
    rate,
    amount: roundWon(monthlyBasePay * rate),
  };
}