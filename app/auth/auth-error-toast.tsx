"use client";

import { useEffect, useState } from "react";

import { Toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  no_code: {
    title: "로그인 실패",
    message: "인증 코드를 받지 못했어요. 다시 시도해 주세요.",
  },
  exchange_failed: {
    title: "로그인 실패",
    message: "인증 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
  },
  provider_not_configured: {
    title: "로그인 준비 중",
    message: "이 로그인 방법은 아직 준비 중이에요. 잠시 후 다시 시도해 주세요.",
  },
  default: {
    title: "로그인 실패",
    message: "로그인 중 문제가 발생했어요. 다시 시도해 주세요.",
  },
};

export function AuthErrorToast() {
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) {
      setError(ERROR_MESSAGES[authError] ?? ERROR_MESSAGES.default);
      params.delete("auth_error");
      params.delete("auth");
      const next = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState(null, "", next);
    }
  }, []);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
      <Toast title={error.title} message={error.message} />
    </div>
  );
}
