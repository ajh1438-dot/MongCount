"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { startOAuthSignIn } from "@/lib/supabase/auth";

interface S8LoginScreenProps {
  redirectTo: string;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3C6.48 3 2 6.58 2 11c0 2.53 1.47 4.79 3.77 6.3l-.96 3.55c-.09.32.26.58.54.39l4.07-2.71c.84.14 1.71.22 2.58.22 5.52 0 10-3.58 10-8s-4.48-8-10-8v2.25z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

export function S8LoginScreen({ redirectTo }: S8LoginScreenProps) {
  const [pendingProvider, setPendingProvider] = useState<"google" | "kakao" | null>(null);

  async function handleOAuth(provider: "google" | "kakao") {
    setPendingProvider(provider);
    const { error } = await startOAuthSignIn(provider, redirectTo);
    if (error) {
      setPendingProvider(null);
      window.location.href = `/?auth_error=exchange_failed`;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-6">
      <section className="rounded-[28px] border bg-surface px-6 py-8 shadow-sm">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">쉼일지</p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">로그인</h1>
            <p className="text-sm leading-6 text-muted">
              로그인하면 여러 기기에서 기록이 이어져요. <br />이 기기에서만 써도 괜찮아요.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={pendingProvider !== null}
            onClick={() => handleOAuth("google")}
            aria-label="Google 계정으로 로그인"
          >
            <span className="flex items-center justify-center gap-2">
              <GoogleIcon />
              {pendingProvider === "google" ? "로그인 중…" : "Google로 로그인"}
            </span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled
            aria-label="카카오 로그인 준비중"
          >
            <span className="flex items-center justify-center gap-2 text-muted">
              <KakaoIcon />
              Kakao로 로그인 (준비중)
            </span>
          </Button>

          <div className="flex items-center gap-3 py-1 text-xs text-muted">
            <div className="h-px flex-1 bg-border" />
            <span>또는</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form action="/auth/local-only" method="post">
            <Button type="submit" variant="tertiary" fullWidth aria-label="로그인하지 않고 계속">
              로그인하지 않고 계속
            </Button>
          </form>

          <div className="space-y-2 pt-4 text-center">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">로그인</span> — 여러 기기에서 기록이 이어져요
            </p>
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">비로그인</span> — 이 기기에서만 기록돼요
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
