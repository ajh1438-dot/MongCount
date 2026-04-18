# 06-tasks.md

## 메타 정보
- 프로젝트: MongCount (쉼일지)
- 생성일: 2026-04-18
- 기준 문서: `docs/planning/06-screens.md`, `specs/domain/resources.yaml`, `specs/screens/*.yaml`
- 총 Phase: 6개 (P0~P5)
- 총 Task: 58개
- 현재 실행 스택(고정): Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Supabase Cloud, `proxy.ts`

## 실행 계약 (auto-orchestrate)
- 본 문서는 실행 계약이며, 범위 확장 금지.
- 구현 기준은 화면/리소스 스펙만 사용한다. (`06-screens.md`, `resources.yaml`)
- main assistant 역할: **orchestrator/quality gate 우선**, 구현은 peer specialist에게 위임.
- 병렬 코딩은 인접 영역 기준 **동시 3~4명 최대**.
- 각 배치 종료 후 **통합 체크포인트(Verification + Review/QA Gate)**를 반드시 통과한다.
- specialist가 태스크를 구현하고, **Phase 단위 병합은 orchestrator만 수행**한다.
- TDD 순서 고정: RED → GREEN → REFACTOR → VERIFY.

---

## Phase 0: 계약 & 테스트 설계

### [ ] P0-T0.1: 스펙 계약 잠금 및 추적 매트릭스 생성
- **담당**: docs-specialist
- **의존**: 없음
- **파일**:
  - 테스트: `tests/contracts/spec-coverage.test.ts`
  - 구현: `docs/planning/06-tasks.md`
- **완료 조건**: S1~S11 + 8개 리소스 매핑 누락 0건

### [ ] P0-T0.2: 테스트 실행 뼈대 구성 (unit/e2e/contracts)
- **담당**: test-specialist
- **의존**: P0-T0.1
- **파일**:
  - 테스트: `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`, `tests/contracts/resource-contracts.test.ts`
  - 구현: `vitest.config.ts`, `playwright.config.ts`
- **완료 조건**: `npm run test:unit`, `npm run test:e2e` 실행 가능

### [ ] P0-T0.3: 앱 베이스라인 정렬 (Next.js 16 + React 19 + TS5 + Tailwind v4)
- **담당**: frontend-specialist
- **의존**: P0-T0.2
- **파일**:
  - 테스트: `tests/e2e/smoke.spec.ts`
  - 구현: `package.json`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- **완료 조건**: dev/build 통과, stale stack 참조 제거

### [ ] P0-T0.4: 데이터 레이어 골격 (Dexie + Supabase) 계약 일치
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **파일**:
  - 테스트: `tests/contracts/resource-contracts.test.ts`
  - 구현: `lib/db/*`, `lib/supabase/*`, `supabase/migrations/*`
- **완료 조건**: `resources.yaml` 8개 리소스 필드 커버리지 확인

### [ ] P0-T0.5: PWA + 오프라인 + proxy.ts 기본선
- **담당**: frontend-specialist
- **의존**: P0-T0.3
- **파일**:
  - 테스트: `tests/e2e/offline.spec.ts`
  - 구현: `app/sw.ts`, `app/offline/page.tsx`, `public/manifest.json`, `proxy.ts`
- **완료 조건**: 오프라인 fallback 진입 + `proxy.ts` 컨벤션 적용

### [ ] P0-T0.6: Phase 0 검증 게이트
- **담당**: test-specialist
- **의존**: P0-T0.4, P0-T0.5
- **파일**:
  - 테스트: `tests/e2e/smoke.spec.ts`, `tests/contracts/resource-contracts.test.ts`
  - 구현: 없음
- **완료 조건**: 스모크/계약/오프라인 기본 테스트 green

---

## Phase 1: 공통 인프라 (Auth/Preferences/Shared UI)

### 배치 A (병렬 최대 4 코딩 peer)

### [ ] P1-R1-T1: users 계약 테스트 (OAuth + local_only)
- **담당**: test-specialist
- **의존**: P0-T0.6
- **파일**:
  - 테스트: `tests/contracts/users.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-1-users-contract`
- **브랜치**: `phase-1-users-contract`
- **완료 조건**: provider enum(google/kakao/local_only) 계약 검증
- **병렬**: P1-R2-T1, P1-S0-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-R1-T2: users 구현 (OAuth 콜백 + local_only 생성)
- **담당**: backend-specialist
- **의존**: P1-R1-T1
- **파일**:
  - 테스트: `tests/contracts/users.contract.test.ts`
  - 구현: `app/auth/*`, `lib/supabase/*`
- **Worktree**: `worktree/phase-1-users-impl`
- **브랜치**: `phase-1-users-impl`
- **완료 조건**: 로그인/비로그인 모두 S1 진입 가능
- **병렬**: P1-R2-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-R2-T1: user_preferences 계약 테스트
- **담당**: test-specialist
- **의존**: P0-T0.6
- **파일**:
  - 테스트: `tests/contracts/user-preferences.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-1-preferences-contract`
- **브랜치**: `phase-1-preferences-contract`
- **완료 조건**: notification_slots/theme/onboarding_completed/timezone 계약 검증
- **병렬**: P1-R1-T1, P1-S0-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-R2-T2: user_preferences 구현 (local 우선 + cloud 동기)
- **담당**: backend-specialist
- **의존**: P1-R2-T1
- **파일**:
  - 테스트: `tests/contracts/user-preferences.contract.test.ts`
  - 구현: `stores/*`, `lib/db/*`, `lib/supabase/*`
- **Worktree**: `worktree/phase-1-preferences-impl`
- **브랜치**: `phase-1-preferences-impl`
- **완료 조건**: local_only 동작 + 로그인 시 마이그레이션
- **병렬**: P1-R1-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-S0-T1: 공통 레이아웃/탭 내비게이션 UI
- **담당**: frontend-specialist
- **의존**: P0-T0.6
- **파일**:
  - 테스트: `tests/unit/ui/navigation.test.tsx`
  - 구현: `components/navigation/*`, `app/(tabs)/*`
- **Worktree**: `worktree/phase-1-shared-nav-ui`
- **브랜치**: `phase-1-shared-nav-ui`
- **완료 조건**: 탭 4개(home/archive/report/settings) 노출 규칙 일치
- **병렬**: P1-R1-T1, P1-R2-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-S0-T2: 공통 버튼/피드백 컴포넌트 정렬
- **담당**: frontend-specialist
- **의존**: P1-S0-T1
- **파일**:
  - 테스트: `tests/unit/ui/components.test.tsx`
  - 구현: `components/ui/*`
- **Worktree**: `worktree/phase-1-shared-components`
- **브랜치**: `phase-1-shared-components`
- **완료 조건**: screens spec의 버튼/토스트/배너 타입 충족
- **병렬**: P1-S0-T3와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-S0-T3: 테마/다크모드 상태 연결
- **담당**: frontend-specialist
- **의존**: P1-R2-T2
- **파일**:
  - 테스트: `tests/unit/theme/theme-mode.test.ts`
  - 구현: `app/globals.css`, `stores/*`, `components/theme/*`
- **Worktree**: `worktree/phase-1-theme-state`
- **브랜치**: `phase-1-theme-state`
- **완료 조건**: system/light/dark + 22:00~08:00 자동 반영
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P1-S0-T4: 인증 전환 상호작용(local 유지 + cloud 연결)
- **담당**: backend-specialist
- **의존**: P1-R1-T2, P1-R2-T2
- **파일**:
  - 테스트: `tests/e2e/auth-migration.spec.ts`
  - 구현: `app/auth/*`, `lib/sync/*`
- **Worktree**: `worktree/phase-1-auth-migration-flow`
- **브랜치**: `phase-1-auth-migration-flow`
- **완료 조건**: 로그인 전 기록이 로그인 후 동일 사용자로 연결
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 통합 체크포인트

### [ ] P1-S0-V: Phase 1 통합 검증
- **담당**: test-specialist
- **의존**: P1-S0-T2, P1-S0-T3, P1-S0-T4
- **파일**:
  - 테스트: `tests/e2e/phase1-integration.spec.ts`
  - 구현: 없음
- **Worktree**: `worktree/phase-1-integration-verify`
- **브랜치**: `phase-1-integration-verify`
- **완료 조건**: auth/theme/tabs/prefs 회귀 없음
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

---

## Phase 2: 쉼 세션 코어 (S1→S2→S3)

### 배치 A: 리소스/상태

### [ ] P2-R1-T1: rest_sessions 계약 테스트
- **담당**: test-specialist
- **의존**: P1-S0-V
- **파일**:
  - 테스트: `tests/contracts/rest-sessions.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-2-rest-sessions-contract`
- **브랜치**: `phase-2-rest-sessions-contract`
- **완료 조건**: 필드/retention/free7일 계약 검증
- **병렬**: P2-R2-T1, P2-S1-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-R1-T2: rest_sessions 저장/동기 구현
- **담당**: backend-specialist
- **의존**: P2-R1-T1
- **파일**:
  - 테스트: `tests/contracts/rest-sessions.contract.test.ts`
  - 구현: `lib/db/*`, `lib/sync/*`, `lib/supabase/*`
- **Worktree**: `worktree/phase-2-rest-sessions-impl`
- **브랜치**: `phase-2-rest-sessions-impl`
- **완료 조건**: Dexie↔Supabase 양방향 동기 + completed/clarity/note 반영
- **병렬**: P2-R2-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-R2-T1: today_progress 계산 계약 테스트
- **담당**: test-specialist
- **의존**: P1-S0-V
- **파일**:
  - 테스트: `tests/contracts/today-progress.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-2-today-progress-contract`
- **브랜치**: `phase-2-today-progress-contract`
- **완료 조건**: completed_count/next_slot/soft_streak 계산 규칙 검증
- **병렬**: P2-R1-T1, P2-S1-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-R2-T2: today_progress 파생 모델 구현
- **담당**: backend-specialist
- **의존**: P2-R2-T1, P2-R1-T2
- **파일**:
  - 테스트: `tests/contracts/today-progress.contract.test.ts`
  - 구현: `lib/derived/*` 또는 `supabase/migrations/*`
- **Worktree**: `worktree/phase-2-today-progress-impl`
- **브랜치**: `phase-2-today-progress-impl`
- **완료 조건**: S1이 요구 필드를 실시간 조회 가능
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 배치 B: 화면 UI/상호작용/오프라인

### [ ] P2-S1-T1: S1 UI 구현 (home.yaml 준수)
- **담당**: frontend-specialist
- **의존**: P1-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s1-home-ui.test.tsx`
  - 구현: `app/page.tsx`, `components/screens/s1/*`
- **Worktree**: `worktree/phase-2-s1-ui`
- **브랜치**: `phase-2-s1-ui`
- **완료 조건**: progress_card/start_button/last_session_row/guest_banner 상태 렌더
- **병렬**: P2-R1-T1, P2-R2-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S1-T2: S1 상태 바인딩/CTA 동작
- **담당**: frontend-specialist
- **의존**: P2-R2-T2, P2-S1-T1
- **파일**:
  - 테스트: `tests/e2e/s1-interaction.spec.ts`
  - 구현: `components/screens/s1/*`, `stores/*`
- **Worktree**: `worktree/phase-2-s1-state-interaction`
- **브랜치**: `phase-2-s1-state-interaction`
- **완료 조건**: last_used duration 복원 + S2 이동
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S2-T1: S2 타이머 UI 구현 (rest-timer.yaml)
- **담당**: frontend-specialist
- **의존**: P1-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s2-timer-ui.test.tsx`
  - 구현: `app/rest/page.tsx`, `components/screens/s2/*`
- **Worktree**: `worktree/phase-2-s2-ui`
- **브랜치**: `phase-2-s2-ui`
- **완료 조건**: timer_display/hint_strip/progress_bar/abort_button 렌더
- **병렬**: P2-S3-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S2-T2: S2 상태머신(완료/중단/복귀) 구현
- **담당**: frontend-specialist
- **의존**: P2-S2-T1, P2-R1-T2
- **파일**:
  - 테스트: `tests/e2e/s2-timer-flow.spec.ts`
  - 구현: `components/screens/s2/*`, `stores/*`
- **Worktree**: `worktree/phase-2-s2-state`
- **브랜치**: `phase-2-s2-state`
- **완료 조건**: 완료→S3, 중단→S3(clarity 제안), readonly 모드 분기
- **병렬**: P2-S3-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S2-T3: S2 오프라인/백그라운드 복구
- **담당**: frontend-specialist
- **의존**: P2-S2-T2
- **파일**:
  - 테스트: `tests/e2e/s2-recovery.spec.ts`
  - 구현: `app/sw.ts`, `components/screens/s2/*`
- **Worktree**: `worktree/phase-2-s2-offline-recovery`
- **브랜치**: `phase-2-s2-offline-recovery`
- **완료 조건**: 백그라운드 복귀 오차<1초, 크래시 후 남은 시간 복원
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S3-T1: S3 UI 구현 (rest-review.yaml)
- **담당**: frontend-specialist
- **의존**: P1-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s3-review-ui.test.tsx`
  - 구현: `app/rest/review/page.tsx`, `components/screens/s3/*`
- **Worktree**: `worktree/phase-2-s3-ui`
- **브랜치**: `phase-2-s3-ui`
- **완료 조건**: clarity slider(1~5), note(280), save/skip 버튼 렌더
- **병렬**: P2-S2-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S3-T2: S3 저장/건너뛰기/중단 기본값 상호작용
- **담당**: frontend-specialist
- **의존**: P2-S3-T1, P2-R1-T2
- **파일**:
  - 테스트: `tests/e2e/s3-save-skip.spec.ts`
  - 구현: `components/screens/s3/*`, `stores/*`
- **Worktree**: `worktree/phase-2-s3-interaction`
- **브랜치**: `phase-2-s3-interaction`
- **완료 조건**: 저장 후 토스트+S1, skip 즉시 S1, abort 기본값 2
- **병렬**: P2-S2-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S3-T3: S3 note debounce + outbox 동기
- **담당**: backend-specialist
- **의존**: P2-S3-T2
- **파일**:
  - 테스트: `tests/unit/sync/outbox-note-sync.test.ts`
  - 구현: `lib/db/*`, `lib/sync/*`, `components/screens/s3/*`
- **Worktree**: `worktree/phase-2-s3-offline-sync`
- **브랜치**: `phase-2-s3-offline-sync`
- **완료 조건**: note 500ms debounce, 오프라인 큐 적재/복구 동기
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 통합 체크포인트

### [ ] P2-S1-V: 코어 루프 E2E 검증 (S1→S2→S3→S1)
- **담당**: test-specialist
- **의존**: P2-S1-T2, P2-S2-T3, P2-S3-T3
- **파일**:
  - 테스트: `tests/e2e/core-loop.spec.ts`
  - 구현: 없음
- **Worktree**: `worktree/phase-2-core-loop-verify`
- **브랜치**: `phase-2-core-loop-verify`
- **완료 조건**: 골든패스/중단/skip/게스트 배너 시나리오 green
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P2-S0-V: Phase 2 리뷰/QA 게이트
- **담당**: docs-specialist
- **의존**: P2-S1-V
- **파일**:
  - 테스트: `tests/e2e/core-loop.spec.ts`
  - 구현: `docs/planning/06-tasks.md`
- **Worktree**: `worktree/phase-2-review-gate`
- **브랜치**: `phase-2-review-gate`
- **완료 조건**: verification/evaluation/code-review/frontend QA/security 체크 완료
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

---

## Phase 3: 알림 & 온보딩 (S4/S7/S8)

### 배치 A: 리소스/스케줄러

### [ ] P3-R1-T1: notification_subscriptions 계약 테스트
- **담당**: test-specialist
- **의존**: P2-S0-V
- **파일**:
  - 테스트: `tests/contracts/notification-subscriptions.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-3-noti-contract`
- **브랜치**: `phase-3-noti-contract`
- **완료 조건**: endpoint/keys/platform/snooze_log 계약 및 per_slot_max=3 검증
- **병렬**: P3-R2-T1, P3-S7-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-R1-T2: 구독 저장/갱신 구현
- **담당**: backend-specialist
- **의존**: P3-R1-T1
- **파일**:
  - 테스트: `tests/contracts/notification-subscriptions.contract.test.ts`
  - 구현: `lib/notifications/*`, `supabase/migrations/*`
- **Worktree**: `worktree/phase-3-noti-impl`
- **브랜치**: `phase-3-noti-impl`
- **완료 조건**: 권한 허용 시 subscription 저장/갱신
- **병렬**: P3-R2-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-R2-T1: 알림 스케줄 계약 테스트(고정 6슬롯/타임존/야간 규칙)
- **담당**: test-specialist
- **의존**: P2-S0-V
- **파일**:
  - 테스트: `tests/contracts/notification-scheduler.contract.test.ts`
  - 구현: `specs/screens/notification.yaml`
- **Worktree**: `worktree/phase-3-scheduler-contract`
- **브랜치**: `phase-3-scheduler-contract`
- **완료 조건**: 08:30~22:00 6개 슬롯, 23:00 이후 스누즈 무시 검증
- **병렬**: P3-R1-T1, P3-S7-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-R2-T2: 스케줄러/액션 라우팅 구현(now_rest/snooze_15/dismiss)
- **담당**: backend-specialist
- **의존**: P3-R2-T1, P3-R1-T2
- **파일**:
  - 테스트: `tests/e2e/notification-actions.spec.ts`
  - 구현: `app/sw.ts`, `lib/notifications/*`, `supabase/functions/*`
- **Worktree**: `worktree/phase-3-scheduler-impl`
- **브랜치**: `phase-3-scheduler-impl`
- **완료 조건**: 알림 액션별 목적지/재알림 동작 일치
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 배치 B: 화면/상호작용

### [ ] P3-S7-T1: S7 온보딩 UI 3스크린 구현
- **담당**: frontend-specialist
- **의존**: P2-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s7-onboarding-ui.test.tsx`
  - 구현: `app/onboarding/*`, `components/screens/s7/*`
- **Worktree**: `worktree/phase-3-s7-ui`
- **브랜치**: `phase-3-s7-ui`
- **완료 조건**: S7-1/2/3 고정 콘텐츠 및 이동 흐름 일치
- **병렬**: P3-S8-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-S7-T2: S7 권한/플랫폼 분기 상태 구현
- **담당**: frontend-specialist
- **의존**: P3-S7-T1, P3-R1-T2
- **파일**:
  - 테스트: `tests/e2e/s7-permission-flow.spec.ts`
  - 구현: `app/onboarding/*`, `lib/notifications/*`
- **Worktree**: `worktree/phase-3-s7-state`
- **브랜치**: `phase-3-s7-state`
- **완료 조건**: 허용/거부/iOS PWA 가이드 분기 동작
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-S8-T1: S8 로그인 UI 구현 (Google/Kakao/나중에)
- **담당**: frontend-specialist
- **의존**: P2-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s8-login-ui.test.tsx`
  - 구현: `app/login/*`, `components/screens/s8/*`
- **Worktree**: `worktree/phase-3-s8-ui`
- **브랜치**: `phase-3-s8-ui`
- **완료 조건**: OAuth 버튼 2개 + local_only 유지 버튼
- **병렬**: P3-S7-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-S8-T2: S8 OAuth 콜백/로컬세션 마이그레이션 연결
- **담당**: backend-specialist
- **의존**: P3-S8-T1, P1-S0-T4
- **파일**:
  - 테스트: `tests/e2e/s8-auth-callback.spec.ts`
  - 구현: `app/auth/*`, `lib/sync/*`
- **Worktree**: `worktree/phase-3-s8-auth-flow`
- **브랜치**: `phase-3-s8-auth-flow`
- **완료 조건**: OAuth 성공 시 S1 복귀 + 로컬 데이터 계정 귀속
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P3-S4-T1: S4 알림 클릭 핸들러 통합
- **담당**: frontend-specialist
- **의존**: P3-R2-T2
- **파일**:
  - 테스트: `tests/e2e/notification-actions.spec.ts`
  - 구현: `app/sw.ts`, `app/rest/*`
- **Worktree**: `worktree/phase-3-s4-action-handler`
- **브랜치**: `phase-3-s4-action-handler`
- **완료 조건**: 알림 클릭으로 S2 직접 진입
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 통합 체크포인트

### [ ] P3-S0-V: Phase 3 통합 검증 + QA 게이트
- **담당**: test-specialist
- **의존**: P3-S7-T2, P3-S8-T2, P3-S4-T1
- **파일**:
  - 테스트: `tests/e2e/phase3-integration.spec.ts`
  - 구현: 없음
- **Worktree**: `worktree/phase-3-integration-gate`
- **브랜치**: `phase-3-integration-gate`
- **완료 조건**: 온보딩 재진입/로그인 선택/푸시 액션 경로 모두 green
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

---

## Phase 4: 기록 조회 (S5/S6 + 리포트 리소스)

### 배치 A: 리포트 리소스

### [ ] P4-R1-T1: weekly_reports 계약 테스트
- **담당**: test-specialist
- **의존**: P3-S0-V
- **파일**:
  - 테스트: `tests/contracts/weekly-reports.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-4-weekly-contract`
- **브랜치**: `phase-4-weekly-contract`
- **완료 조건**: day_dots/avg_clarity/best_session/ai_comment 필드 검증
- **병렬**: P4-R2-T1, P4-S5-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-R1-T2: weekly_reports 집계/생성 구현
- **담당**: backend-specialist
- **의존**: P4-R1-T1
- **파일**:
  - 테스트: `tests/contracts/weekly-reports.contract.test.ts`
  - 구현: `supabase/migrations/*`, `supabase/functions/*`
- **Worktree**: `worktree/phase-4-weekly-impl`
- **브랜치**: `phase-4-weekly-impl`
- **완료 조건**: 주간 집계 + 코멘트 생성/조회 경로 동작
- **병렬**: P4-R2-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-R2-T1: monthly_reports 계약 테스트(유료 게이트 포함)
- **담당**: test-specialist
- **의존**: P3-S0-V
- **파일**:
  - 테스트: `tests/contracts/monthly-reports.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-4-monthly-contract`
- **브랜치**: `phase-4-monthly-contract`
- **완료 조건**: monthly_reports premium gated 계약 검증
- **병렬**: P4-R1-T1, P4-S5-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-R2-T2: monthly_reports 조회 경로 구현
- **담당**: backend-specialist
- **의존**: P4-R2-T1
- **파일**:
  - 테스트: `tests/contracts/monthly-reports.contract.test.ts`
  - 구현: `supabase/migrations/*`, `lib/reports/*`
- **Worktree**: `worktree/phase-4-monthly-impl`
- **브랜치**: `phase-4-monthly-impl`
- **완료 조건**: premium 사용자에 한해 월간 데이터 로드 가능
- **병렬**: P4-R1-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### 배치 B: 화면

### [ ] P4-S5-T1: S5 아카이브 UI (목록/검색/필터)
- **담당**: frontend-specialist
- **의존**: P3-S0-V
- **파일**:
  - 테스트: `tests/unit/screens/s5-archive-ui.test.tsx`
  - 구현: `app/archive/*`, `components/screens/s5/*`
- **Worktree**: `worktree/phase-4-s5-ui`
- **브랜치**: `phase-4-s5-ui`
- **완료 조건**: 날짜 그룹/검색/필터/빈상태 연결
- **병렬**: P4-S6-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-S5-T2: S5 상호작용 (readonly replay + 8일 경계)
- **담당**: frontend-specialist
- **의존**: P4-S5-T1
- **파일**:
  - 테스트: `tests/e2e/s5-archive-flow.spec.ts`
  - 구현: `app/archive/*`, `app/rest/*`
- **Worktree**: `worktree/phase-4-s5-interaction`
- **브랜치**: `phase-4-s5-interaction`
- **완료 조건**: 세션 클릭 readonly S2, free 8일 경계 시 S10 이동
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-S6-T1: S6 주간 리포트 UI 구현
- **담당**: frontend-specialist
- **의존**: P4-R1-T2
- **파일**:
  - 테스트: `tests/unit/screens/s6-weekly-ui.test.tsx`
  - 구현: `app/report/*`, `components/screens/s6/*`
- **Worktree**: `worktree/phase-4-s6-ui`
- **브랜치**: `phase-4-s6-ui`
- **완료 조건**: 도트 7개/평균 맑기/best_session/AI 코멘트 표시
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-S6-T2: S6 월간 탭 게이팅 상호작용
- **담당**: frontend-specialist
- **의존**: P4-R2-T2, P4-S6-T1
- **파일**:
  - 테스트: `tests/e2e/s6-monthly-gate.spec.ts`
  - 구현: `app/report/*`, `app/paywall/*`
- **Worktree**: `worktree/phase-4-s6-monthly-gate`
- **브랜치**: `phase-4-s6-monthly-gate`
- **완료 조건**: free→S10, premium→월간 로드
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P4-S11-T1: S11 빈상태/네트워크 에러 공통 컴포넌트 적용
- **담당**: frontend-specialist
- **의존**: P4-S5-T1
- **파일**:
  - 테스트: `tests/unit/screens/s11-states.test.tsx`
  - 구현: `components/screens/s11/*`, `app/archive/*`
- **Worktree**: `worktree/phase-4-s11-states`
- **브랜치**: `phase-4-s11-states`
- **완료 조건**: empty_archive/network_error 배리에이션 렌더 및 재시도 동작
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 통합 체크포인트

### [ ] P4-S0-V: Phase 4 통합 검증 + QA 게이트
- **담당**: test-specialist
- **의존**: P4-S5-T2, P4-S6-T2, P4-S11-T1
- **파일**:
  - 테스트: `tests/e2e/phase4-integration.spec.ts`
  - 구현: 없음
- **Worktree**: `worktree/phase-4-integration-gate`
- **브랜치**: `phase-4-integration-gate`
- **완료 조건**: archive/report/paywall 경계/빈상태/오프라인 표시 검증 완료
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

---

## Phase 5: 결제 & 마감 (S9/S10/S11 + subscriptions)

### 배치 A: 결제 리소스

### [ ] P5-R1-T1: subscriptions 계약 테스트
- **담당**: test-specialist
- **의존**: P4-S0-V
- **파일**:
  - 테스트: `tests/contracts/subscriptions.contract.test.ts`
  - 구현: `specs/domain/resources.yaml`
- **Worktree**: `worktree/phase-5-subscriptions-contract`
- **브랜치**: `phase-5-subscriptions-contract`
- **완료 조건**: trial/active/cancelled/expired 상태 전이 계약 검증
- **병렬**: P5-S10-T1, P5-S9-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-R1-T2: subscriptions 구현 (checkout/webhook)
- **담당**: backend-specialist
- **의존**: P5-R1-T1
- **파일**:
  - 테스트: `tests/e2e/subscription-flow.spec.ts`
  - 구현: `app/api/*`, `supabase/functions/*`, `lib/billing/*`
- **Worktree**: `worktree/phase-5-subscriptions-impl`
- **브랜치**: `phase-5-subscriptions-impl`
- **완료 조건**: 결제 성공/실패/취소 시 상태 일관성 보장
- **병렬**: P5-S10-T2와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### 배치 B: 화면

### [ ] P5-S10-T1: S10 Paywall UI 고정 카피 구현
- **담당**: frontend-specialist
- **의존**: P5-R1-T1
- **파일**:
  - 테스트: `tests/unit/screens/s10-paywall-ui.test.tsx`
  - 구현: `app/paywall/*`, `components/screens/s10/*`
- **Worktree**: `worktree/phase-5-s10-ui`
- **브랜치**: `phase-5-s10-ui`
- **완료 조건**: 기능 5개/가격/법적 문구/CTA/나중에 노출
- **병렬**: P5-S9-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-S10-T2: S10 결제 상호작용/복귀 경로
- **담당**: frontend-specialist
- **의존**: P5-S10-T1, P5-R1-T2
- **파일**:
  - 테스트: `tests/e2e/s10-paywall-flow.spec.ts`
  - 구현: `app/paywall/*`, `app/report/*`, `app/archive/*`
- **Worktree**: `worktree/phase-5-s10-interaction`
- **브랜치**: `phase-5-s10-interaction`
- **완료 조건**: source context 복귀(S5/S6/S9) 정상 동작
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-S9-T1: S9 설정 UI 구현
- **담당**: frontend-specialist
- **의존**: P5-R1-T1
- **파일**:
  - 테스트: `tests/unit/screens/s9-settings-ui.test.tsx`
  - 구현: `app/settings/*`, `components/screens/s9/*`
- **Worktree**: `worktree/phase-5-s9-ui`
- **브랜치**: `phase-5-s9-ui`
- **완료 조건**: notifications/display/account/upgrade/misc 섹션 렌더
- **병렬**: P5-S10-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-S9-T2: S9 설정 상호작용(슬롯/테마/로그인/로그아웃)
- **담당**: frontend-specialist
- **의존**: P5-S9-T1, P1-R2-T2
- **파일**:
  - 테스트: `tests/e2e/s9-settings-flow.spec.ts`
  - 구현: `app/settings/*`, `stores/*`, `lib/notifications/*`
- **Worktree**: `worktree/phase-5-s9-interaction`
- **브랜치**: `phase-5-s9-interaction`
- **완료 조건**: 토글/테마/로그인 전환 상태 영속성 확인
- **병렬**: P5-S11-T1와 병렬 가능
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-S9-T3: S9 계정 삭제/보안 확인 플로우
- **담당**: security-specialist
- **의존**: P5-S9-T2
- **파일**:
  - 테스트: `tests/e2e/s9-account-delete.spec.ts`
  - 구현: `app/settings/*`, `app/api/*`, `supabase/functions/*`
- **Worktree**: `worktree/phase-5-s9-account-security`
- **브랜치**: `phase-5-s9-account-security`
- **완료 조건**: 이중 확인 + 데이터 삭제 + 세션 정리 동작
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### [ ] P5-S11-T1: S11 알림 권한 거부 배너 최종 적용(S1)
- **담당**: frontend-specialist
- **의존**: P5-S9-T2
- **파일**:
  - 테스트: `tests/e2e/s11-permission-banner.spec.ts`
  - 구현: `app/page.tsx`, `components/screens/s11/*`
- **Worktree**: `worktree/phase-5-s11-permission-banner`
- **브랜치**: `phase-5-s11-permission-banner`
- **완료 조건**: 세션 dismiss + 플랫폼별 가이드 링크 분기
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

### 통합 체크포인트

### [ ] P5-S0-V: Phase 5 통합 검증 + 출시 전 QA 게이트
- **담당**: test-specialist
- **의존**: P5-R1-T2, P5-S10-T2, P5-S9-T3, P5-S11-T1
- **파일**:
  - 테스트: `tests/e2e/release-gate.spec.ts`
  - 구현: 없음
- **Worktree**: `worktree/phase-5-release-gate`
- **브랜치**: `phase-5-release-gate`
- **완료 조건**: 결제/설정/권한/에러 경로 전체 회귀 0건
- **병렬**: 없음
- **병합**: orchestrator가 Phase 단위로 수행

---

## 전체 최종 게이트 (오케스트레이터 승인 조건)
- [ ] Phase별 `P{N}-S0-V` 전부 통과
- [ ] 코어 루프(S1→S2→S3) 모바일 실기 QA 통과
- [ ] 오프라인/재접속 동기화 회귀 없음
- [ ] 알림 고정 슬롯(6개) 계약 준수
- [ ] free 7일 / premium unlimited 경계 준수
- [ ] `proxy.ts` 포함 Next.js 16 규약 위반 없음
- [ ] 병합은 orchestrator가 Phase 단위로만 수행
