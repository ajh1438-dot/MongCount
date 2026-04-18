# 04. 기술 스택 (Tech Stack)

> **프로젝트**: MongCount (쉼일지)
> **문서 버전**: v1.0
> **최종 갱신**: 2026-04-16
> **근거**: Socrates Phase 2.0 기술 설계
> **상태**: Locked (기술 확정)

---

## 1. Frontend Stack

### Core Framework
**Next.js 15 (App Router) + TypeScript**
- **선택 이유**:
  - App Router: 신규 프로젝트 표준, 강력한 layout 구조
  - Server Components: 번들 크기 감소, SEO 최적화
  - Built-in API Routes: 백엔드 통합 간편
  - 풀스택 개발 용이 (1명 팀 기준)
- **버전**: 15.x (최신 안정화)
- **Node**: 20 LTS 이상

### UI Framework
**Tailwind CSS + shadcn/ui**
- **Tailwind CSS 3.x**:
  - Utility-first approach (빠른 개발)
  - Dark mode toggle (자동 22시)
  - Custom config (MongCount 색상 팔레트)
- **shadcn/ui** (headless components):
  - Button, Dialog, Slider, Input (기본 제공)
  - Accessibility (ARIA, 키보드 네비게이션) 내장
  - 커스터마이징 자유도 높음

### State Management
**Zustand**
- **선택 이유**:
  - Redux보다 간단 (보일러플레이트 최소)
  - 번들 크기: ~2KB (작음)
  - 비동기 처리: middleware로 지원
- **상태 구조**:
  ```typescript
  // Store: user, restSessions, userPreferences, subscription
  interface AppStore {
    user: User | null;
    restSessions: RestSession[];
    userPreferences: UserPreferences;
    subscription: SubscriptionStatus;
    // actions...
  }
  ```

### Offline-first & Data Sync
**Dexie.js (IndexedDB 래퍼)**
- **선택 이유**:
  - 쿼리 API 강력 (SQL like syntax)
  - TypeScript 지원
  - 50MB 기본 용량 (5년 아카이브 저장 가능)
- **사용 시나리오**:
  - 오프라인 모드: IndexedDB에서 읽기/쓰기
  - 온라인 복구: Supabase와 병합 동기화 (timestamp 기준)
  - 로컬 우선: 빠른 응답성 (UI 최우선)

**Data Sync Strategy**:
```
┌─────────────────────────────────────────┐
│ MongCount 데이터 레이어 구조            │
├─────────────────────────────────────────┤
│ UI Component (Zustand state)            │
│       ↓ (subscribe)                     │
│ IndexedDB (Dexie.js) [Local]            │
│       ↓ (batch sync, 5분 간격)          │
│ Supabase (PostgreSQL) [Cloud]           │
│       ↓ (Real-time, Paid P4)            │
│ 다른 디바이스 [Multi-device]            │
└─────────────────────────────────────────┘
```

### Service Worker & PWA
**Serwist (Service Worker 라이브러리)**
- **선택 이유**:
  - App Router 친화적 (next/pwa 보다 유연)
  - Offline routing, cache strategy 세밀 제어
  - 타이머 백그라운드 실행 (critical)
- **구현 내용**:
  - Pre-cache: HTML/CSS/JS 정적 번들
  - Runtime cache: API 응답 (stale-while-revalidate)
  - Background sync: 오프라인 쓰기 큐 (Supabase 복귀 시 반영)
  - Periodic sync: 주기적 동기화 (5분)

**Manifest & PWA Setup**:
```json
{
  "name": "MongCount",
  "short_name": "쉼일지",
  "description": "쉬어야 일이 잘 풀려",
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Notifications
**Web Push API + VAPID**
- **Android (Chrome/Edge)**:
  - FCM (Firebase Cloud Messaging) + Web Push
  - 신뢰성: 95%+
- **iOS (Safari 16.4+)**:
  - APNS (Apple Push Notification service) + Web Push
  - **홈화면 추가 필수** (앱 메타포)
  - 신뢰성: 70% (배터리 최적화로 인한 지연 가능)
  - 온보딩 S7에서 강제 가이드 필수

**Fallback**:
- App 내 알림 (LocalNotification API)
- 시간대별 로컬 타이머 + 음성/haptics

**구현**:
```typescript
// VAPID 퍼블릭 키 (환경변수)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY;

// 구독 요청
async function subscribeNotification() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });
  // Supabase에 저장
}
```

---

## 2. Backend Stack (Supabase)

### Database
**PostgreSQL (Supabase 관리형)**
- **선택 이유**:
  - RDBMS (관계 쿼리 필요)
  - Supabase 기본 제공 (별도 구성 X)
  - 확장성 우수 (MAU 50K+ 까지 무료)

### Schema Overview

```typescript
// Table: users
interface User {
  id: string;               // UUID (Auth 기본키)
  email: string;            // OAuth 이메일
  name?: string;            // 사용자명
  avatar_url?: string;      // 프로필 사진
  timezone: string;         // 'Asia/Seoul'
  dark_mode: 'system' | 'light' | 'dark';
  locale: 'ko' | 'en';
  subscription_status: 'free' | 'trial' | 'paid';
  trial_ends_at?: timestamp;
  paid_until?: timestamp;
  created_at: timestamp;
  updated_at: timestamp;
}

// Table: rest_sessions
interface RestSession {
  id: string;               // UUID
  user_id?: string;         // null = 로컬 유저
  started_at: timestamp;
  ended_at: timestamp;
  duration_sec: number;
  planned_duration_sec: number;  // 180/300/600
  clarity_score: 1|2|3|4|5|null;  // ☁︎~☀︎
  note?: string;            // 한 줄 기록 (최대 280자)
  interruption_reason?: string;
  slot: 'morning'|'mid-morning'|'post-lunch'|'afternoon'|'post-dinner'|'night'|'quick';
  created_at: timestamp;
  synced_at?: timestamp;    // 마지막 동기화 시각
}

// Table: idea_records (구조 동일, 향후 음성/사진)
interface IdeaRecord {
  id: string;
  user_id?: string;
  session_id: string;       // rest_sessions FK
  content: string;          // 텍스트 또는 음성 전사
  media_url?: string;       // Supabase Storage URL (Paid P2)
  media_type: 'text'|'voice'|'image';
  created_at: timestamp;
}

// Table: notification_subscriptions
interface NotificationSubscription {
  id: string;
  user_id: string;          // users FK
  device_id: string;        // 브라우저/디바이스 식별자
  endpoint: string;         // Push subscription endpoint
  auth: string;             // 암호화 키
  p256dh: string;           // ECDH 공개키
  timezone: string;         // 디바이스별 타임존
  is_active: boolean;
  last_verified_at: timestamp;
  created_at: timestamp;
}

// Table: subscriptions (Paid 모델)
interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'trial'|'active'|'canceled'|'past_due';
  tier: 'free'|'paid';
  trial_starts_at?: timestamp;
  trial_ends_at?: timestamp;
  billing_period_start: timestamp;
  billing_period_end: timestamp;
  auto_renew: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}

// Table: user_preferences
interface UserPreferences {
  id: string;
  user_id: string;
  notification_times: string[]; // ['08:30', '10:30', ...]
  snooze_count: 0|1|2|3;  // 스누즈 횟수 (일일 리셋)
  soft_streak_count: number; // 현재 Soft Streak (3/6 기준)
  last_session_date: date;  // Streak 유지 판정용
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Authentication
**Supabase Auth + OAuth**
- **Google OAuth**: Supabase 기본 제공
  - Callback URL: `https://mongcount.app/auth/callback`
- **Kakao OAuth**: Supabase Edge Function (커스텀)
  - Kakao REST API 호출
  - 액세스 토큰 → Supabase 사용자 생성/업데이트
  - [구현 예시 문서](./04-tech-stack-oauth-detail.md)

**로컬 유저**:
- 로그인 없이도 IndexedDB에 기록 저장 가능
- `device_id` (localStorage)로 기기 식별
- 로그인 시 계정에 병합

### Real-time & Sync
**Supabase Realtime (Paid P4)**
- **사용 시나리오**: 멀티 디바이스 동기화
- **구현**:
  ```typescript
  const subscription = supabase
    .channel('rest_sessions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rest_sessions' },
      (payload) => {
        // 다른 디바이스에서 INSERT/UPDATE → 현재 디바이스에 반영
        store.addRestSession(payload.new);
      }
    )
    .subscribe();
  ```
- **한계**: 최대 3대 기기 동시 동기화 (Paid 티어)

### Storage
**Supabase Storage (Paid P2)**
- **음성 녹음**: `audio/{user_id}/{session_id}.webm` (Max 5분, ~3MB)
- **사진**: `images/{user_id}/{session_id}/{index}.jpg` (Max 5MB)
- **접근제어**: Row-level Security (RLS) 자동
- **비용**: GB당 $0.05 (MAU 1,000 시 월 ~$0.5)

---

## 3. Data Model (TypeScript)

```typescript
// packages/types/index.ts

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  timezone: string;
  dark_mode: 'system' | 'light' | 'dark';
  locale: 'ko' | 'en';
  created_at: Date;
  updated_at: Date;
}

export interface RestSession {
  id: string;
  userId: string | null;  // null = 로컬 유저
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  plannedDurationSec: number;  // 180/300/600
  clarityScore: 1 | 2 | 3 | 4 | 5 | null;  // ☁︎~☀︎
  note: string | null;  // 한 줄 기록 (최대 280자)
  interruptionReason: string | null;
  slot: 'morning' | 'mid-morning' | 'post-lunch' | 
        'afternoon' | 'post-dinner' | 'night' | 'quick';
  createdAt: Date;
  syncedAt: Date | null;
}

export interface IdeaRecord {
  id: string;
  userId: string | null;
  sessionId: string;
  content: string;
  mediaUrl?: string;  // Supabase Storage URL
  mediaType: 'text' | 'voice' | 'image';
  createdAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notificationTimes: string[];  // ['08:30', '10:30', ...]
  timezone: string;
  darkMode: 'system' | 'light' | 'dark';
  locale: 'ko' | 'en';
  snoozeCount: 0 | 1 | 2 | 3;
  softStreakCount: number;
  lastSessionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionStatus {
  tier: 'free' | 'paid';
  status: 'active' | 'trial' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  paidUntil?: Date;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  deviceId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
}
```

---

## 4. PWA Implementation

### Service Worker (Serwist)

```typescript
// app/sw.ts (Serwist 설정)
import { defaultCache, imageCache } from 'serwist';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  clientsClaim: true,
  skipWaiting: true,
  precacheAndRoute: [
    // precache 목록 (build time 자동 생성)
  ],
  runtimeCaching: [
    ...defaultCache,  // HTML/JS/CSS
    imageCache,       // 이미지 파일
    {
      // API 응답 캐싱
      matcher: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7  // 7일
        }
      }
    }
  ],
  // Background sync (오프라인 쓰기)
  // 별도 플러그인 또는 custom handler
});

serwist.addEventListeners();
```

### Manifest (public/manifest.json)

```json
{
  "name": "MongCount - 쉼일지",
  "short_name": "쉼일지",
  "description": "쉬어야 일이 잘 풀려. 하루 6번 쉼으로 머리를 맑게.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### iOS 홈화면 추가 (메타 태그)

```html
<!-- app/layout.tsx (head) -->
<meta name="apple-mobile-web-app-capable" content="true" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="쉼일지" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

**iOS PWA Push 조건**:
- Safari 16.4+
- 홈화면에 추가 필수 (홈화면 아이콘으로만 푸시 가능)
- HTTPS 필수 (localhost 제외)
- 온보딩에서 강제 안내

---

## 5. OAuth 구현

### Google OAuth (기본)

```typescript
// app/auth/callback/google/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/home', request.url));
}
```

### Kakao OAuth (Edge Function)

```typescript
// supabase/functions/kakao-auth/index.ts
import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  const { code } = await req.json();

  // 1. Kakao 토큰 교환
  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: Deno.env.get('KAKAO_CLIENT_ID')!,
      redirect_uri: 'https://mongcount.app/auth/kakao',
      code,
    }),
  });

  const { access_token } = await tokenRes.json();

  // 2. 사용자 정보 조회
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { id, kakao_account } = await userRes.json();

  // 3. Supabase 사용자 생성/업데이트
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data } = await supabase.auth.admin.createUser({
    email: `kakao_${id}@mongcount.app`,
    email_confirm: true,
    user_metadata: {
      provider: 'kakao',
      kakao_id: id,
      name: kakao_account?.profile?.nickname,
      avatar: kakao_account?.profile?.profile_image_url,
    },
  });

  return new Response(JSON.stringify(data), { status: 200 });
};
```

---

## 6. iOS PWA Tradeoffs & 대응

### 제약사항

| 항목 | iOS PWA | Native App |
|------|---------|-----------|
| 푸시 알림 | 홈화면 추가 필수 | 자동 |
| 신뢰성 | 70% (배터리 최적화) | 95%+ |
| 위젯 | ❌ 미지원 | ✅ |
| 잠금화면 | ❌ 미지원 | ✅ |
| 백그라운드 실행 | 제한적 | ✅ |

### 대응 전략

**1. 온보딩에서 강제 가이드**
```markdown
[S7-2] 알림 권한 허용 후
  "iPhone에서 알림을 받으려면..."
  [스크린샷 이미지 + 텍스트]
  - 홈 버튼 → 공유 → "홈화면에 추가"
  - "쉼일지" 앱 이제 홈화면에 아이콘 생성
  - 홈화면의 앱에서만 푸시 알림 수신
```

**2. 앱 내 로컬 알림 폴백**
```typescript
// app/hooks/useNotifications.ts
export function useNotifications() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      // iOS < 16.4 또는 홈화면 미추가: 로컬 타이머
      setupLocalNotificationFallback();
    }
  }, []);
}

function setupLocalNotificationFallback() {
  const notificationTimes = ['08:30', '10:30', '13:00', '15:30', '19:00', '22:00'];
  
  // 매 분마다 체크
  setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (notificationTimes.includes(currentTime)) {
      // 로컬 Notification 또는 음성 알림
      showLocalNotification('5분 숨 고르고 가요');
    }
  }, 60000);  // 1분 간격
}
```

**3. 설정에서 PWA 재설치 가이드**
```typescript
// app/settings/page.tsx
<Card>
  <h3>알림 설정</h3>
  <p>iOS에서 푸시 알림을 받으려면</p>
  <Button onClick={openPWAGuide}>
    홈화면에 추가하기
  </Button>
</Card>
```

---

## 7. Cost Analysis

### Infrastructure Cost (MAU 기준)

| MAU | Vercel | Supabase | Stripe | 월 합계 |
|-----|--------|----------|--------|---------|
| 1K | Free | Free | Free | $0 |
| 5K | Free | Free | Free | $0 |
| 10K | Free | $15 | $10 | $25 |
| 50K | $20 | $60 | $50 | $130 |
| 100K+ | Custom | Custom | Custom | $300+ |

### Freemium Revenue Model

```
MAU 10,000 × 유료전환율 4% = 400명
400명 × ₩2,900/월 = ₩1,160,000/월 수익
인프라 비용: ~$25 (~₩30,000)
순수익: ~₩1,130,000/월
```

**사이드 프로젝트 기준**: 월 ₩100만 정도면 운영 가능
**풀타임 전환 조건**:
- MAU 50K 이상
- 유료전환율 5% 이상
- 가격 인상: ₩4,900/월
- 월 수익: ₩967,500 (인프라 ₩130,000 제외 후 ₩837,500)

---

## 8. Observability & Monitoring

### Error Tracking (Sentry)

```typescript
// app/_app.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Behavioral Analytics (PostHog)

```typescript
// app/hooks/useAnalytics.ts
import { usePostHog } from 'posthog-js/react';

export function useAnalytics() {
  const posthog = usePostHog();

  return {
    trackSessionStart: () => posthog.capture('session_started'),
    trackSessionComplete: (clarity: number) => 
      posthog.capture('session_completed', { clarity }),
    trackPaidConversion: (tier: string) =>
      posthog.capture('paid_conversion', { tier }),
  };
}
```

### Performance Monitoring

```typescript
// pages/_app.tsx
useEffect(() => {
  // Core Web Vitals
  import('web-vitals').then(({ onLCP, onFID, onCLS, onFCP, onINP }) => {
    onLCP(console.log);
    onFID(console.log);
    onCLS(console.log);
    onFCP(console.log);
    onINP(console.log);
  });
}, []);
```

---

## 9. Deployment & CI/CD

### Vercel (Frontend + API Routes)

```yaml
# vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_KEY",
    "NEXT_PUBLIC_VAPID_KEY"
  ]
}
```

**Deployment Flow**:
1. GitHub push → Vercel webhook
2. `next build` (5-10분)
3. Auto-deploy to staging/production
4. Instant SSL (Vercel 제공)

### Supabase (Database + Auth)

**Managed Service**: 배포 불필요
- PostgreSQL 자동 백업 (일일)
- Replication (HA 모드, 고급 요금제)

### Database Migrations

```bash
# Supabase CLI
supabase migration new create_rest_sessions
# → migrations/20240416_create_rest_sessions.sql

# 로컬 테스트
supabase db push

# 프로덕션 배포
supabase db push --linked
```

---

## 10. Security Best Practices

### Environment Variables (민감도별)

```env
# .env.local (로컬, 버전 관리 제외)
SUPABASE_SERVICE_ROLE_KEY=...

# .env.example (공개, 버전 관리 포함)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=...
```

### CORS & CSP

```typescript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
  ],
};
```

### HTTPS & HSTS

- Vercel: 자동 HTTPS + HSTS 헤더
- PWA: HTTPS 필수 (localhost 제외)

---

## 11. Reference Docs

- PRD: `../planning/01-prd.md`
- 기능 명세: `../planning/02-features.md`
- 사용자 흐름: `../planning/03-user-flows.md`
- 로드맵: `../planning/05-roadmap.md`
- 화면 설계: `../planning/06-screens.md`
