# Now Your Thon 🚀

> **Daker 긴급 인수인계 해커톤** — 문서만 남기고 사라진 서비스를 재구성하라

문서(명세서)만 보고 웹서비스를 완성하는 해커톤.  
더미 JSON 데이터 + `localStorage` 만으로 해커톤 탐색·팀 빌딩·제출·리더보드 흐름을 구현한 프론트엔드 단독 프로젝트입니다.

🔗 **배포 링크**: [Vercel 프로덕션](https://daker-handoff-hackathon.vercel.app) (master 브랜치)  
🔗 **UI 개선 Preview**: feature/clainyun-UI 브랜치 Vercel Preview URL 참고

---

## 1. 프로젝트 기본 정보

### 1-1. 팀 구성

| 닉네임 | clainyun | 정부각 | 오미자차 | 이부각 | co2ma |
|--------|----------|--------|----------|--------|-------|
| 역할 | Frontend (기획·구현 전담) | Backend | DevOps | Backend | Backend |

### 1-2. 기술 스택

| 분류 | 내용 |
|------|------|
| 프레임워크 | Next.js 16.2.2 (App Router) |
| 언어 | TypeScript 5 |
| UI 라이브러리 | React 19 |
| 스타일링 | Tailwind CSS v4 |
| 아이콘 | lucide-react |
| 번들러 | Webpack (Turbopack 우회 — 한글 경로 버그) |
| 데이터 저장 | localStorage (백엔드 없음) |
| 배포 | Vercel (GitHub 연동 자동 배포) |
| 버전 관리 | Git / GitHub |

---

## 2. 기획서 반영 현황

> 기획서의 핵심 구조인 **slug 기반 해커톤 허브 → 팀 빌딩 → 제출 → 리더보드** 흐름을 100% 구현했습니다.

### 2-1. 기획서 항목별 구현 상태

| 기획 항목 | 구현 여부 | 비고 |
|-----------|:---------:|------|
| 해커톤 탐색 (목록 + 필터 + 정렬) | ✅ 완료 | 상태/태그 필터, 마감임박순·최신순·종료일순 정렬 |
| 해커톤 상세 8탭 허브 구조 | ✅ 완료 | 개요·안내·평가·상금·일정·팀·제출·리더보드 |
| slug 기반 데이터 통합 | ✅ 완료 | JSON extraDetails / extraLeaderboards slug 연결 |
| 팀 생성 / 수정 / 모집 상태 변경 | ✅ 완료 | localStorage CRUD, isLocal 플래그로 내 팀 구분 |
| 해커톤 없이 팀 생성 가능 | ✅ 완료 | hackathonSlug 빈 문자열 허용 |
| 제출 임시저장 / 최종 제출 | ✅ 완료 | draft / submitted 상태 분리 |
| 제출 → 리더보드 자동 연동 | ✅ 완료 | 제출 완료 시 localStorage 리더보드 자동 추가 |
| 집계 예정 뱃지 | ✅ 완료 | 로컬 제출 항목에 "집계 예정" amber 뱃지 표시 |
| 글로벌 랭킹 (해커톤 통합) | ✅ 완료 | 정규화 점수 합산, 포디움 UI |
| 해커톤별 리더보드 | ✅ 완료 | scoreBreakdown 참가자(30%) / 심사위원(70%) 분리 |
| 기간 필터 (전체/30일/7일) | ✅ 완료 | 글로벌 + 해커톤별 양쪽 적용 |
| 로딩 상태 (스켈레톤 카드) | ✅ 완료 | 팀 목록 초기 로딩 시 표시 |
| 빈 상태 처리 | ✅ 완료 | EmptyState 공통 컴포넌트 |
| 에러 상태 처리 | ✅ 완료 | ErrorState 공통 컴포넌트 (컴포넌트 준비 완료) |
| 카운트다운 타이머 | ✅ 완료 | 마감 3일 이내 red 긴급 스타일 |
| 마일스톤 타임라인 | ✅ 완료 | 완료/예정 상태 시각적 구분 |
| 팀 지원하기 (localStorage) | ✅ 완료 | 지원 상태 토글, 재지원 가능 |
| 팀 수정 (내 팀만) | ✅ 완료 | isLocal 팀만 수정 버튼 노출 |
| JSON 예시 데이터 반영 | ✅ 완료 | public_hackathons / public_hackathon_detail / public_teams / public_leaderboard 4종 전부 |
| 반응형 레이아웃 | ✅ 완료 | 모바일/태블릿/데스크탑 대응 |

### 2-2. 데이터 흐름 구조

```
JSON 예시자료 (data/예시자료/)
    ↓ 정규화 (slug 기준 통합)
lib/data.ts (HACKATHONS, HACKATHON_DETAILS, SEED_TEAMS, SEED_LEADERBOARDS)
    ↓ 읽기 전용 seed 데이터
각 페이지 (hackathons, camp, rankings, [slug])
    ↑↓ 사용자 액션
lib/storage.ts (localStorage)
    └── nyt_teams        팀 CRUD
    └── nyt_submissions  제출 임시저장/최종제출
    └── nyt_team_actions 팀 지원 상태
    └── nyt_leaderboards 로컬 제출 리더보드
```

---

## 3. 구현된 페이지 및 컴포넌트

### 3-1. 페이지

| 파일 경로 | 기능 요약 |
|-----------|-----------|
| `app/page.tsx` | 메인 랜딩 페이지 — Hero 섹션, 통계, 네비 카드, 주목할 해커톤, CTA 배너 |
| `app/hackathons/page.tsx` | 해커톤 목록 — 상태/태그 필터, 3종 정렬, 참여 팀 수 표시 |
| `app/hackathons/[slug]/page.tsx` | 해커톤 상세 허브 — 8탭 구조 (개요·안내·평가·상금·일정·팀·제출·리더보드) |
| `app/camp/page.tsx` | 팀 찾기 — 팀 CRUD, 포지션/해커톤 필터, 모집 상태 토글, 스켈레톤 로딩 |
| `app/rankings/page.tsx` | 랭킹 — 글로벌(정규화 합산) + 해커톤별 탭, 포디움 UI, 기간 필터 |

### 3-2. 공통 컴포넌트

| 파일 경로 | 역할 |
|-----------|------|
| `components/Navbar.tsx` | 상단 네비게이션, 활성 링크 강조, sticky + backdrop-blur |
| `components/StatusBadge.tsx` | 해커톤 상태 뱃지 (진행중 애니메이션 점, 예정, 종료) |
| `components/CountdownTimer.tsx` | 실시간 카운트다운, 3일 이내 red 긴급 스타일 |
| `components/EmptyState.tsx` | 빈 데이터 상태 UI + CTA 버튼 |
| `components/ErrorState.tsx` | 에러 상태 UI + 재시도 버튼 |
| `components/LoadingState.tsx` | SkeletonCard / SkeletonList / SkeletonRow 3종 |

### 3-3. 라이브러리

| 파일 경로 | 역할 |
|-----------|------|
| `lib/types.ts` | 전체 TypeScript 인터페이스 정의 |
| `lib/data.ts` | JSON 예시자료 정규화 및 seed 데이터 관리 |
| `lib/storage.ts` | localStorage 유틸리티 (4개 키 관리) |

---

## 4. 주요 기술 결정 및 트러블슈팅

### 4-1. 해결한 버그/에러 목록

| # | 에러 | 원인 | 해결 방법 |
|---|------|------|-----------|
| 1 | Turbopack 빌드 실패 | 경로에 한글(인수인계 해커톤) 포함 시 Turbopack 버그 | `package.json` 빌드 스크립트를 `next build --webpack`으로 변경 |
| 2 | TypeScript 타입 에러 (SubmitSection) | `sections` prop 타입이 너무 복잡하게 정의됨 | `HackathonDetail['sections']['submit']` 직접 사용으로 단순화 |
| 3 | TypeScript 상태 비교 에러 | `'saved'` vs `'draft-saved'` 불일치 | 상태 이름을 `'draft-saved'`로 통일 |
| 4 | useSearchParams Suspense 오류 | Next.js App Router에서 CSR 사용 시 Suspense 필수 | `CampContent` 분리 후 `<Suspense>` 래핑 |
| 5 | `gradient` 프로퍼티 없음 에러 | `STATS` 배열에서 `color` → `gradient` 이름 불일치 | 배열 프로퍼티 이름을 `gradient`로 통일 |
| 6 | require() 동적 임포트 경고 | 컴포넌트 내부에서 `require()` 사용 | `import` 정적 임포트로 변경 |

### 4-2. 핵심 설계 결정

- **백엔드 없음**: 모든 사용자 데이터는 `localStorage`에 저장. 외부 API 키 불필요
- **hackathonSlug 옵셔널**: 해커톤에 연결되지 않은 팀 생성 허용 (memo.png 요구사항 반영)
- **해커톤 상태 수정**: JSON 원본의 상태값 오류 수동 수정
  - `monthly-vibe-coding-2026-02`: `ongoing` → `ended` (종료일 경과)
  - `daker-handover-2026-03`: `upcoming` → `ongoing` (접수 시작일 경과)
- **리더보드 병합**: seed 데이터 + localStorage 제출 내역을 병합 렌더링 ("집계 예정" 뱃지)

---

## 5. 브랜치 전략

| 브랜치 | 역할 | 상태 |
|--------|------|------|
| `master` | Vercel 프로덕션 배포 | 기능 구현 완료 ✅ |
| `feature/clainyun` | 첫 번째 UI 개선 (라이트 테마) | 완료, 미병합 |
| `feature/clainyun-UI` | 두 번째 UI 개선 (Whale Space 스타일) | 작업 중 🔧 |

---

## 6. UI 개선 히스토리

### 6-1. feature/clainyun (1차 UI 개선)
- 전체 라이트 테마 전환 (`#f5f3ff` 배경)
- `.light-card` 유틸리티 클래스 (흰 배경 + violet 보더 + 그림자)
- 6개 CSS float 애니메이션 블롭 오브젝트
- 모든 페이지 다크 → 라이트 색상 전환

### 6-2. feature/clainyun-UI (2차 UI 개선, 현재 작업 브랜치)
- **Hero 섹션 Whale Space 스타일로 교체**
  - 배경: 코랄/핑크(좌하) → 라벤더(중) → 하늘/청록(우상) 대각선 mesh gradient
  - 오브젝트: 오른쪽 집중 배치 (메인 230px 보라 구체 + 서브 3개)
  - 배경 mesh orb 3개 (blur 55~60px) 색감 레이어
  - 반투명 유리형 CTA 버튼 (backdrop-blur)

---

## 7. TODO (다음 작업 우선순위)

| 순위 | 작업 항목 | 이유 / 기대 효과 | 난이도 |
|:----:|-----------|-----------------|:------:|
| 1 | Hero 이외 나머지 페이지 UI Whale Space 스타일 통일 | feature/clainyun-UI에서 Hero만 변경됨, 나머지 페이지와 분위기 맞추기 | 중 |
| 2 | feature/clainyun-UI → master 머지 후 Vercel 프로덕션 반영 | 현재 메인 링크에서 UI 확인 불가 | 하 |
| 3 | 팀 초대 / 수락 / 거절 흐름 추가 | 데모 시 "팀 빌딩 흐름" 완성도, accepted 상태 미구현 상태 | 중 |
| 4 | ErrorState 실제 사용 (catch block render) | 컴포넌트만 있고 실제로 렌더하는 곳이 없음, 3종 상태(로딩·빈값·에러) 완결 | 하 |
| 5 | 제출 시 팀명 직접 입력 받기 | 리더보드에 "나의 제출" 대신 실제 팀명 표시 | 하 |
| 6 | Hero 오브젝트 큐브/젤리 형태 추가 | 현재 모두 원형 구체 → Whale Space처럼 다각형/유기체 형태 혼합으로 더 풍부하게 | 상 |
| 7 | Navbar 투명도 Hero 연결 | Hero 배경과 Navbar를 자연스럽게 이어지는 느낌 (backdrop-blur 강화) | 하 |
| 8 | 모바일 반응형 Hero 미세 조정 | 오브젝트 겹침 가능성 있음 | 중 |

---

## 8. 수정/생성 파일 전체 목록

> 총 **22개** 파일 생성/수정 완료

| 카테고리 | 파일 | 주요 변경 내용 |
|----------|------|---------------|
| 타입 정의 | `lib/types.ts` | Hackathon / HackathonDetail / Team / LeaderboardEntry / LocalSubmission / HackathonStatus 인터페이스 |
| 데이터 정규화 | `lib/data.ts` | JSON 4종(public_hackathons / public_hackathon_detail / public_teams / public_leaderboard) + extraDetails + extraLeaderboards를 slug 기준 플랫 구조로 정규화, 해커톤 상태값 수정 |
| localStorage | `lib/storage.ts` | nyt_teams / nyt_submissions / nyt_team_actions / nyt_leaderboards 4개 키, Submit→Leaderboard 자동 연동, updateTeam 추가 |
| 공통 컴포넌트 | `components/Navbar.tsx` | 반응형 네비, 활성 링크, glassmorphism |
| 공통 컴포넌트 | `components/StatusBadge.tsx` | 상태별 색상/뱃지, ongoing 애니메이션 점 |
| 공통 컴포넌트 | `components/CountdownTimer.tsx` | 실시간 카운트다운, 긴급 스타일 |
| 공통 컴포넌트 | `components/EmptyState.tsx` | 빈 상태 UI + CTA |
| 공통 컴포넌트 | `components/ErrorState.tsx` | 에러 UI + 재시도 버튼 |
| 공통 컴포넌트 | `components/LoadingState.tsx` | Skeleton 3종 |
| 메인 페이지 | `app/page.tsx` | Whale Space 스타일 Hero, 통계 배너, 네비 카드, 해커톤 요약 |
| 해커톤 목록 | `app/hackathons/page.tsx` | 상태/태그 필터, 3종 정렬, 팀 수 표시 |
| 해커톤 상세 | `app/hackathons/[slug]/page.tsx` | 8탭 허브, 동적 제출폼, 리더보드 병합, 마일스톤 타임라인 |
| 팀 찾기 | `app/camp/page.tsx` | 팀 CRUD, Suspense 적용, 스켈레톤 로딩 |
| 글로벌 랭킹 | `app/rankings/page.tsx` | 글로벌 정규화 집계 + 해커톤별 탭, 포디움 |
| 글로벌 스타일 | `app/globals.css` | float 애니메이션 6종, .light-card 유틸리티, 스크롤바 |
| 빌드 설정 | `package.json` | `next build --webpack` (Turbopack 한글 경로 버그 우회) |

---

## 9. 로컬 실행 방법

```bash
# 저장소 클론
git clone https://github.com/onePotatoBugak/daker-handoff-hackathon.git
cd daker-handoff-hackathon

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:3000

# 프로덕션 빌드 (반드시 --webpack 옵션 사용)
npm run build
```

> ⚠️ **주의**: `npm run build` (= `next build --webpack`) 로 실행해야 합니다.  
> 일반 `next build`는 Turbopack이 한글 경로를 처리하지 못해 빌드가 실패합니다.

---

## 10. 개발 환경

| 항목 | 내용 |
|------|------|
| OS | macOS 14+ |
| Node.js | 18+ |
| 패키지 매니저 | npm |
| 에디터 | VS Code / Cursor |
| 배포 | Vercel (GitHub Actions 연동) |

---

*Last updated by clainyun — feature/clainyun-UI 브랜치 기준*
