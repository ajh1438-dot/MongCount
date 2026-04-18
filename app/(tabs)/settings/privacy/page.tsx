import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <header className="mb-6 space-y-1">
        <Link href="/settings" className="text-sm text-muted underline underline-offset-4">
          설정으로 돌아가기
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">개인정보 정책</h1>
      </header>

      <article className="space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">수집 항목</h2>
          <p>이메일, 닉네임, 휴식 세션 기록을 저장합니다. 그 외 개인정보는 수집하지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">사용 목적</h2>
          <p>수집한 정보는 앱 서비스 제공과 개인화에만 사용하며, 제3자에게 판매하거나 공유하지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">보관 및 삭제</h2>
          <p>데이터는 Supabase(한국 리전)에 암호화되어 저장됩니다. 계정 삭제 기능은 현재 준비 중이며, 삭제 요청은 feedback@mongcount.app으로 문의해 주세요.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">연락처</h2>
          <p>개인정보 관련 문의: feedback@mongcount.app</p>
        </section>

        <p className="text-xs text-muted">최종 업데이트: 2026년 4월</p>
      </article>
    </>
  );
}
