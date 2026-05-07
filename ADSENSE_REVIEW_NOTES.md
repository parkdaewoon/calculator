# AdSense review content patch

## 포함된 변경
- 홈 화면에 서비스 설명/이용 순서/내부 링크 보강
- 봉급 계산기, 봉급표, 연금 계산, 퇴직수당 페이지 하단에 설명 콘텐츠와 FAQ 추가
- 상세 가이드 글 6개 추가
- 출처, 면책조항, 문의 페이지 신뢰 문구 보강
- sitemap에 신규 가이드 URL 반영
- 승인 전 가짜 광고 슬롯이 빈 박스로 노출되지 않도록 AdsenseSlot 보호 로직 추가

## 배포 후 권장 순서
1. npm run build 또는 Vercel Preview build 확인
2. Production 배포
3. Google Search Console에서 sitemap 재제출 및 핵심 URL 색인 요청
4. Naver Search Advisor에서 핵심 URL 수집 요청
5. AdSense에서 문제 수정 확인 후 검토 요청
