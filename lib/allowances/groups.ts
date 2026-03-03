import type { AllowanceGroup } from "./types";

export const allowanceGroups: AllowanceGroup[] = [
  {
    title: "상여수당 (3종)",
    items: [
      {
        id: "bonus.pwu",
        name: "대우공무원수당",
        target: "대우공무원으로 선발된 공무원",
      },
      {
        id: "bonus.regular",
        name: "정근수당(정근수당가산금)",
        target:
          "지급기준일(1.1./7.1.) 현재 공무원의 신분을 보유하고 봉급이 지급되는 공무원",
      },
      {
        id: "bonus.performance",
        name: "성과상여금",
        target: "근무성적 및 업무실적 등이 우수한 공무원",
      },
    ],
  },

  {
    title: "가계보전수당 (4종)",
    items: [
      {
        id: "family.family",
        name: "가족수당",
        target: "부양가족이 있는 공무원",
      },
      {
        id: "family.education",
        name: "자녀학비보조수당",
        target: "재외 근무지 학교에 다니는 자녀를 둔 재외공무원",
      },
      {
        id: "family.housing",
        name: "주택수당",
        target: "하사 이상 중령 이하 군인 및 재외공무원",
      },
      {
        id: "family.childcare",
        name: "육아휴직수당",
        target: "육아휴직 중인 공무원",
      },
    ],
  },

  {
    title: "특수지근무수당 (1종)",
    items: [
      {
        id: "special-area.remote",
        name: "특수지근무수당",
        target: "도서, 벽지, 접적지 및 특수기관 근무자",
      },
    ],
  },

  {
    title: "특수근무수당 (4종)",
    items: [
      {
        id: "special-duty.risk",
        name: "위험근무수당",
        target: "위험직무종사자",
      },
      {
        id: "special-duty.special",
        name: "특수업무수당",
        target: "특수업무 종사자",
      },
      {
        id: "special-duty.substitute",
        name: "업무대행수당",
        target:
          "병가·출산휴가·유산휴가·사산휴가·육아휴직·공무상 질병휴직자의 업무를 대행하는 공무원",
      },
      {
        id: "special-duty.legal",
        name: "군법무관수당",
        target: "군법무관",
      },
    ],
  },

  {
    title: "초과근무수당 등 (2종)",
    items: [
      {
        id: "overtime.overtime",
        name: "초과근무수당",
        target: "5급 이하 공무원",
      },
      {
        id: "overtime.management",
        name: "관리업무수당",
        target: "4급 이상 공무원",
      },
    ],
  },

  {
    title: "실비변상 등 (4종)",
    items: [
      {
        id: "expense.meal",
        name: "정액급식비",
        target: "모든 공무원",
      },
      {
        id: "expense.position",
        name: "직급보조비",
        target: "모든 공무원",
      },
      {
        id: "expense.holiday",
        name: "명절휴가비",
        target: "명절일(설날, 추석날) 기준 재직 공무원",
      },
      {
        id: "expense.leave",
        name: "연가보상비",
        target: "1급 이하 공무원(20일 이내 미사용 연가에 대해 지급)",
      },
    ],
  },
];