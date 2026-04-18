import { headers } from "next/headers";
import Link from "next/link";

import { NotificationSlotToggles } from "@/components/settings/notification-slot-toggles";
import { SettingsAuthSection } from "@/components/settings/settings-auth-section";
import { ThemeModeControls } from "@/components/theme/theme-mode-controls";
import { ThemeModeSync } from "@/components/theme/theme-mode-sync";
import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/ui/info-card";
import { getCurrentUserProfile } from "@/lib/supabase/auth.server";

function getAuthCallbackUrl(host: string | null) {
  if (!host) {
    return "http://127.0.0.1:3000/auth/callback";
  }

  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}/auth/callback`;
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUserProfile();
  const host = (await headers()).get("host");
  const resolvedSearchParams = (await searchParams) ?? {};
  const authState = readSearchParam(resolvedSearchParams.auth);
  const savedState = readSearchParam(resolvedSearchParams.saved);
  const redirectTo = getAuthCallbackUrl(host);
  const isLocalOnly = !user || user.provider === "local_only";
  const savedMessage = savedState === "settings" ? "설정을 저장했어요." : null;
  const signedOutMessage = authState === "signed_out" ? "로그아웃되었어요. 이 기기에는 로컬 기록이 그대로 남아 있어요." : null;

  return (
    <>
      <header className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
        <h1 className="text-3xl font-semibold tracking-tight">설정</h1>
        <p className="text-sm text-muted">알림, 화면, 계정을 관리해요.</p>
      </header>

      <section className="space-y-6">
        {savedMessage ? (
          <div role="status" className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {savedMessage}
          </div>
        ) : null}

        {signedOutMessage ? (
          <div role="status" className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
            {signedOutMessage}
          </div>
        ) : null}

        <InfoCard title="알림" description="각 시간을 눌러 편집하고, 토글로 켜고 꺼요.">
          <div className="space-y-3">
            <NotificationSlotToggles />
            <p className="text-xs text-muted">변경 사항은 바로 저장돼요.</p>
          </div>
        </InfoCard>

        <InfoCard title="디스플레이" description="포레스트·라이트·다크 모드를 선택할 수 있어요.">
          <div className="space-y-3">
            <ThemeModeSync />
            <ThemeModeControls />
            <p className="text-sm text-muted">화면 모드는 선택 즉시 적용되고 저장돼요.</p>
          </div>
        </InfoCard>

        <InfoCard title="계정" description={user ? user.email ?? "연결된 계정" : "로그인하면 클라우드 동기화를 사용할 수 있어요."}>
          {isLocalOnly ? (
            <div className="space-y-3">
              <SettingsAuthSection redirectTo={redirectTo} />

              <form action="/auth/local-only" method="post">
                <Button type="submit" variant="tertiary" fullWidth>
                  로그인하지 않고 계속
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-muted">
              <p>현재 계정: {user.provider === "google" ? "Google" : user.provider === "kakao" ? "카카오" : "로컬"}</p>
              <form action="/auth/logout" method="post">
                <Button type="submit" variant="tertiary">
                  로그아웃
                </Button>
              </form>
              <div className="rounded-xl bg-muted/10 px-4 py-3 text-left text-sm">
                <p className="font-medium text-foreground">계정 삭제는 아직 준비 중이에요.</p>
                <p className="mt-1 text-muted">이 화면에서는 삭제가 실행되지 않으며, 정식 플로우가 준비되면 여기에서 다시 안내할게요.</p>
              </div>
            </div>
          )}
        </InfoCard>

        <InfoCard title="업그레이드" description="프리미엄 기능과 결제 상태를 여기서 확인해요.">
          <div className="space-y-3">
            <Link
              href="/paywall?source=settings"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground shadow-sm"
            >
              업그레이드
            </Link>
            <p className="text-sm text-muted">프리미엄에서는 월간 리포트와 무제한 아카이브가 열려요.</p>
          </div>
        </InfoCard>

        <InfoCard title="기타">
          <div className="flex flex-col gap-0 text-sm">
            <a href="mailto:feedback@mongcount.app" className="inline-flex min-h-9 items-center underline underline-offset-4">
              피드백 보내기
            </a>
            <Link href="/settings/privacy" className="inline-flex min-h-9 items-center underline underline-offset-4">
              개인정보 정책
            </Link>
            <Link href="/settings/terms" className="inline-flex min-h-9 items-center underline underline-offset-4">
              이용약관
            </Link>
            <Link href="/onboarding" className="inline-flex min-h-9 items-center underline underline-offset-4">
              온보딩 다시 보기
            </Link>
            <p className="mt-1 text-muted">쉼일지 v1.0.0</p>
          </div>
        </InfoCard>
      </section>
    </>
  );
}
