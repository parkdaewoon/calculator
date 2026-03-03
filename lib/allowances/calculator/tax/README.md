# tax lib (간이세액표 기반)

경로: `lib/allowances/calculator/tax`

- `monthlyGrossPay`: 월 총지급(원)
- `monthlyTaxFree`: 월 비과세 합계(원) (식대 20만원 한도 등 포함)
- `monthlyScholarship`: 월 학자금(표에서 제외) (보통 0)
- 가족수는 본인 포함: `1 + spouse + children + dependents`

## 사용 예시

```ts
import { calcTaxesMonthly } from "@/lib/allowances/calculator/tax";

const r = calcTaxesMonthly({
  monthlyGrossPay: 2453780,
  monthlyTaxFree: 140000, // 정액급식비
  family: {
    spouse: 0,
    children: 0,
    dependents: 0,
    childrenAge8to20: 0,
  },
});

console.log(r.incomeTax, r.localIncomeTax);
```
